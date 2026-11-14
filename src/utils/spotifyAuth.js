require("dotenv").config({ quiet: true });

const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const https = require("https");

const STATE_LIFETIME_MS = 10 * 60 * 1000;
const refreshes = new Map();
const SCOPES = [
    "ugc-image-upload",
    "user-read-recently-played",
    "user-top-read",
    "user-read-playback-position",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "app-remote-control",
    "playlist-modify-public",
    "playlist-modify-private",
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-follow-modify",
    "user-follow-read",
    "user-library-modify",
    "user-library-read",
    "user-read-email",
    "user-read-private",
    "streaming",
];

function getCredentials() {
    delete require.cache[require.resolve("dotenv")];
    require("dotenv").config({ quiet: true, override: true });

    const { SPOTIFY_CLIENT_ID: clientId, SPOTIFY_CLIENT_SECRET: clientSecret } = process.env;

    if (!clientId || !clientSecret) {
        throw new Error("Spotify app credentials are not configured. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.");
    }

    return { clientId, clientSecret };
}

function getRedirectUri() {
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
    if (!redirectUri) {
        throw new Error("Set SPOTIFY_REDIRECT_URI to the public Spotify callback URL in .env.");
    }

    const redirect = new URL(redirectUri);
    const isLoopback =
        redirect.hostname === "127.0.0.1" || redirect.hostname === "[::1]" || redirect.hostname === "::1";
    if (
        (redirect.protocol !== "https:" && !(isLoopback && redirect.protocol === "http:")) ||
        redirect.username ||
        redirect.password ||
        redirect.search ||
        redirect.hash
    ) {
        throw new Error(
            "SPOTIFY_REDIRECT_URI must be an HTTPS URL (HTTP is allowed only for a loopback address), without credentials, query, or fragment.",
        );
    }

    return redirect;
}

function createAuthorizationUrl(twitchUserId, twitchChannel) {
    const { clientId } = getCredentials();
    const redirect = getRedirectUri();
    const state = crypto.randomBytes(32).toString("base64url");
    mCache.set(
        `spotify:auth:state:${state}`,
        { twitchUserId: String(twitchUserId), twitchChannel },
        STATE_LIFETIME_MS / 1000,
    );

    const authorizationUrl = new URL("https://accounts.spotify.com/authorize");
    authorizationUrl.search = new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        redirect_uri: redirect.toString(),
        scope: SCOPES.join(" "),
        state,
    }).toString();

    return authorizationUrl.toString();
}

async function getAccessToken(twitchUserId) {
    const userId = String(twitchUserId);
    const account = db.get(
        "SELECT access_token, refresh_token, expires_at, scope FROM spotify_accounts WHERE twitch_user_id = ?",
        [userId],
    );
    if (!account) {
        throw new Error("Spotify is not connected. Use `spotify auth` to connect your account.");
    }

    if (account.access_token && account.expires_at > Date.now() + 60_000) {
        return account.access_token;
    }

    if (!account.refresh_token) {
        throw new Error("Spotify access has expired. Use `spotify auth` to reconnect your account.");
    }

    if (!refreshes.has(userId)) {
        const refresh = refreshAccessToken(userId, account);
        refreshes.set(userId, refresh);
        refresh.then(
            () => refreshes.delete(userId),
            () => refreshes.delete(userId),
        );
    }

    return refreshes.get(userId);
}

async function refreshAccessToken(userId, account) {
    const { clientId, clientSecret } = getCredentials();
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: account.refresh_token,
        }),
    });
    const result = await response.json();

    if (!response.ok || !result.access_token) {
        throw new Error(
            `Spotify token refresh failed (${result.error_description || result.error || response.status}).`,
        );
    }

    if (!Number.isFinite(result.expires_in) || result.expires_in <= 0) {
        throw new Error("Spotify refresh response did not include a valid expiration");
    }

    db.run(
        `UPDATE spotify_accounts
         SET access_token = ?, refresh_token = ?, expires_at = ?, scope = ?, updated_at = ?
         WHERE twitch_user_id = ?`,
        [
            result.access_token,
            result.refresh_token || account.refresh_token,
            Date.now() + result.expires_in * 1000,
            result.scope || account.scope,
            Date.now(),
            userId,
        ],
    );
    return result.access_token;
}

async function exchangeCode(code, twitchUserId, redirectUri) {
    const { clientId, clientSecret } = getCredentials();
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
        }),
    });
    const result = await response.json();

    if (!response.ok || !result.access_token || !result.refresh_token) {
        throw new Error(
            `Spotify authorization failed (${result.error_description || result.error || response.status}).`,
        );
    }

    if (!Number.isFinite(result.expires_in) || result.expires_in <= 0) {
        throw new Error("Spotify authorization response did not include a valid expiration");
    }

    global.db.run(
        `INSERT INTO spotify_accounts
         (twitch_user_id, access_token, refresh_token, expires_at, scope, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(twitch_user_id) DO UPDATE SET
             access_token = excluded.access_token,
             refresh_token = excluded.refresh_token,
             expires_at = excluded.expires_at,
             scope = excluded.scope,
             updated_at = excluded.updated_at`,
        [
            String(twitchUserId),
            result.access_token,
            result.refresh_token,
            Date.now() + result.expires_in * 1000,
            result.scope || null,
            Date.now(),
        ],
    );
}

function sendResponse(response, status, message) {
    response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(message);
}

function createCallbackServer(redirect) {
    const serverOptions = {};
    const keyPath = process.env.SPOTIFY_TLS_KEY_PATH;
    const certPath = process.env.SPOTIFY_TLS_CERT_PATH;
    if (Boolean(keyPath) !== Boolean(certPath)) {
        throw new Error("Set both SPOTIFY_TLS_KEY_PATH and SPOTIFY_TLS_CERT_PATH, or neither.");
    }

    if (keyPath && certPath) {
        serverOptions.key = fs.readFileSync(keyPath);
        serverOptions.cert = fs.readFileSync(certPath);
    }

    const handler = async (request, response) => {
        let callback;
        try {
            callback = new URL(request.url, redirect.origin);
        } catch {
            sendResponse(response, 400, "Invalid callback URL");
            return;
        }

        if (callback.pathname !== redirect.pathname) {
            sendResponse(response, 404, "Not found");
            return;
        }

        if (request.method !== "GET") {
            sendResponse(response, 405, "Method not allowed");
            return;
        }

        const state = callback.searchParams.get("state");
        if (!state) {
            sendResponse(response, 400, "Missing OAuth state");
            return;
        }

        const stateKey = `spotify:auth:state:${state}`;
        const pending = mCache.get(stateKey);
        if (!pending) {
            sendResponse(response, 400, "This Spotify authorization link is invalid or expired");
            return;
        }
        mCache.delete(stateKey);

        const authorizationError = callback.searchParams.get("error");
        if (authorizationError) {
            sendResponse(response, 400, "Spotify authorization was denied. You can close this tab.");
            logger.warn(`Spotify authorization denied for Twitch user ${pending.twitchUserId}`);
            return;
        }

        const code = callback.searchParams.get("code");
        if (!code) {
            sendResponse(response, 400, "Spotify did not return an authorization code");
            return;
        }

        try {
            await exchangeCode(code, pending.twitchUserId, redirect.toString());
            sendResponse(
                response,
                200,
                "Spotify authorization saved for your Twitch account. You can close this tab.",
            );
            logger.info(`Spotify authorization saved for Twitch user ${pending.twitchUserId}`);
            try {
                const { client } = require("../../src/client.js");
                await client.privmsg(
                    pending.twitchChannel,
                    "/me Spotify authorization saved. Your account is linked.",
                );
            } catch (error) {
                logger.error("Failed to announce Spotify authorization in chat:", error);
            }
        } catch (error) {
            logger.error("Spotify callback failed:", error);
            sendResponse(response, 500, "Spotify authorization could not be saved. Check the bot logs.");
        }
    };

    return serverOptions.key ? https.createServer(serverOptions, handler) : http.createServer(handler);
}

function startCallbackServer() {
    if (!process.env.SPOTIFY_REDIRECT_URI) {
        logger.warn("Spotify callback listener disabled: SPOTIFY_REDIRECT_URI is not configured");
        return null;
    }

    const redirect = getRedirectUri();
    const requestedPort = Number(process.env.SPOTIFY_CALLBACK_PORT || redirect.port || 8888);
    if (!Number.isInteger(requestedPort) || requestedPort < 1 || requestedPort > 65535) {
        throw new Error("SPOTIFY_CALLBACK_PORT must be an integer between 1 and 65535");
    }

    const host = process.env.SPOTIFY_CALLBACK_HOST || "127.0.0.1";
    const server = createCallbackServer(redirect);
    server.on("error", (error) => logger.error("Spotify callback listener error:", error));
    server.listen(requestedPort, host, () => {
        logger.info(`Spotify callback listening on ${host}:${requestedPort}${redirect.pathname}`);
    });

    return server;
}

module.exports = {
    createAuthorizationUrl,
    getAccessToken,
    startCallbackServer,
};

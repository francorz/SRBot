module.exports = {
    name: "spotify",
    cooldown: 5000,
    aliases: ["spotifyauth"],
    description: "Connect or manage your personal Spotify account",
    level: 2,
    execute: async (msg, client, utils) => {
        const action = msg.args[0]?.toLowerCase();
        const twitchUserId = String(msg.user.id);

        if (action === "auth") {
            try {
                const authorizationUrl = utils.spotifyAuth.createAuthorizationUrl(
                    twitchUserId,
                    msg.channel.login,
                );

                logger.info(authorizationUrl);
                return;
            } catch (error) {
                logger.error("Spotify authorization setup failed:", error);
                return {
                    text: `/me ${error.message}`,
                    reply: true,
                };
            }
        }

        if (action === "status") {
            const account = db.get("SELECT expires_at FROM spotify_accounts WHERE twitch_user_id = ?", [
                twitchUserId,
            ]);
            return {
                text: account
                    ? `/me Spotify is connected • Expires in ${utils.humanize(account.expires_at - Date.now())}.`
                    : "/me Spotify is not connected. Use `spotify auth` to connect your account.",
                reply: true,
            };
        }

        if (action === "disconnect") {
            db.run("DELETE FROM spotify_accounts WHERE twitch_user_id = ?", [twitchUserId]);
            return {
                text: "/me Your Spotify account has been disconnected.",
                reply: true,
            };
        }

        return {
            text: "/me Usage: spotify auth | status | disconnect",
            reply: true,
        };
    },
};

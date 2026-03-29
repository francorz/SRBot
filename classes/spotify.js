const got = require("@esm2cjs/got").default;
const Updater = require("spotify-oauth-refresher");

class SpotifyAPI {
    constructor(clientId, clientSecret, accessToken, refreshToken) {
        this.api = new Updater({
            clientId,
            clientSecret,
        });
        this.api.setAccessToken(accessToken);
        this.api.setRefreshToken(refreshToken);
    }

    /**
     * Get the current user's profile
     * @returns {Promise<Object>} User profile data
     */
    async getMe() {
        const cacheKey = "spotify:me";
        const cached = mCache.get(cacheKey);

        if (cached) {
            return cached;
        }

        const response = await this.api.request({
            url: "https://api.spotify.com/v1/me",
            method: "get",
            authType: "bearer",
        });

        mCache.set(cacheKey, response, 300);
        return response;
    }

    /**
     * Get authorization headers
     * @returns {Promise<Object>} Authorization headers
     */
    async getAuthHeaders() {
        const me = await this.getMe();
        return {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: me.config.headers.Authorization,
        };
    }

    /**
     * Get the current playback state
     * @returns {Promise<Object|null>} Current playback data or null if nothing is playing
     */
    async getCurrentPlayback() {
        const headers = await this.getAuthHeaders();

        const response = await got.get("https://api.spotify.com/v1/me/player?additional_types=episode", {
            headers,
            timeout: { request: 5000 },
            retry: { limit: 1 },
        });

        if (response.body === "") {
            return null;
        }

        const data = JSON.parse(response.body);
        return data && data.item ? data : null;
    }

    /**
     * Get currently playing track
     * @returns {Promise<Object|null>} Currently playing track or null
     */
    async getCurrentTrack() {
        const playback = await this.getCurrentPlayback();
        return playback ? playback.item : null;
    }

    /**
     * Check if something is currently playing
     * @returns {Promise<boolean>} True if playing, false otherwise
     */
    async isPlaying() {
        const playback = await this.getCurrentPlayback();
        return playback ? playback.is_playing : false;
    }

    /**
     * Get user's recently played tracks
     * @param {number} limit - Number of tracks to return (max 50)
     * @returns {Promise<Object>} Recently played tracks
     */
    async getRecentlyPlayed(limit = 20) {
        const cacheKey = `spotify:recently_played:${limit}`;
        const cached = mCache.get(cacheKey);

        if (cached) {
            return cached;
        }

        const headers = await this.getAuthHeaders();

        const response = await got.get(`https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`, {
            headers,
            timeout: { request: 5000 },
            retry: { limit: 1 },
        });

        const data = JSON.parse(response.body);
        mCache.set(cacheKey, data, 30);
        return data;
    }

    /**
     * Get user's top tracks
     * @param {string} timeRange - 'short_term' (4 weeks), 'medium_term' (6 months), 'long_term' (years)
     * @param {number} limit - Number of tracks (max 50)
     * @returns {Promise<Object>} Top tracks
     */
    async getTopTracks(timeRange = "medium_term", limit = 20) {
        const cacheKey = `spotify:top_tracks:${timeRange}:${limit}`;
        const cached = mCache.get(cacheKey);

        if (cached) {
            return cached;
        }

        const headers = await this.getAuthHeaders();

        const response = await got.get(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`, {
            headers,
            timeout: { request: 5000 },
            retry: { limit: 1 },
        });

        const data = JSON.parse(response.body);
        mCache.set(cacheKey, data, 3600);
        return data;
    }

    /**
     * Get user's top artists
     * @param {string} timeRange - 'short_term' (4 weeks), 'medium_term' (6 months), 'long_term' (years)
     * @param {number} limit - Number of artists (max 50)
     * @returns {Promise<Object>} Top artists
     */
    async getTopArtists(timeRange = "medium_term", limit = 20) {
        const cacheKey = `spotify:top_artists:${timeRange}:${limit}`;
        const cached = mCache.get(cacheKey);

        if (cached) {
            return cached;
        }

        const headers = await this.getAuthHeaders();

        const response = await got.get(`https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}`, {
            headers,
            timeout: { request: 5000 },
            retry: { limit: 1 },
        });

        const data = JSON.parse(response.body);
        mCache.set(cacheKey, data, 3600);
        return data;
    }

    /**
     * Search for tracks, artists, albums, or playlists
     * @param {string} query - Search query
     * @param {string} type - 'track', 'artist', 'album', 'playlist' (comma-separated)
     * @param {number} limit - Number of results (max 50)
     * @returns {Promise<Object>} Search results
     */
    async search(query, type = "track", limit = 20) {
        const cacheKey = `spotify:search:${query}:${type}:${limit}`;
        const cached = mCache.get(cacheKey);

        if (cached) {
            return cached;
        }

        const headers = await this.getAuthHeaders();
        const encodedQuery = encodeURIComponent(query);

        const response = await got.get(`https://api.spotify.com/v1/search?q=${encodedQuery}&type=${type}&limit=${limit}`, {
            headers,
            timeout: { request: 5000 },
            retry: { limit: 1 },
        });

        const data = JSON.parse(response.body);
        mCache.set(cacheKey, data, 300); // Cache for 5 minutes
        return data;
    }

    /**
     * Get track details by ID
     * @param {string} trackId - Spotify track ID
     * @returns {Promise<Object>} Track details
     */
    async getTrack(trackId) {
        const cacheKey = `spotify:track:${trackId}`;
        const cached = mCache.get(cacheKey);

        if (cached) {
            return cached;
        }

        const headers = await this.getAuthHeaders();

        const response = await got.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers,
            timeout: { request: 5000 },
            retry: { limit: 1 },
        });

        const data = JSON.parse(response.body);
        mCache.set(cacheKey, data, 3600);
        return data;
    }

    /**
     * Get user's saved tracks
     * @param {number} limit - Number of tracks (max 50)
     * @param {number} offset - Offset for pagination
     * @returns {Promise<Object>} Saved tracks
     */
    async getSavedTracks(limit = 20, offset = 0) {
        const headers = await this.getAuthHeaders();

        const response = await got.get(`https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`, {
            headers,
            timeout: { request: 5000 },
            retry: { limit: 1 },
        });

        return JSON.parse(response.body);
    }

    /**
     * Start or resume playback
     * @param {string|Object} input - Track name/link, or options object
     * @param {string} input.deviceId - Device ID to play on
     * @param {string} input.contextUri - Spotify URI of album/playlist/artist
     * @param {Array<string>} input.uris - Array of track URIs to play
     * @param {number} input.positionMs - Position in milliseconds to start
     * @returns {Promise<Object|null>} Track info if single track, null otherwise
     */
    async play(input = null) {
        const headers = await this.getAuthHeaders();
        let options = {};
        let trackInfo = null;

        if (typeof input === "string") {
            const uri = await this._parseInput(input);
            if (!uri) {
                throw new Error("Could not find track");
            }

            const trackId = uri.split(":")[2];
            trackInfo = await this.getTrack(trackId);

            options = { uris: [uri] };
        } else if (input !== null) {
            options = input;

            if (options.uris && options.uris.length === 1) {
                const trackId = options.uris[0].split(":")[2];
                trackInfo = await this.getTrack(trackId);
            }
        }

        const { deviceId, contextUri, uris, positionMs } = options;

        const body = {};
        if (contextUri) body.context_uri = contextUri;
        if (uris) body.uris = uris;
        if (positionMs !== undefined) body.position_ms = positionMs;

        const url = deviceId ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}` : "https://api.spotify.com/v1/me/player/play";

        try {
            await got.put(url, {
                headers,
                json: body,
                timeout: { request: 5000 },
                retry: { limit: 1 },
            });

            return trackInfo;
        } catch (error) {
            if (error.response) {
                const status = error.response.statusCode;
                if (status === 404) {
                    throw new Error("No active device found or track not found");
                } else if (status === 403) {
                    throw new Error("Premium required or track not available in your region");
                } else if (status === 400) {
                    throw new Error("Invalid track URI or playback request");
                }
            }
            throw error;
        }
    }

    /**
     * Pause playback
     * @param {string} deviceId - Optional device ID
     * @returns {Promise<void>}
     */
    async pause(deviceId = null) {
        const headers = await this.getAuthHeaders();

        const url = deviceId ? `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}` : "https://api.spotify.com/v1/me/player/pause";

        await got.put(url, {
            headers,
            timeout: { request: 5000 },
            retry: { limit: 1 },
        });
    }

    /**
     * Skip to next track
     * @param {string} deviceId - Optional device ID
     * @returns {Promise<void>}
     */
    async next(deviceId = null) {
        const headers = await this.getAuthHeaders();

        const url = deviceId ? `https://api.spotify.com/v1/me/player/next?device_id=${deviceId}` : "https://api.spotify.com/v1/me/player/next";

        await got.post(url, {
            headers,
            timeout: { request: 5000 },
            retry: { limit: 1 },
        });
    }

    /**
     * Skip to previous track
     * @param {string} deviceId - Optional device ID
     * @returns {Promise<void>}
     */
    async previous(deviceId = null) {
        const headers = await this.getAuthHeaders();

        const url = deviceId
            ? `https://api.spotify.com/v1/me/player/previous?device_id=${deviceId}`
            : "https://api.spotify.com/v1/me/player/previous";

        await got.post(url, {
            headers,
            timeout: { request: 5000 },
            retry: { limit: 1 },
        });
    }

    /**
     * Set playback volume
     * @param {number} volumePercent - Volume level (0-100)
     * @param {string} deviceId - Optional device ID
     * @returns {Promise<void>}
     */
    async setVolume(volumePercent, deviceId = null) {
        if (volumePercent < 0 || volumePercent > 100) {
            throw new Error("Volume must be between 0 and 100");
        }

        const headers = await this.getAuthHeaders();

        const url = deviceId
            ? `https://api.spotify.com/v1/me/player/volume?volume_percent=${volumePercent}&device_id=${deviceId}`
            : `https://api.spotify.com/v1/me/player/volume?volume_percent=${volumePercent}`;

        await got.put(url, {
            headers,
            timeout: { request: 5000 },
            retry: { limit: 1 },
        });
    }

    /**
     * Add item to playback queue
     * @param {string} input - Track name, Spotify link, or URI
     * @param {string} deviceId - Optional device ID
     * @returns {Promise<void>}
     */
    async addToQueue(input, deviceId = null) {
        const uri = await this._parseInput(input);

        if (!uri) {
            throw new Error("Could not find track");
        }

        const trackId = uri.split(":")[2];
        const trackInfo = await this.getTrack(trackId);

        const headers = await this.getAuthHeaders();

        const url = deviceId
            ? `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(uri)}&device_id=${deviceId}`
            : `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(uri)}`;

        try {
            await got.post(url, {
                headers,
                timeout: { request: 5000 },
                retry: { limit: 1 },
            });
            return trackInfo;
        } catch (error) {
            if (error.response) {
                const status = error.response.statusCode;
                if (status === 404) {
                    throw new Error("No active device found or track not found");
                } else if (status === 403) {
                    throw new Error("Premium required or track not available in your region");
                } else if (status === 400) {
                    throw new Error("Invalid track URI or playback request");
                }
            }
            throw error;
        }
    }

    /**
     * Get the user's queue
     * @returns {Promise<Object>} Queue information
     */
    async getQueue() {
        const headers = await this.getAuthHeaders();

        const response = await got.get("https://api.spotify.com/v1/me/player/queue", {
            headers,
            timeout: { request: 5000 },
            retry: { limit: 1 },
        });

        const data = JSON.parse(response.body);
        return data;
    }

    /**
     * Parse input (track name, link, or URI) and return Spotify URI
     * @private
     * @param {string} input - Track name, link, or URI
     * @returns {Promise<string|null>} Spotify URI or null
     */
    async _parseInput(input) {
        if (input.startsWith("spotify:")) {
            return input;
        }

        const linkMatch = input.match(/open\.spotify\.com(?:\/intl-[a-z]{2})?\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
        if (linkMatch) {
            const [, type, id] = linkMatch;
            return `spotify:${type}:${id}`;
        }

        try {
            const searchResults = await this.search(input, "track", 1);
            if (searchResults.tracks && searchResults.tracks.items.length > 0) {
                return searchResults.tracks.items[0].uri;
            }
        } catch (error) {
            console.error("Search failed:", error);
        }

        return null;
    }
}

module.exports = { SpotifyAPI };

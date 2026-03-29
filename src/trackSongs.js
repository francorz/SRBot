const { client } = require("./client.js");
const format = require("format-duration");

let lastKnownTrackId = null;

/**
 * Check if track has changed and announce if it has
 * Called on every command execution for real-time updates
 */
async function checkTrackChange() {
    try {
        const currentState = await spotifyAPI.getCurrentPlayback();
        const currentTrack = currentState?.item;

        if (!currentTrack) {
            return;
        }

        if (lastKnownTrackId && lastKnownTrackId !== currentTrack.id) {
            const currentTrackPos = await db.queryOne(`SELECT position_in_queue FROM song_requests WHERE track_id = ?`, [currentTrack.id]);
            
            if (currentTrackPos) {
                await db.query(`DELETE FROM song_requests WHERE position_in_queue <= ?`, [currentTrackPos.position_in_queue]);
            }

            const currentSongInQueue = await db.query(`SELECT requested_by FROM song_requests WHERE track_id = ?`, [currentTrack.id]);

            const songArtists = currentTrack.artists?.length
                ? currentTrack.artists.map((artist) => artist.name).join(", ")
                : currentTrack.show
                ? `${currentTrack.show.name} (${currentTrack.show.publisher})`
                : "";

            const formattedDuration = currentTrack.duration_ms ? `[${format(currentTrack.duration_ms)}]` : "";

            const requestedBy = currentSongInQueue && currentSongInQueue.length > 0 ? ` (requested by ${currentSongInQueue[0].requested_by})` : "";

            const { is_live } = await db.queryOne("SELECT is_live FROM channels WHERE id = ?", [process.env.STREAMER_ID]);
            const { live_only } = await db.queryOne("SELECT live_only FROM settings WHERE command = ?", ["announcements"]);

            if (live_only === 0 || is_live === 1) {
                client.privmsg(
                    process.env.STREAMER_USERNAME,
                    `/me AlienDance Now playing: ${currentTrack.name} by ${songArtists} ${formattedDuration}${requestedBy}`
                );
            }

            const songs = await db.query(`SELECT id FROM song_requests ORDER BY requested_at ASC`);
            for (let i = 0; i < songs.length; i++) {
                await db.query(`UPDATE song_requests SET position_in_queue = ? WHERE id = ?`, [i + 1, songs[i].id]);
            }
        }

        lastKnownTrackId = currentTrack.id;
    } catch (error) {
        if (error.response?.statusCode !== 401) {
            logger.error("Track check error:", error.message);
        }
    }
}

module.exports = { checkTrackChange };

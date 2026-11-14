module.exports = {
    name: "skip",
    cooldown: 5000,
    aliases: ["next"],
    description: "Skip the currently playing Spotify track",
    level: 2,
    execute: async (msg, client, utils) => {
        try {
            const currentState = await spotifyAPI.getCurrentPlayback();
            const currentTrack = currentState?.item;

            if (!currentTrack) {
                return {
                    text: "/me No track is currently playing.",
                    reply: true,
                };
            }

            await spotifyAPI.next();

            const queuedSong = db.get(
                `SELECT id FROM song_requests WHERE track_id = ? ORDER BY requested_at ASC`,
                [currentTrack.id],
            );

            if (queuedSong) {
                await db.query(`DELETE FROM song_requests WHERE track_id = ?`, [currentTrack.id]);

                const remainingSongs = await db.query(`SELECT id FROM song_requests ORDER BY requested_at ASC`);
                for (let i = 0; i < remainingSongs.length; i++) {
                    await db.query(`UPDATE song_requests SET position_in_queue = ? WHERE id = ?`, [i + 1, remainingSongs[i].id]);
                }
            }

            const artists = currentTrack.artists?.length
                ? currentTrack.artists.map((artist) => artist.name).join(", ")
                : currentTrack.show
                  ? `${currentTrack.show.name} (${currentTrack.show.publisher})`
                  : "unknown artist";

            return {
                text: `/me AlienDance Skipped current track: ${currentTrack.name} by ${artists}`,
                reply: true,
            };
        } catch (e) {
            logger.error(e);
            return {
                text: `/me monkaS 🚫 ${e.constructor?.name}: ${e.message}.`,
                reply: true,
            };
        }
    },
};

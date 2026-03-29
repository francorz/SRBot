const format = require("format-duration");

module.exports = {
    name: "songrequest",
    cooldown: 3000,
    aliases: ["sr", "ssr"],
    description: `asd`,
    level: 1,
    execute: async (msg, client, utils) => {
        try {
            const trackInfo = await spotifyAPI.addToQueue(msg.args.join(" "));

            const songArtists = trackInfo.artists?.length ? trackInfo.artists.map((artist) => artist.name).join(", ") : "";

            const positionResult = await db.query(`SELECT COUNT(*) as count FROM song_requests`);
            const position = (positionResult[0]?.count || 0) + 1;

            await db.query(
                `INSERT INTO song_requests (track_id, track_name, artists, duration_ms, requested_by, position_in_queue) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [trackInfo.id, trackInfo.name, songArtists, trackInfo.duration_ms, msg.user.login, position]
            );

            return {
                text: `/me AlienDance Added to queueu: "${trackInfo.name}" by ${songArtists} [${format(trackInfo.duration_ms)}]`,
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

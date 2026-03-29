const format = require("format-duration");

module.exports = {
    name: "song",
    cooldown: 3000,
    aliases: ["s"],
    description: `asd`,
    level: 1,
    execute: async (msg, client, utils) => {
        try {
            const data = await spotifyAPI.getCurrentPlayback();
            const { item, is_playing, device } = data;
            const progress_ms = data?.progress_ms;

            if (!item) return null;

            const formattedProgress = progress_ms ? format(progress_ms) : null;
            const formattedDuration = item.duration_ms ? format(item.duration_ms) : null;
            const trackID = item?.id || null;
            const { requested_by } = await db.queryOne(
                `SELECT requested_by FROM song_requests WHERE track_id = ?`,
                [trackID],
            );
            const requestedBy = requested_by ? ` (requested by ${utils.unping(requested_by)})` : "";

            const songArtists = item.artists?.length
                ? ` by ${item.artists.map((artist) => artist.name).join(", ")}`
                : item.show
                  ? ` by ${item.show.name} (${item.show.publisher})`
                  : "";

            if (item.is_local) {
                return {
                    text: `/me ${msg.parsedArgs[0] ?? "AlienDance"} ${is_playing ? "▶" : "⏸️"} ${item.name}${songArtists} [${
                        formattedProgress ?? "0:00"
                    }/${formattedDuration}] (Local File)${requestedBy}`,
                    reply: true,
                };
            }

            const volumePercent = device?.volume_percent;
            let volumeInfo = "";

            if (device?.supports_volume) {
                const speakerEmoji =
                    volumePercent === 0
                        ? "🔇"
                        : volumePercent < 20
                          ? "🔈"
                          : volumePercent < 60
                            ? "🔉"
                            : "🔊";
                volumeInfo = `${speakerEmoji} ${volumePercent}%`;
            }

            return {
                text: `/me ${msg.parsedArgs[0] ?? "AlienDance"} ${is_playing ? "▶" : "⏸️"} ${item.name}${songArtists} [${
                    formattedProgress ?? "0:00"
                }/${formattedDuration}] ${item.external_urls?.spotify || ""} ${volumeInfo}${requestedBy}`,
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

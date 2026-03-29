const format = require("format-duration");

module.exports = {
    name: "queue",
    cooldown: 5000,
    aliases: ["q", "songlist"],
    description: `Show the song request queue`,
    level: 1,
    execute: async (msg, client, utils) => {
        try {
            const currentState = await spotifyAPI.getCurrentPlayback();
            const currentTrack = currentState?.item;
            const progressMs = currentState?.progress_ms || 0;

            const requests = await db.query(`SELECT * FROM song_requests ORDER BY requested_at ASC`);

            if (!requests || requests.length === 0) {
                return {
                    text: `/me The queue is empty!`,
                    reply: true,
                };
            }

            let cumulativeTime = 0;
            if (currentTrack) {
                cumulativeTime = currentTrack.duration_ms - progressMs;
            }

            const queueText = requests
                .map((song, index) => {
                    const timeUntilPlay = utils.humanize(cumulativeTime);
                    cumulativeTime += song.duration_ms;

                    return `${index + 1}. ${song.track_name} - ${song.artists} | Requested by: ${song.requested_by} | Duration: ${format(
                        song.duration_ms
                    )} | Plays in: ${timeUntilPlay === "0s" ? "now" : timeUntilPlay}`;
                })
                .join("\n");

            const header = `Song Request Queue (${requests.length} song${requests.length !== 1 ? "s" : ""})\n${"=".repeat(80)}\n`;
            const fullText = header + queueText;

            const pasteUrl = await utils.paste(fullText);

            return {
                text: `/me Song queue: ${pasteUrl}`,
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

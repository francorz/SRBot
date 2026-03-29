const simpleGit = require("simple-git");
const git = simpleGit();

module.exports = {
    name: "ping",
    cooldown: 5000,
    aliases: ["pang", "peng", "pong", "pung"],
    description: "Shows uptime and info about performance.",
    level: 1,
    execute: async (msg, client, utils) => {
        try {
            let upTime = utils.humanize(process.uptime().toFixed(0) * 1000);
            const t1 = performance.now();
            await client.ping();
            const t2 = performance.now();
            const ping = t2 - t1;
            let pingLatency = ping.toFixed(0);
            let ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
            const ghCommit = await getGit();

            return {
                text: `/me AlienDance 🏓 Pong! • Uptime: ${upTime} • Internal Delay: ${pingLatency}ms • RAM: ${ramUsage}MB • Version: ${ghCommit}`,
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

async function getGit() {
    try {
        const branch = await git.revparse(["--abbrev-ref", "HEAD"]);
        const commitHash = await git.revparse(["--short", "HEAD"]);
        return `${branch}@${commitHash}`;
    } catch (error) {
        return "No GitHub";
    }
}

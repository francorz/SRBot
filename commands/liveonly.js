const fs = require("fs");
const path = require("path");

module.exports = {
    name: "liveonly",
    cooldown: 3000,
    aliases: ["lo"],
    description: `:v`,
    level: 2,
    levelError: (msg) => `/me Only available for mods and above. Ask the broadcaster for mod with !setlevel ${msg.user.login} 2`,
    execute: async (msg, client, utils) => {
        try {
            const [commandName, status] = msg.args;

            if (!commandName) {
                return {
                    text: `/me Usage: !liveonly <command> <on|off>`,
                    reply: true,
                };
            }
            const command = await findCommand(commandName);
            const cmd = command?.name;

            if (!cmd) {
                return {
                    text: `/me FeelsDankMan Command not found.`,
                    reply: true,
                };
            }

            const existingCommand = await db.queryOne(`SELECT * FROM settings WHERE command = ?`, [
                cmd,
            ]);

            if (!status) {
                return {
                    text: `/me Command "${existingCommand.command}" is set to ${existingCommand.live_only === 1 ? `live only` : `always available`}.`,
                    reply: true,
                };
            }

            const liveOnlyValue = ["on", "1", "true"].includes(status.toLowerCase()) ? 1 : 0;

            await db.run(`UPDATE settings SET live_only = ? WHERE command = ?`, [
                liveOnlyValue,
                cmd,
            ]);

            return {
                text: `/me Command "${cmd}" set to ${liveOnlyValue ? "live only" : "always available"}`,
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

function findCommand(cmd) {
    const commandFiles = fs
        .readdirSync(path.join(__dirname, "../commands"))
        .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
        const commandPath = path.join(__dirname, "../commands", file);
        const command = require(commandPath);

        if (command.name === cmd || (command.aliases && command.aliases.includes(cmd))) {
            return command;
        }
    }
    return null;
}

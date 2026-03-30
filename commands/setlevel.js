module.exports = {
    name: "setlevel",
    cooldown: 0,
    aliases: ["setlvl"],
    description: "",
    level: 3,
    levelError: "/me Only available for the broadcaster and above.",
    execute: async (msg, client, config, utils) => {
        try {
            const username = msg?.args[0]?.toLowerCase().replace(/[@#,]/g, "") ?? msg.user.login;
            const user = await db.get("SELECT * FROM users WHERE login = ?", [username]);

            if (!user) {
                return {
                    text: `/me User not found`,
                    reply: true,
                };
            }
            if (msg.args.length !== 2) {
                return {
                    text: `/me Usage: !setlevel <username> 1-4`,
                    reply: true,
                };
            }

            const newLevel = parseInt(msg.args[1]);

            if (msg.user.level < newLevel) {
                return {
                    text: `/me You can't set a level higher than your own`,
                    reply: true,
                };
            }

            if (isNaN(newLevel) || newLevel < 1 || newLevel > 4) {
                return {
                    text: "/me Level must be a number between 1 and 4",
                    reply: true,
                };
            }

            if (user.level === newLevel) {
                return {
                    text: `/me User is already level ${newLevel}`,
                    reply: true,
                };
            }

            await db.run("UPDATE users SET level = ? WHERE login = ?", [newLevel, username]);

            return {
                text: `/me Updated ${user.login}'s level from ${user.level} to ${newLevel}`,
                reply: true,
            };
        } catch (e) {
            logger.error(e);
            return {
                text: "monkaS An error occurred",
                reply: true,
            };
        }
    },
};

module.exports = {
    name: "level",
    cooldown: 3000,
    aliases: ["lvl"],
    description: "",
    level: 1,
    execute: async (msg, client, config, utils) => {
        try {
            const username = msg?.args[0]?.toLowerCase().replace(/[@#,]/g, "") ?? msg.user.login;
            const user = await db.get("SELECT * FROM users WHERE login = ?", [username]);
            logger.log(user)

            if (!user) {
                return {
                    text: `/me User not found`,
                    reply: true,
                };
            }

            return {
                text: `/me ${user.login} is level ${user.level}`,
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

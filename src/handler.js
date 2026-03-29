const fs = require("fs");
const path = require("path");
const utils = require("./utils/index.js");
const { client } = require("./client.js");

exports.handle = async (msg) => {
    async function saveOrUpdateUser(id, login) {
        try {
            const existing = db.queryOne("SELECT * FROM users WHERE id = ?", [id]);

            if (existing) {
                if (existing.login !== login) {
                    db.run("UPDATE users SET login = ? WHERE id = ?", [login, id]);
                }
            } else {
                try {
                    db.run("INSERT INTO users (id, login) VALUES (?, ?)", [id, login]);
                } catch (e) {
                    if (e.message && e.message.includes("UNIQUE constraint")) return;
                    throw e;
                }
            }
        } catch (e) {
            logger.error("Error in saveOrUpdateUser:", e);
        }
    }

    const { id: userId, login: userLogin } = msg.user;

    await saveOrUpdateUser(userId, userLogin);

    const command = await findCommand(msg.command);
    if (!command || !command.execute) return;

    const prefix = "!";
    if (msg.text.startsWith(prefix)) {
        const { live_only } = await db.queryOne(
            `SELECT live_only FROM settings WHERE command = ?`,
            [command?.name],
        );

        if (live_only === 1 && msg.channel.is_live === 0) return;

        const LEVEL_NAMES = {
            2: "MOD",
            3: "STREAMER",
            4: "DEV",
        };

        if (msg.user.level < command.level) {
            try {
                if (command.levelError) {
                    if (command.levelError === null) return;
                    const errorMessage = typeof command.levelError === 'function' 
                        ? command.levelError(msg) 
                        : command.levelError;
                    client.sendRaw(
                        `@reply-parent-msg-id=${msg.id} PRIVMSG #${
                            msg.channel.login
                        } :${errorMessage}`,
                    );
                    return;
                }
                client.sendRaw(
                    `@reply-parent-msg-id=${msg.id} PRIVMSG #${
                        msg.channel.login
                    } :/me ⛔ Level ${LEVEL_NAMES[command.level]} required to use this command.`,
                );
                return;
            } catch (error) {
                logger.error(error);
            }
        }

        const cooldownKey = `${command.name}-${msg.user.id}-${msg.channel.login}`;

        if (msg.user.level > 4) {
            if (utils.cooldown.has(cooldownKey)) return;
            utils.cooldown.set(cooldownKey, command.cooldown);
            setTimeout(() => utils.cooldown.delete(cooldownKey), command.cooldown);
        }

        let reply;
        try {
            reply = msg.parent || msg.id;
            let result = await command.execute(msg, client, utils);
            if (!result) return;

            const results = await Promise.all([
                utils.regex.racism.test(result.text),
                utils.regex.racism2.test(result.text),
                utils.regex.racism3.test(result.text),
                utils.regex.racism5.test(result.text),
                utils.regex.slurs.test(result.text),
                utils.regex.slurs2.test(result.text),
                utils.regex.slurs3.test(result.text),
                utils.regex.slurs4.test(result.text),
                utils.regex.slurs5.test(result.text),
                utils.regex.tos.test(result.text),
                utils.regex.tos2.test(result.text),
                utils.regex.tos3.test(result.text),
                utils.regex.tos4.test(result.text),
                utils.regex.tos5.test(result.text),
                utils.regex.tos6.test(result.text),
            ]);

            if (results.some(Boolean)) {
                const indexOfBoolean = results.indexOf(true);
                client.sendRaw(
                    `@reply-parent-msg-id=${reply} PRIVMSG #${msg.channel.login} :/me Message contains TOS content... • Banphrase: ${indexOfBoolean}`,
                );
                return;
            }

            if (result.reply && !msg.announce) {
                client.sendRaw(
                    `@reply-parent-msg-id=${msg.id} PRIVMSG #${msg.channel.login} :${result.text.replace(/\n|\r/g, " ")}`,
                );
                return;
            }

            await client.privmsg(msg.channel.login, result.text.replace(/\n|\r/g, " "));
        } catch (e) {
            logger.error(e);
        }
    }
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

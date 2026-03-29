const fs = require("fs");
const path = require("path");

module.exports.Commands = new Map();
const Aliases = new Map();

module.exports.add = (command) => {
    if (!command.aliases || !command.aliases.length) {
        command.aliases = [];
    }

    this.Commands.set(command.name, command);

    for (const alias of command.aliases) {
        Aliases.set(alias, command.name);
    }
};

module.exports.delete = (command) => {
    this.Commands.delete(command.name);
    for (const alias of command.aliases) {
        Aliases.delete(alias);
    }
};

module.exports.get = (commandName) => {
    return this.Commands.get(commandName) || this.Commands.get(Aliases.get(commandName));
};

const dirPath = path.resolve(__dirname, "../commands");
const commandFiles = fs.readdirSync(dirPath).filter((file) => file.endsWith(".js"));

(async () => {
    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        this.add(command);

        try {
            const existing = await db.query(`SELECT * FROM settings WHERE command = ?`, [command.name]);

            if (existing.length === 0) {
                await db.run(`INSERT INTO settings (command, live_only) VALUES (?, ?)`, [command.name, 0]);
                logger.info(`Added command "${command.name}" to settings table`);
            }
        } catch (e) {
            console.error(`❌ Error adding command "${command.name}" to database:`, e);
        }
    }
})();

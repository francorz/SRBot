class Logger {
    #logMessage(type, color, ...args) {
        const date = new Date().toLocaleString("en-UK", {
            timeZone: "America/Lima",
            hour12: false,
        });

        const coloredType = `\x1b[${color}m${type}\x1b[97m`;

        console.log(`\x1b[37m${date}\x1b[97m [${coloredType}]:`, ...args);
    }

    log(...args) {
        this.#logMessage("LOG", "90", ...args);
    }

    info(...args) {
        this.#logMessage("INFO", "32", ...args);
    }

    warn(...args) {
        this.#logMessage("WARN", "33", ...args);
    }

    error(...args) {
        this.#logMessage("ERROR", "31", ...args);
    }

    bot(...args) {
        this.#logMessage("BOT", "36", ...args);
    }

    spotify(...args) {
        this.#logMessage("SPOTIFY", "38;2;29;185;84", ...args);
    }
}

module.exports = Logger;

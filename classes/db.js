const DatabaseLib = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const queries = [
    `CREATE TABLE IF NOT EXISTS users (
        internal INTEGER PRIMARY KEY AUTOINCREMENT,
        id TEXT NOT NULL UNIQUE,
        level INTEGER DEFAULT 1,
        login TEXT NOT NULL,
        first_seen DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS channels (
        id TEXT NOT NULL UNIQUE,
        login TEXT NOT NULL,
        live_only INTEGER NOT NULL DEFAULT 1,
        is_live INTEGER NOT NULL DEFAULT 0,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        active BOOLEAN DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS song_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        track_id TEXT NOT NULL,
        track_name TEXT NOT NULL,
        artists TEXT NOT NULL,
        duration_ms INTEGER NOT NULL,
        requested_by TEXT NOT NULL,
        requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        position_in_queue INTEGER
    )`,
    `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        command TEXT NOT NULL,
        live_only INTEGER NOT NULL
    )`,
];
class Database {
    constructor() {
        this.db = null;
        this.dbPath = path.join(__dirname, "../database.sqlite");
    }

    initialize() {
        try {
            const dbDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            this.db = new DatabaseLib(this.dbPath);

            this.db.pragma("foreign_keys = ON");

            for (const query of queries) {
                this.db.exec(query);
            }

            // Insert owner by default at level 4, internal 1
            const srAnn = this.entryExists("SELECT live_only FROM settings WHERE command = ?", ["announcements"]);
            if (!srAnn) {
                this.run("INSERT INTO settings (command, live_only) VALUES (?, ?)", ["announcements", 1]);
            }

            // Insert owner by default at level 4, internal 1
            const devExists = this.entryExists("SELECT 1 FROM users WHERE id = ?", [process.env.DEV_ID]);
            if (!devExists) {
                this.run("INSERT INTO users (id, login, level) VALUES (?, ?, 4)", [process.env.DEV_ID, process.env.DEV_USERNAME]);
            }

            // Insert the bot by default at channels
            const streamerExists = this.entryExists("SELECT 1 FROM channels WHERE id = ? AND login = ?", [
                process.env.STREAMER_ID,
                process.env.STREAMER_USERNAME,
            ]);
            if (!streamerExists) {
                this.run("INSERT INTO channels (id, login) VALUES (?, ?)", [process.env.STREAMER_ID, process.env.STREAMER_USERNAME]);
            }

            // dev channel for testing
            const devCExists = this.entryExists("SELECT 1 FROM channels WHERE id = ? AND login = ?", [process.env.DEV_ID, process.env.DEV_USERNAME]);
            if (!devCExists) {
                this.run("INSERT INTO channels (id, login) VALUES (?, ?)", [process.env.DEV_ID, process.env.DEV_USERNAME]);
            }

            logger.bot("SQL Connected");
        } catch (error) {
            logger.error("SQL initialize error:", error);
            throw error;
        }
    }

    query(query, params = []) {
        try {
            const isSelect = query.trim().toLowerCase().startsWith("select");
            const stmt = this.db.prepare(query);
            return isSelect ? stmt.all(params) : stmt.run(params);
        } catch (error) {
            logger.error("Error in query:", error);
            throw error;
        }
    }

    queryOne(queryStr, params = [], addLimit = true) {
        try {
            const query = `${queryStr}${addLimit ? " LIMIT 1" : ""}`;
            const stmt = this.db.prepare(query);
            return stmt.get(params) || false;
        } catch (error) {
            logger.error("Error in queryOne:", error);
            throw error;
        }
    }

    entryExists(queryStr, params = [], addLimit = true) {
        try {
            const query = `${queryStr}${addLimit ? " LIMIT 1" : ""}`;
            const stmt = this.db.prepare(query);
            return !!stmt.get(params);
        } catch (error) {
            logger.error("Error in entryExists:", error);
            throw error;
        }
    }

    run(query, params = []) {
        try {
            const stmt = this.db.prepare(query);
            return stmt.run(params);
        } catch (error) {
            logger.error("Error in run:", error);
            throw error;
        }
    }

    exec(query) {
        try {
            return this.db.exec(query);
        } catch (error) {
            logger.error("Error in exec:", error);
            throw error;
        }
    }

    get(query, params = []) {
        try {
            const stmt = this.db.prepare(query);
            return stmt.get(params);
        } catch (error) {
            logger.error("Error in get:", error);
            throw error;
        }
    }

    all(query, params = []) {
        try {
            const stmt = this.db.prepare(query);
            return stmt.all(params);
        } catch (error) {
            logger.error("Error in all:", error);
            throw error;
        }
    }

    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}

module.exports = Database;

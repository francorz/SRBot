require("dotenv").config({ quiet: true });

const Logger = require("./classes/logger.js");
global.logger = new Logger();

const MapCache = require("./classes/cache.js");
global.mCache = new MapCache();

const { SpotifyAPI } = require("./classes/spotify.js");
global.spotifyAPI = new SpotifyAPI(
    process.env.SPOTIFY_CLIENT_ID,
    process.env.SPOTIFY_CLIENT_SECRET,
    process.env.SPOTIFY_ACCESS_TOKEN,
    process.env.SPOTIFY_REFRESH_TOKEN,
);

const Database = require("./classes/db.js");
global.db = new Database();
db.initialize();

const QueueCleanup = require("./classes/syncQueue.js");
const queueCleanup = new QueueCleanup();

const { handle } = require("./src/handler.js");
const regex = require("./src/utils/regex.js");
const { client, anonClient } = require("./src/client.js");
const EventSubManager = require("./classes/eventsub.js");

const eventSubManager = new EventSubManager(
    process.env.TWITCH_CLIENT_ID,
    process.env.TWITCH_ACCESS_TOKEN,
);
eventSubManager.initialize();
global.eventSubManager = eventSubManager;
global.anonClient = anonClient;

anonClient.on("PRIVMSG", async (msg) => {
    try {
        const msgData = await createMsgData(msg);
        handle(msgData);
    } catch (error) {
        logger.error(error);
    }
});

process.on("SIGINT", async () => {
    logger.bot("Bot shutting down...");
    queueCleanup.stop();
    client.close();
    anonClient.close();
    await eventSubManager.stop();
    process.exit(0);
});

async function createMsgData(msg, announce = false) {
    const start = Date.now();

    const parentMsg = msg.ircTags?.["reply-parent-msg-body"] || "";

    let message;
    if (msg.replyParentMessageID) {
        message = msg.messageText
            .replace(/^@[^\s]+\s+/, "")
            .replace(regex.invisChar, "")
            .trimEnd();
    } else {
        message = msg.messageText.replace(regex.invisChar, "").trimEnd();
    }

    const prefix = "!";
    const content = message + " " + parentMsg;
    const contentNoParent = message;
    const args = smartSplit(content.slice(prefix.length).trim());
    const commandName = args.length > 0 ? args.shift().toLowerCase() : "";
    const botBadges = client.userStateTracker.channelStates[msg.channelName];

    const { level } = await db.queryOne("SELECT level FROM users WHERE id = ?", [msg.senderUserID]);

    const { is_live, live_only } = await db.queryOne(
        "SELECT is_live, live_only FROM channels WHERE id = ?",
        [msg.channelID],
    );

    return {
        user: {
            id: msg.senderUserID,
            name: msg.displayName,
            login: msg.senderUsername,
            colorRaw: msg.colorRaw,
            badgesRaw: msg.badgesRaw,
            color: msg.color,
            level,
        },
        channel: {
            id: msg.channelID,
            login: msg.channelName,
            is_live,
            live_only,
        },
        id: msg.messageID,
        raw: msg.rawSource,
        content,
        contentNoParent,
        command: commandName,
        text: message.replace(/^@[^\s]+\s+/, ""),
        time: Date.parse(msg.serverTimestamp),
        parent: msg.replyParentMessageID,
        parsedArgs: filterArgs(args),
        args,
        params: parseParams(args.join(" ")),
        flags: parseFlags(args),
        announce,
        prefix,
        isAction: msg.isAction,
        timestamp: msg.serverTimestampRaw,
        emotes: msg.emotes,
        tags: msg.ircTags,
        badges: msg.badges,
        start,
        botBadges,
    };
}

function smartSplit(str) {
    const result = [];
    const regex = /(\w+:"[^"\\]*(\\.[^"\\]*)*"|\w+:\S+|--\w+|\S+)/g;
    let match;
    while ((match = regex.exec(str)) !== null) {
        result.push(match[0]);
    }
    return result;
}

function parseParams(paramString) {
    const params = {};
    const regex = /(\w+):\s*(?:"([^"\\]*(\\.[^"\\]*)*)"|(\S+))(?!\/\/)/g;
    let match;
    while ((match = regex.exec(paramString)) !== null) {
        const key = match[1];
        const value = match[2] ? match[2].replace(/\\"/g, '"') : match[4];

        if ((key === "http" || key === "https") && value?.startsWith("//")) {
            continue;
        }

        params[key] = value === "true" ? true : value === "false" ? false : value;
    }
    return params;
}

function parseFlags(args) {
    const flags = {};
    args.forEach((arg) => {
        const match = arg.match(/^--(\w+)$/);
        if (match) flags[match[1]] = true;
    });
    return flags;
}

function filterArgs(args) {
    const urlRegex = /^https?:\/\/.+/i;
    return args.filter((arg) => {
        if (urlRegex.test(arg)) return true;
        if (arg.startsWith("--")) return false;
        if (/^\w+:/.test(arg)) return false;
        return true;
    });
}

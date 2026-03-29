require('dotenv').config({ quiet: true });

const { ChatClient, AlternateMessageModifier, SlowModeRateLimiter } = require("@mastondzn/dank-twitch-irc");

let client = new ChatClient({
    username: process.env.BOT_USERNAME.toLowerCase(),
    password: process.env.TWITCH_ACCESS_TOKEN,
    ignoreUnhandledPromiseRejections: true,
    rateLimits: "default",
});

let anonClient = new ChatClient({
    username: `justinfan${Math.floor(10000 + Math.random() * 90000)}`,
    password: undefined,
    ignoreUnhandledPromiseRejections: true,
    rateLimits: "verifiedBot",
});

client.use(new AlternateMessageModifier(client));
client.use(new SlowModeRateLimiter(client, 10));

client.connect();

anonClient.on("ready", async () => {
    logger.bot("AnonClient Connected");
    const startTime = Date.now();

    const channels = db.query("SELECT login FROM channels WHERE active = 1").map((row) => row.login);

    logger.bot(`Joining ${channels.length} channels...`);

    await anonClient.joinAll(channels);

    const endTime = Date.now();
    logger.bot(`Joined ${channels.length} channels in ${((endTime - startTime) / 1000).toFixed(1)}s`);
});

anonClient.on("JOIN", (msg) => logger.bot(`Anon joined #${msg.channelName}`));
anonClient.on("PART", (msg) => logger.bot(`Anon parted #${msg.channelName}`));

anonClient.on("close", (error) => {
    logger.bot("AnonClient disconnected");
    if (error) logger.error("AnonClient error:", error);
    setTimeout(() => anonClient.connect(), 5000);
});

anonClient.connect();

module.exports = { client, anonClient };

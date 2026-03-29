const { EventSubWsListener } = require("@twurple/eventsub-ws");
const { ApiClient } = require("@twurple/api");
const { StaticAuthProvider } = require("@twurple/auth");
const { client } = require("../src/client.js");

const QueueCleanup = require("./syncQueue.js");
const queueCleanup = new QueueCleanup();

const { checkTrackChange } = require("../src/trackSongs.js");

class EventSubManager {
    constructor(clientId, accessToken) {
        this.clientId = clientId;
        this.accessToken = accessToken;

        this.authProvider = new StaticAuthProvider(clientId, accessToken);
        this.apiClient = new ApiClient({ authProvider: this.authProvider });

        this.listener = new EventSubWsListener({
            apiClient: this.apiClient,
        });

        this.subscriptions = new Map();
        this.streamStatus = new Map();
        this.isInitialized = false;
        this.intervalId = null;
    }

    async initialize() {
        if (this.isInitialized) {
            logger.bot("EventSub already initialized, skipping...");
            return;
        }

        const streamerLogin = process.env.STREAMER_USERNAME;
        const streamerId = process.env.STREAMER_ID;

        if (!streamerLogin || !streamerId) {
            throw new Error("STREAMER_USERNAME or STREAMER_ID is not set");
        }

        try {
            await this.listener.start();
            logger.bot("EventSub WebSocket Connected");

            await this.subscribeToChannel(streamerId, streamerLogin);

            this.isInitialized = true;
            logger.bot(`EventSub subscribed to streamer: ${streamerLogin} (${streamerId})`);
        } catch (error) {
            logger.error("Error initializing EventSub:", error);
            throw error;
        }
    }

    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async subscribeToChannel(userId, login) {
        try {
            if (this.subscriptions.has(userId)) {
                logger.warn(`Channel ${login} (${userId}) already subscribed`);
                return;
            }

            const stream = await this.apiClient.streams.getStreamByUserId(userId);
            const isLive = stream !== null ? 1 : 0;
            this.streamStatus.set(userId, isLive);

            await this.updateStreamStatus(userId, isLive);

            logger.bot(`Channel ${login} (${userId}): ${isLive ? "LIVE 🔴" : "OFFLINE ⚫"}`);

            if (isLive) {
                this.startQueueServices();
            }

            const onlineSubscription = this.listener.onStreamOnline(userId, async (event) => {
                await this.handleStreamOnline(event);
            });

            const offlineSubscription = this.listener.onStreamOffline(userId, async (event) => {
                await this.handleStreamOffline(event);
            });

            this.subscriptions.set(userId, {
                login,
                online: onlineSubscription,
                offline: offlineSubscription,
            });
        } catch (error) {
            logger.error(`Error subscribing to ${login} (${userId}):`, error);
        }
    }

    async handleStreamOnline(event) {
        const userId = event.broadcasterId;
        const userLogin = event.broadcasterName;

        client.privmsg(userLogin, `${process.env?.ARRIVE_EMOTE || ""} Live • SR Enabled`);
        this.startQueueServices();

        this.streamStatus.set(userId, 1);
        await this.updateStreamStatus(userId, 1);
    }

    async handleStreamOffline(event) {
        const userId = event.broadcasterId;
        const userLogin = event.broadcasterName;

        client.privmsg(userLogin, `${process.env?.LEAVE_EMOTE || ""} Offline • SR Disabled`);
        this.stopQueueServices();

        this.streamStatus.set(userId, 0);
        await this.updateStreamStatus(userId, 0);
    }

    async updateStreamStatus(userId, status) {
        try {
            await db.query("UPDATE channels SET is_live = ? WHERE id = ?", [status, userId]);
        } catch (error) {
            logger.error(`Error updating stream status (${userId}):`, error);
        }
    }

    startQueueServices() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.intervalId = setInterval(() => checkTrackChange(), 15000);
        queueCleanup.start(10000);
        queueCleanup.syncWithSpotify();
    }

    stopQueueServices() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        queueCleanup.stop();
    }

    getStreamStatus(userId) {
        return this.streamStatus.get(userId) || 0;
    }

    async addChannel(userId, login) {
        if (this.subscriptions.has(userId)) {
            logger.warn(`Channel ${login} (${userId}) already subscribed`);
            return;
        }

        await this.subscribeToChannel(userId, login);
        logger.info(`Channel ${login} (${userId}) added successfully`);
    }

    async removeChannel(userId) {
        const subscription = this.subscriptions.get(userId);

        if (!subscription) {
            logger.warn(`No subscription found for channel ${userId}`);
            return;
        }

        try {
            subscription.online.stop();
            subscription.offline.stop();

            this.subscriptions.delete(userId);
            this.streamStatus.delete(userId);

            logger.info(`Channel ${subscription.login} (${userId}) removed successfully`);
        } catch (error) {
            logger.error(`Error removing channel ${userId}:`, error);
        }
    }

    getSubscriptions() {
        return this.subscriptions;
    }

    getSubscription(key) {
        return this.subscriptions.get(key);
    }

    getAllSubscriptions() {
        return Array.from(this.subscriptions.entries());
    }

    async stop() {
        if (!this.isInitialized) {
            logger.bot("EventSub not initialized, nothing to stop");
            return;
        }

        logger.bot("Stopping EventSub...");

        for (const [userId, subscription] of this.subscriptions) {
            try {
                subscription.online.stop();
                subscription.offline.stop();
            } catch (error) {
                logger.error(`Error stopping subscription for ${userId}:`, error);
            }
        }

        this.subscriptions.clear();
        this.streamStatus.clear();
        this.stopQueueServices();

        try {
            await this.listener.stop();
        } catch (error) {
            logger.error("Error stopping listener:", error);
        }

        this.isInitialized = false;
        logger.bot("EventSub stopped successfully");
    }

    async clearAllSubscriptions() {
        try {
            const subs = await this.apiClient.eventSub.getSubscriptions();
            logger.info(`Found ${subs.data.length} existing subscriptions on Twitch`);

            for (const sub of subs.data) {
                await this.apiClient.eventSub.deleteSubscription(sub.id);
                logger.info(`Deleted subscription ${sub.id} (${sub.type})`);
                await this.sleep(100);
            }

            logger.info("All subscriptions cleared");
        } catch (error) {
            logger.error("Error clearing subscriptions:", error);
        }
    }
}

module.exports = EventSubManager;

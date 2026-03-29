class QueueCleanup {
    constructor() {
        this.spotifyAPI = spotifyAPI;
        this.db = db;
        this.interval = null;
        this.lastKnownTrackId = null;
        this.lastKnownTrackName = null;
    }

    /**
     * Start monitoring the queue and cleaning up played songs
     * @param {number} checkIntervalMs - How often to check (default: 10 seconds)
     */
    start(checkIntervalMs = 10000) {
        if (this.interval) {
            logger.spotify("Queue cleanup already running");
            return;
        }

        logger.spotify("Starting queue cleanup service...");

        this.interval = setInterval(async () => {
            try {
                await this.cleanup();
            } catch (error) {
                logger.error("Queue cleanup error:", error);
            }
        }, checkIntervalMs);
    }

    /**
     * Stop the cleanup service
     */
    async stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            await this.removeAllSongs();
            logger.spotify("Queue cleanup service stopped");
        }
    }

    /**
     * Remove all songs from the database
     */
    async removeAllSongs() {
        try {
            await this.db.query(`DELETE FROM song_requests`);
            logger.spotify("Removed all songs from database");
            this.lastKnownTrackId = null;
            this.lastKnownTrackName = null;
        } catch (error) {
            logger.error("Error removing all songs:", error);
        }
    }

    /**
     * Clean up songs that have been played
     */
    async cleanup() {
        try {
            const currentState = await this.spotifyAPI.getCurrentPlayback();
            const currentTrack = currentState?.item;

            if (!currentTrack) {
                return;
            }

            if (this.lastKnownTrackId && this.lastKnownTrackId !== currentTrack.id) {
                await this.db.query(`DELETE FROM song_requests WHERE track_id = ?`, [this.lastKnownTrackId]);
                await this.reorderQueue();
            }

            this.lastKnownTrackId = currentTrack.id;
            this.lastKnownTrackName = currentTrack.name;
        } catch (error) {
            if (error.response?.statusCode !== 401) {
                logger.error("Cleanup error:", error.message);
            }
        }
    }

    /**
     * Reorder queue positions after removing a song
     */
    async reorderQueue() {
        const songs = await this.db.query(`SELECT id FROM song_requests ORDER BY requested_at ASC`);

        for (let i = 0; i < songs.length; i++) {
            await this.db.query(`UPDATE song_requests SET position_in_queue = ? WHERE id = ?`, [i + 1, songs[i].id]);
        }
    }

    /**
     * Manually sync queue with Spotify's actual queue
     */
    async syncWithSpotify() {
        try {
            const { queue } = await this.spotifyAPI.getQueue();
            const spotifyTrackIds = queue.map((track) => track?.id);

            const dbTracks = await this.db.query(`SELECT track_id FROM song_requests`);
            const dbTrackIds = dbTracks.map((t) => t.track_id);

            for (const dbTrackId of dbTrackIds) {
                if (!spotifyTrackIds.includes(dbTrackId)) {
                    await this.db.query(`DELETE FROM song_requests WHERE track_id = ?`, [dbTrackId]);
                    logger.spotify(`Synced: removed ${dbTrackId} from DB queue`);
                }
            }

            await this.reorderQueue();
        } catch (error) {
            logger.error("Sync error:", error);
        }
    }
}

module.exports = QueueCleanup;

class MapCache {
    constructor() {
        this.cache = new Map();
        this.ttls = new Map();
    }

    set(key, value, ttl = null) {
        this.cache.set(key, value);

        if (ttl) {
            const expiresAt = Date.now() + ttl * 1000;
            this.ttls.set(key, expiresAt);

            setTimeout(() => {
                this.delete(key);
            }, ttl * 1000);
        } else {
            this.ttls.delete(key);
        }

        return true;
    }

    get(key) {
        if (this.ttls.has(key)) {
            const expiresAt = this.ttls.get(key);
            if (Date.now() > expiresAt) {
                this.delete(key);
                return null;
            }
        }

        return this.cache.has(key) ? this.cache.get(key) : null;
    }

    delete(key) {
        this.ttls.delete(key);
        return this.cache.delete(key);
    }

    exists(key) {
        const value = this.get(key);
        return value !== null;
    }

    keys(pattern = "*") {
        const allKeys = Array.from(this.cache.keys());

        if (pattern === "*") {
            return allKeys.filter((key) => this.exists(key));
        }

        const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
        return allKeys.filter((key) => regex.test(key) && this.exists(key));
    }

    ttl(key) {
        if (!this.cache.has(key)) {
            return -2;
        }

        if (!this.ttls.has(key)) {
            return -1;
        }

        const expiresAt = this.ttls.get(key);
        const remaining = expiresAt - Date.now();

        if (remaining <= 0) {
            this.delete(key);
            return -2;
        }

        return Math.ceil(remaining / 1000);
    }

    expire(key, seconds) {
        if (!this.cache.has(key)) {
            return false;
        }

        const value = this.cache.get(key);
        this.set(key, value, seconds);
        return true;
    }

    flushAll() {
        this.cache.clear();
        this.ttls.clear();
        return true;
    }

    size() {
        const validKeys = this.keys("*");
        return validKeys.length;
    }

    hSet(key, field, value) {
        let hash = this.get(key);
        if (!hash || typeof hash !== "object") {
            hash = {};
        }
        hash[field] = value;
        this.set(key, hash);
        return true;
    }

    hGet(key, field) {
        const hash = this.get(key);
        if (!hash || typeof hash !== "object") {
            return null;
        }
        return hash[field] || null;
    }

    hGetAll(key) {
        const hash = this.get(key);
        if (!hash || typeof hash !== "object") {
            return {};
        }
        return hash;
    }

    hDel(key, field) {
        const hash = this.get(key);
        if (!hash || typeof hash !== "object") {
            return false;
        }
        delete hash[field];
        this.set(key, hash);
        return true;
    }

    incr(key) {
        const value = this.get(key) || 0;
        const newValue = Number(value) + 1;
        this.set(key, newValue);
        return newValue;
    }

    decr(key) {
        const value = this.get(key) || 0;
        const newValue = Number(value) - 1;
        this.set(key, newValue);
        return newValue;
    }
}

module.exports = MapCache;

const { createClient } = require('redis');

class RedisCache {
    constructor(configs) {
        this.configs = configs;
        this._conn = null;
    }
    async createConn() {
        try {
            this._conn = createClient(this.configs);
            this._conn.on('connect', () => {
                console.log('Connection established on Redis!');
            });
    
            this._conn.on('error', e => {
                console.log('Error on redis conection: ', e.message);
                process.exit(1);
            });
            
            this._conn.on('end', () => console.log('Redis conection finished!'));
            await this._conn.connect();
        } catch (error) {
            console.log('Error while trying to connect to Redis: ', error.message);
        }       
    }
   
    async hSet(key, data) {
        try {
            const promises = [];
            for (const [property, value] of Object.entries(data)) {
                promises.push(this._conn.hSet(key, property, value));
            }
            await Promise.all(promises);
        } catch (error) {
            console.log('Error while saving data in Redis: ', error.message);
        }   
    }

    async hGet(key, property) {
        return this._conn.hGet(key, property);
    }

    async hGetAll(key) {
        return this._conn.hGetAll(key);
    }

    async expire(key, s) {
        return this._conn.expire(key, s);
    }

    async verifyTtl(key) {
        return this._conn.ttl(key);
    }

    async verifyIfKeyExists(key) {
        return this._conn.exists(key);
    }
}
module.exports = RedisCache;

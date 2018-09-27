'use strict'

const redis = require('redis');
let parameters = require('../../config/parameters');
const debug = require('debug')('app:redis');
const Promise = require('bluebird');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);


module.exports = {
    client: null,

    startClient() {
        if (process.env.TEST_MODE) {
            parameters = parameters.test;
        }

        const redisUrl = `${parameters.redis.host}:${parameters.redis.port}/${parameters.redis.db}`;

        // Client initialization
        this.client = redis.createClient({
            url: redisUrl,
            retry_strategy: function (options) {
                debug('Redis Reconnecting attempt ' + options.attempt)
                return Math.min(options.attempt * 50, 5000)
            }
        });

        this.client.on('ready', () => {
            debug('Redis Connected')
        })

        this.client.on('end', () => {
            debug('Redis Disconnected')
        })

        this.client.on('error', () => {
            debug('Redis Error connecting')
        })
    },

    savePoint(key, id, point) {
        this.client.hsetAsync(key, id, JSON.stringify(point))
            .catch(err => debug(`error: ${result}`));
    },

    async getCurrentState(key) {
        const currentState = await this.client.hgetallAsync(key);
        if (currentState) {
            return Object.values(currentState)
        }
    }
}

const http = require('http');
const WebSocket = require('ws');
const url = require('url');
const redis = require('./services/redis');
const debug = require('debug')('app:server');
const metadata = require('../config/metadata');

const ACTION_SET = 'set';
const ACTION_DELETE = 'delete';

module.exports = function () {
    const server = new http.createServer();
    const wss = new WebSocket.Server({ server });

    wss.broadcast = function broadcast(data) {
        wss.clients.forEach(async function each(client) {
            await client._sendingCurrentStatePromise;
            if (client.readyState === WebSocket.OPEN) {
                send(client, data);
            }
        });
    };

    wss.on('connection', async function connection(ws, req) {
        const ip = req.connection.remoteAddress;
        debug(`new client - ${ip}`);

        const {map, mapMetatada} = getMap(req.url);
        if(!map || !mapMetatada) {
            return ws.terminate();
        }

        ws.on('message', function incoming(point) {
            point = parseNewPoint(point);

            // validate point
            if (!validateNewPoint(point)) {
                debug('error: validation failed', point)
                return;
            }

            // Broadcast to everyone else
            wss.broadcast(point);

            // send to redis
            redis.savePoint(map, point.id, point);
        });

        // send map metadata
        send(ws, { type: 'meta', data: mapMetatada });

        // send current state
        async function sendCurrentStatePromise() {
            const currentState = await redis.getCurrentState(map);
            if (currentState) {
                return await Promise.all(currentState.map(point => send(ws, JSON.parse(point))));
            }
        }

        ws._sendingCurrentStatePromise = sendCurrentStatePromise();
    });

    return server;
}



function send(ws, data) {
    if (ws.readyState !== WebSocket.OPEN) {
        return error(new Error('WebSocket is not open'), ws);
    }

    return new Promise(resolve => {
        ws.send(JSON.stringify(data), err => {
            if (err) {
                return error(err, ws);
            }

            return resolve();
        });
    });
}

function error(error, ws) {
    debug(`error: ${error}`);

    if (ws && [WebSocket.OPEN, WebSocket.CONNECTING].includes(ws.readyState)) {
        debug('ws terminate');
        ws.terminate();
    }
}

function parseNewPoint(point) {
    if (!point || typeof point !== 'string') {
        return;
    }

    try {
        return JSON.parse(point);
    } catch (error) {
        return;
    }
}

function validateNewPoint(point) {
    return typeof point == 'object' &&
        point.type &&
        typeof point.type == 'string' &&
        [ACTION_SET, ACTION_DELETE].includes(point.type) &&
        point.id !== undefined && point.id !== null
}

function getMap(reqUrl) {
    const pathname = url.parse(reqUrl).pathname.substring(1).split('/');
    if (metadata[pathname]) {
        return {
            map: pathname,
            mapMetatada: metadata[pathname]
        }
    }
}

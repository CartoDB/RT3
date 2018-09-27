const http = require('http');
const WebSocket = require('ws');
const url = require('url');
const redis = require('./services/redis');
const debug = require('debug')('app:server');
const metadata = require('../config/metadata');
const verifyClient = require('./services/verifyClient');

const ACTION_SET = 'set';
const ACTION_DELETE = 'delete';

module.exports = function () {
    const server = new http.createServer();
    const wss = new WebSocket.Server({ server, verifyClient, perMessageDeflate: true });

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

        const { map, mapMetatada } = getMap(req.url);
        if (!map || !mapMetatada) {
            return ws.terminate();
        }

        ws.on('message', function incoming(message) {
            message = parseNewMessage(message);

            if (isAReadyMessage(message)) {
                // send current state
                async function sendCurrentStatePromise() {
                    const currentState = await redis.getCurrentState(map);
                    if (currentState) {
                        return await Promise.all(currentState.map(point => send(ws, JSON.parse(point))));
                    }
                }

                return ws._sendingCurrentStatePromise = sendCurrentStatePromise();
            }

            // validate point
            if (!validateNewPoint(message)) {
                debug('error::validation', message)
                return;
            }

            // Broadcast to everyone else
            wss.broadcast(message);

            // send to redis
            redis.savePoint(map, message.id, message);
        });

        // send map metadata
        send(ws, { type: 'meta', data: mapMetatada });
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

function parseNewMessage(point) {
    if (!point || typeof point !== 'string') {
        return;
    }

    try {
        return JSON.parse(point);
    } catch (error) {
        return;
    }
}

function isAReadyMessage(message) {
    return typeof message == 'object' &&
        message.type &&
        message.type == 'ready'
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
    return {
        map: pathname,
        mapMetatada: metadata[pathname]
    }
}

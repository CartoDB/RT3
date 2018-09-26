const http = require('http');
const WebSocket = require('ws');
const redis = require('./services/redis');
const debug = require('debug')('app:server');

const ACTION_SET = 'set';
const ACTION_DELETE = 'delete';

const REDIS_CURRENT_KEY = 'mapTest:current';

module.exports = function() {
    const server = new http.createServer();
    const wss = new WebSocket.Server({ server });

    wss.broadcast = function broadcast(data) {
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                send(client, data);
            }
        });
    };

    wss.on('connection', async function connection(ws, req) {
        const ip = req.connection.remoteAddress;
        debug(`new client - ${ip}`);

        ws.on('message', function incoming(point) {
            point = parseNewPoint(point);

            // validate point
            if (!validateNewPoint(point)) {
                debug('error: validation failed')
                return;
            }

            // Broadcast to everyone else
            wss.broadcast(point);

            // send to redis
            redis.savePoint(REDIS_CURRENT_KEY, point.id, point);
        });

        // send current state
        const currentState = await redis.getCurrentState(REDIS_CURRENT_KEY);
        currentState.forEach(point => send(ws, JSON.parse(point)));
    });

    return server;
}



function send(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    } else {
        error(new Error('WebSocket is not open'), ws);
    }
}

function error(error, ws) {
    debug(`error: ${error}`);

    if (ws) {
        debug('ws terminate');
        ws.terminate();
    }
}

function parseNewPoint(point) {
    if (!point ||  typeof point !== 'string') {
        return;
    }

    try {
        return JSON.parse(point);
    } catch (error) {
        return;
    }
}

function validateNewPoint(point) {
    return  typeof point == 'object' &&
            point.type &&
            typeof point.type == 'string' &&
            [ACTION_SET, ACTION_DELETE].includes(point.type) &&
            point.id !== undefined && point.id !== null
}

const http = require('http');
const WebSocket = require('ws');
const fixtures = require('./config/fixtures.json')
const debug = require('debug')('app:index')

const server = new http.createServer();
const wss = new WebSocket.Server({ server });


wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            send(client, data);
        }
    });
};

wss.on('connection', function connection(ws, req) {
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
    });

    // send current state
    sendFixtures(ws);
});

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

function validateNewPoint(event) {
    return typeof event == 'object' && event.type && typeof event.type == 'string'
}

function sendFixtures(ws) {
    let point = fixtures[0];

    let i = 0;
    const interval = setInterval(function () {
        point.lat = Math.random() * 180 - 90
        point.lon = Math.random() * 360 - 180
        point.data.foo = i++ % 3

        if (ws.readyState === WebSocket.OPEN && i < 20) {
            ws.send(JSON.stringify(prepareSet(point)));
        } else {
            clearInterval(interval)
        }
    }, 100);

}

function prepareSet(point) {
    return Object.assign({ type: 'set' }, point);
}

function prepareDelete(point) {
    return Object.assign({ type: 'delete' }, { id: point.id });
}

server.listen(3333);

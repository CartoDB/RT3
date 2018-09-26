const http = require('http');
const WebSocket = require('ws');
const fixtures = require('./config/fixtures.json')

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
    ws.on('message', function incoming(point) {
        const ip = req.connection.remoteAddress;
        console.log(`client[${ip}]: ${point}`);

        // validate point
        if (!validateNewPoint(point)) {
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
        ws.send(JSON.stringify(prepareSet(data)));
    } else {
        error(new Error('WebSocket is not open'), ws);
    }
}

function error(error, ws) {
    console.error(error);

    if (ws) {
        ws.terminate();
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
        point.data.foo = i++ % 50

        if (ws.readyState === WebSocket.OPEN || i < 100) {
            send(ws, prepareSet(point));
        } else {
            clearInterval(interval)
            ws.terminate();
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

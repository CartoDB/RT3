const http = require('http');
const WebSocket = require('ws');
const debug = require('debug')('app:index');

const ACTION_SET = 'set';
const ACTION_DELETE = 'delete';

const server = new http.createServer();
const wss = new WebSocket.Server({ server });
const metadata = require('./config/metadata');

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
    debug('metadata:', metadata);
    ws.send(generateMetadataMsg(metadata));
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
});

server.listen(3333);


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
    return  typeof event == 'object' &&
            event.type &&
            typeof event.type == 'string' &&
            [ACTION_SET, ACTION_DELETE].includes(event.type)
}


function generateMetadataMsg(metadata){
    return JSON.stringify({
        type: 'meta',
        data: metadata,
    });
}


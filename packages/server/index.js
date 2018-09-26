const http = require('http');
const WebSocket = require('ws');
const fixtures = require('./config/fixtures.json')

const server = new http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    fixtures.forEach(point => {
        ws.send(JSON.stringify(prepareSet(point)));
    });

    ws.send(JSON.stringify(prepareDelete(fixtures[3])));
});

function prepareSet(point) {
    return Object.assign({type: 'set'}, point);
}

function prepareDelete(point) {
    return Object.assign({type: 'delete'}, {id: point.id});
}

server.listen(3333);

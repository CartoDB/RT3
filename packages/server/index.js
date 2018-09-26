const http = require('http');
const WebSocket = require('ws');
const fixtures = require('./config/fixtures.json')

const server = new http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws, req) {
    const ip = req.connection.remoteAddress;

    ws.on('message', function incoming(message) {
        console.log(`client[${ip}]: ${message}`);
    });

    let point = fixtures[0];
    let i = 0;
    setInterval(function() {
        point.lat = Math.random() * 90
        point.lon = Math.random() * 180
        point.data.foo = i++ % 50
        ws.send(JSON.stringify(prepareSet(point)));
    }, 50)

    // fixtures.forEach(point => {

    //     ws.send(JSON.stringify(prepareSet(point)));
    // });

    // ws.send(JSON.stringify(prepareDelete(fixtures[3])));
});

function prepareSet(point) {
    return Object.assign({type: 'set'}, point);
}

function prepareDelete(point) {
    return Object.assign({type: 'delete'}, {id: point.id});
}

server.listen(3333);

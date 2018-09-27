'use strict'

const expect = require('chai').expect;
const createServer = require('../../src/server');
const redis = require('../../src/services/redis');
const parameters = require('../../config/parameters').test;
const WebSocket = require('ws');
const metadata = require('../../config/metadata');


const debug = require('debug')('app:test:functional:index');

const MAP = 'test-map';
const REDIS_CURRENT_KEY = `${MAP}:current`;
let ws;

describe('FUNCTIONAL API - INDEX', function () {
    before(function (done) {
        redis.startClient();

        const server = createServer();
        server.listen(parameters.port, () => {
            debug(`Server listening in port ${parameters.port}`);
            done();
        });
    });

    afterEach(async function () {
        ws.terminate();
        await redis.client.delAsync(REDIS_CURRENT_KEY);
    })

    it('should response meta', function (done) {
        ws = new WebSocket(`ws://localhost:${parameters.port}/${MAP}?api_key=1234`);

        ws.on('message', function incoming(data) {
            expect(JSON.parse(data)).to.deep.equal({
                type: 'meta',
                data: metadata[MAP]
            });
            done();
        });
    });

    it('should response meta and point', function (done) {
        ws = new WebSocket(`ws://localhost:${parameters.port}/${MAP}?api_key=1234`);

        const point = {
            type: 'set',
            lat: -3.7038021,
            lon: 40.4180832,
            id: 1,
            data: {
                foo: 1
            }
        };

        let messagesReceived = 0;
        const expectedResult = [
            {
                type: 'meta',
                data: metadata[MAP]
            },
            point
        ];

        ws.on('message', function incoming(data) {
            expect(JSON.parse(data)).to.deep.equal(expectedResult[messagesReceived++]);

            if (messagesReceived >= expectedResult.length) {
                done();
            }
        });

        ws.on('open', function open() {
            debug('open');
            ws.send(JSON.stringify(point));
        });
    });

    it('should be auth', function (done) {
        ws = new WebSocket(`ws://localhost:${parameters.port}/${MAP}?api_key=1234`);

        ws.on('message', function incoming(data) {
            expect(JSON.parse(data)).to.deep.equal({
                type: 'meta',
                data: metadata[MAP]
            });
            done();
        });
    });

    it('should be unauthorized', function (done) {
        ws = new WebSocket(`ws://localhost:${parameters.port}/${MAP}`);

        ws.on('error', function (err) {
            expect(err).not.to.be.null;
            expect(err.message).to.be.equals('Unexpected server response: 401');
            done();
        });
    });
});

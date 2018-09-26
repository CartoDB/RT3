const createServer = require('./src/server');
const redis = require('./src/services/redis')
const parameters = require('./config/parameters');
const debug = require('debug')('app:index');

redis.startClient();

server = createServer();
server.listen(parameters.port, () => {debug(`Server listening in port ${parameters.port}`)});

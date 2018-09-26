const RT3Producer = require('../index-node');

if (!process.env.IP) {
  console.error('----\nPlease, specify RT3 server IP as ENV variable.');
  console.error('Example: IP=127.0.0.1 npm run node\n----\n');
  return process.exit(-1);
}

const rt3Producer = new RT3Producer(`ws://${process.env.ip}:3333`);

let i = 0;
setInterval(() => {
  let point = {
    id: i % 10,
    lat: Math.random() * 90,
    lon: Math.random() * 180,
    data: {
      foo: Math.random() * 5
    }
  }

  rt3Producer.set(point);
}, 500);
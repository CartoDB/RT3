const RT3Producer = require('../index-node');
const faker = require('faker');

if (!process.env.IP) {
  console.error('----\nPlease, specify RT3 server IP as ENV variable.');
  console.error('Example: IP=127.0.0.1 npm run node\n----\n');
  return process.exit(-1);
}

const rt3Producer = new RT3Producer(`ws://${process.env.IP}:3333`);

let i = 0;
setInterval(() => {
  i++;
  let point = {
    id: i % 10,
    lat: Math.random() * 90,
    lon: Math.random() * 180,
    data: {
      speed: Math.random() * 130,
      vehicle: `type_${i%4}`,
      name: faker.name.findName(),
    }
  }

  rt3Producer.set(point);
}, 500);
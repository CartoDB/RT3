const RT3Producer = require('../index-node');

const rt3Producer = new RT3Producer('ws://10.0.32.102:3333');

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
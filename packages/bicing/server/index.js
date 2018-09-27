const fetch = require('node-fetch');
const ws = require('ws');
const Rt3Producer = require('rt3-producer');

rt3Producer = new Rt3Producer('ws://10.0.32.99:3333');


setInterval(async () => {
  const response = await fetch('http://wservice.viabicing.cat/v2/stations');
  const data = await response.json();
  data.forEach(point => {
    rt3Producer.set(point);
  });

}, 2000);
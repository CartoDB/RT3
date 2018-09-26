import RT3Producer from '../index.js';

const rt3Producer = new RT3Producer('ws://10.0.32.102:3333');


document.querySelector('#js-send').addEventListener('click', () => {
  const point = {
    lat: document.getElementById('lat').value,
    lon: document.getElementById('lon').value,
    id: document.getElementById('id').id,
    data: JSON.parse(document.getElementById('data').value),
  }

  rt3Producer.set(point);
});
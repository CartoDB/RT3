import RT3Producer from '../index-browser.js';

const rt3Producer = new RT3Producer('ws://10.0.32.102:3333');


document.querySelector('#js-send').addEventListener('click', () => {
  const point = {
    lat: parseFloat(document.getElementById('lat').value),
    lon: parseFloat(document.getElementById('lon').value),
    id: parseFloat(document.getElementById('id').id),
    data: JSON.parse(document.getElementById('data').value),
  }

  rt3Producer.set(point);
});
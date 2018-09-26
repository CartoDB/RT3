import RT3Producer from '../index-browser.js';


const IP = prompt("Enter RT3 Server IP", '10.0.32.102');
const rt3Producer = new RT3Producer(`ws://${IP}:3333`);


document.querySelector('#js-send').addEventListener('click', () => {
  const point = {
    lat: parseFloat(document.getElementById('lat').value),
    lon: parseFloat(document.getElementById('lon').value),
    id: parseFloat(document.getElementById('id').value),
    data: JSON.parse(document.getElementById('data').value),
  }

  rt3Producer.set(point);
});
import RT3Consumer from '../index.js';

const callbacks = {
  onSet,
  onDelete: data => console.log('onDelete', data)
};
const client = new RT3Consumer('ws://10.0.32.102:3333', callbacks);


function onSet(data) {
  const p = document.createElement('p');
  p.innerHTML = `id:[${data.id}] lat: [${data.lat}] lon:[${data.lon}] data: [${JSON.stringify(data.data)}]`;
  document.body.appendChild(p);
}
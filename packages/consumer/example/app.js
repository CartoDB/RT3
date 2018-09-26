import RT3Consumer from '../index.js';

const callbacks = {
  onSet,
  onDelete: data => console.log('onDelete', data)
};

const client = new RT3Consumer('ws://localhost:3333', callbacks);

client.getMetadata().then(meta => {
  document.querySelector('.metadata').innerHTML = JSON.stringify(meta, null, 4);
})


function onSet(data) {
  const p = document.createElement('p');
  p.innerHTML = `id:[${data.id}] lat: [${data.lat}] lon:[${data.lon}] data: [${JSON.stringify(data.data)}]`;
  document.querySelector('.log').appendChild(p);
}
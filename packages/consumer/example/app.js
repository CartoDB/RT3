import RT3Consumer from '../index.js';

const callbacks = {
  onSet: data => console.log('onSet:', data),
  onDelete: data => console.log('onDelete', data)
};
const client = new RT3Consumer('ws://10.0.32.102:3333', callbacks);
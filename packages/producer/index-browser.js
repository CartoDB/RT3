export default class RT3Producer {
  constructor(url) {
    this._socket = new WebSocket(url);
    this._socket.addEventListener('open', event => {});
    this._socket.addEventListener('message', event => {});
  }

  set(point) {
    point = Object.assign({type: 'set'}, point);
    this._socket.send(JSON.stringify(point));
  }

  delete(id) {
    this._socket.send(JSON.stringify({type: 'delete', id }));
  }

}
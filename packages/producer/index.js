export default class RT3Producer {
  constructor(url) {
    this._socket = new WebSocket(url);

    this._socket.addEventListener('open', event => {
      this._socket.send('Hello Server!');
    });

    this._socket.addEventListener('message', event => {
      this.onEvent(event);
    });
  }

  addPoint(point) {
    point = Object.assign({type: 'set'}, point);
    this._socket.send(JSON.stringify(point));
  }

  deletePoint(id) {
    this._socket.send(JSON.stringify({type: 'delete', id }));
  }

}
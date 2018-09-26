export default class RT3Consumer {
  constructor(url, {
    onSet,
    onDelete
  }) {
    this.onSet = onSet;
    this.onDelete = onDelete;

    this._socket = new WebSocket(url);

    this._socket.addEventListener('open', event => {
      this._socket.send('Hello Server!');
    });
    this._socket.addEventListener('message', event => {
      this.onEvent(event);
    });
  }

  onEvent(event) {
    const message = JSON.parse(event.data);
    switch (message.type) {
      case 'set':
        {
          const { lat, lon, id, data} = message;
          this.onSet && this.onSet({lat, lon, id, data });
          break;
        }
      case 'delete':
        {
          const {id} = message;
          this.onDelete && this.onDelete({id});
          break;
        }
    }
  }

}
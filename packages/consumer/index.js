export default class RT3Consumer {
  constructor(url) {
    this.onSet = noOp;
    this.onDelete = noOp;
    this._socket = new WebSocket(url);
    this._socket.addEventListener('message', this.onEvent.bind(this));
    this._metadataPromise = new Promise((resolve, reject) => {
      this._resolveMetadata = resolve;
      this._rejectMetadata = reject;
    });
  }

  /**
   * 
   * @param {object} callbacks 
   * @param {object} callbacks.onSet - Callback executed when the server sends a new point
   * @param {object} callbacks.onDelete - Callback executed when the server sends a new point deletion
   */
  setCallbacks({onSet, onDelete}){
    this.onSet = onSet;
    this.onDelete =  onDelete;
    this._socket.send(JSON.stringify({type: 'ready' }));
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
      case 'meta':
        this._resolveMetadata(message.data);
    }
  }

  /**
   * @return {Promise<Object>} - Return a promise with the map metadata
   */
  getMetadata(){
    return this._metadataPromise;
  }
}

function noOp() {}

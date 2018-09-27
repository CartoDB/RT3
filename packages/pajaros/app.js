class RT3Producer {
  constructor(url) {
    this._socket = new WebSocket(url);
    this._socket.addEventListener('open', event => {});
    this._socket.addEventListener('message', event => {});
  }

  set(point) {
    point = Object.assign({
      type: 'set'
    }, point);
    this._socket.send(JSON.stringify(point));
  }

  delete(id) {
    this._socket.send(JSON.stringify({
      type: 'delete',
      id
    }));
  }

}

let ID = 0;
const birds = [];
let USERNAME;
const responsiveContent = document.querySelector('as-responsive-content');
const rt3Producer = new RT3Producer('ws://10.0.32.102:3333/birds')

responsiveContent.addEventListener('ready', () => {
  const map = L.map('map', {
    zoomControl: false
  }).setView([30, 0], 3);
  map.scrollWheelZoom.disable();

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png', {
    maxZoom: 18
  }).addTo(map);

  const client = new carto.Client({
    apiKey: 'default_public',
    username: 'cartojs-test'
  });

  client.getLeafletLayer().addTo(map);

  USERNAME = prompt('Como te llamas?', `pajaro-${makeid()}`);

  map.on('click', function (e) {
    addBird(e.latlng);
  });


  setInterval(() => {
    birds.forEach(bird => {
      bird = moveBird(bird);
      rt3Producer.set(bird);
    })
  }, 1000);

});

function moveBird(bird) {
  bird.lat = bird.lat += 0.001;
  bird.lon = bird.lon += 0.001;
  return bird;
}

function addBird(latlng) {
  const bird = {
    id: `${USERNAME}-${ID++}`,
    lat: latlng.lat,
    lon: latlng.lng,
    data: {
      username: USERNAME
    }
  }
  birds.push(bird);
}

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 8; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
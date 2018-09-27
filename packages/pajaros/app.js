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
let R = 0;
let G = 0;
let B = 0;
let SIZE = 30;

const responsiveContent = document.querySelector('as-responsive-content');
const rt3Producer = new RT3Producer('ws://10.0.32.102:3333/birds?api_key=1234')

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
  }, 80);

});

document.querySelectorAll('span[data-color]').forEach(element => {
  element.addEventListener('click', e => {
    [R, G, B] = e.target.getAttribute('data-color').split(' ');
  })
});

document.querySelector('#js-size').addEventListener('change', e => {
  SIZE = e.detail[0];
})

function moveBird(bird) {
  const n1 = noise.simplex3(bird.lat / 40, bird.lon / 40, Date.now());
  bird.data.dir += 0.1 * n1;
  bird.lat += Math.sin(bird.data.dir);
  bird.lon += Math.cos(bird.data.dir);
  return bird;
}

function addBird(latlng) {
  const bird = {
    id: `${USERNAME}-${ID++}`.hashCode(),
    lat: latlng.lat,
    lon: latlng.lng,
    data: {
      username: USERNAME,
      size: SIZE,
      r: R,
      g: G,
      b: B,
      dir: Math.random() * 2 * Math.PI,
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

String.prototype.hashCode = function () {
  var hash = 0,
    i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
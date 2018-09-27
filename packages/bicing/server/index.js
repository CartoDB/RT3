const fetch = require('node-fetch');
const ws = require('ws');
const Rt3Producer = require('rt3-producer');

rt3Producer = new Rt3Producer('ws://10.0.32.102:3333/bicing');


setInterval(async () => {
  const response = await fetch('http://wservice.viabicing.cat/v2/stations');
  const data = await response.json();
  data.stations.forEach(point => {
    rt3Producer.set(transform(point));
  });

}, 2000);


function transform(rawPoint) {
  return {
    lat: rawPoint.latitude,
    lon: rawPoint.longitude,
    id: rawPoint.id,
    data: {
      type: rawPoint.type,
      streetName: rawPoint.streetName,
      streetNumber: rawPoint.streetNumber,
      altitude: rawPoint.altitude,
      slots: rawPoint.slots,
      bikes: rawPoint.bikes,
      nearbyStations: rawPoint.nearbyStations,
      status: rawPoint.status,
    }
  }
}
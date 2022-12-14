import createMap from './map.js';
import StyleControl from './style-control.js';
import DownloadControl from './download-control.js';

const mapDiv = document.getElementById('map');

const map = createMap({
  container: mapDiv
});

const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl
});

map.addControl(geocoder, 'top-right');
map.addControl(new DownloadControl(), 'bottom-left');
map.addControl(new StyleControl(), 'bottom-left');

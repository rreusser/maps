import createMap from './map.js';
import StyleControl from './style-control.js';
import DownloadControl from './download-control.js';

const mapDiv = document.getElementById('map');

const map = createMap({
  container: mapDiv
});

map.addControl(new DownloadControl(), 'bottom-left');
map.addControl(new StyleControl(), 'bottom-left');

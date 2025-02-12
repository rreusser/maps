const styles = [{
  label: 'Standard',
  icon: '🛣',
  url: 'mapbox://styles/mapbox/standard',
}, {
  label: 'Satellite',
  icon: '🛰',
  url: 'mapbox://styles/mapbox/satellite-standard',
}, {
  label: 'Outdoors',
  icon: '🏔️',
  url: 'mapbox://styles/mapbox/outdoors-v12',
}, {
  label: 'Streets',
  icon: '🚛',
  url: 'mapbox://styles/mapbox/streets-v12',
}, {
  label: 'Dark',
  icon: '🌚',
  url: 'mapbox://styles/mapbox/dark-v11',
}, {
  label: 'Light',
  icon: '🌝',
  url: 'mapbox://styles/mapbox/light-v11',
}];

export default class StyleControl {
  constructor() {
  }

  onAdd(map) {
    this._map = map;
    this._controlContainer = document.createElement('div');
    this._controlContainer.classList = `mapboxgl-ctrl mapboxgl-ctrl-group mapboxgl-ctrl-style`;

    const btns = [];
    styles.forEach(style => {
      const btn = document.createElement('button');
      btns.push(btn);
      btn.textContent = style.icon;
      btn.classList.add('style-btn');
      btn.title = style.label;
      btn.addEventListener('click', function () {
        map.setStyle(style.url);
        btns.forEach(btn => btn.classList.remove('active'));
        btn.classList.add('active');
      });
      this._controlContainer.appendChild(btn);
    })

    btns[0].click();

    return this._controlContainer;
  }

  onRemove() {
    this._controlContainer.remove();
    this._map = null;
  }
}

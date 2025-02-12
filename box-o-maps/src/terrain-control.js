export default class TerrainControl {
  constructor() {
  }

  onAdd(map) {
    this._map = map;
    this._container = document.createElement("div");
    this._container.classList.add("mapboxgl-ctrl");
    this._container.classList.add("mapboxgl-ctrl-group");
    this._container.classList.add("mapboxgl-ctrl-download");

    const btn = document.createElement("button");
    btn.setAttribute("aria-label", "Toggle terrain");
    btn.setAttribute("title", "Toggle terrain");
    btn.style.lineHeight = "35px";
    btn.style.fontSize = "2em";

    const icon = document.createElement("span");
    icon.classList.add("mapboxgl-ctrl-icon");
    icon.setAttribute("aria-hidden", true);
    icon.textContent = "⛰️";

    btn.appendChild(icon);

    btn.addEventListener("click", this.toggle.bind(this));

    this._map.on('style.load', this.syncState.bind(this));

    this._btn = btn;
    this._container.appendChild(btn);
    return this._container;
  }

  syncState () {
    console.log('sync');
    if (this._map.getTerrain()) {
      this._btn.classList.add('active');
    } else {
      this._btn.classList.remove('active');
    }
  }

  toggle () {
    if (this._map.getTerrain()) {
      this._map.setTerrain(null);
    } else {
      const src = this._map.getSource('mapbox-dem');
      if (!src) {
        this._map.addSource('mapbox-dem', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
          'tileSize': 512,
          'maxzoom': 14
        });
      }
      this._map.setTerrain({
        source: 'mapbox-dem',
        exaggeration: 1
      });
    }
    this.syncState();
  }

  onRemove() {
    this._controlContainer.remove();
    this._map = null;
  }
}

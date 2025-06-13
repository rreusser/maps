function createBtn({ icon, onClick, title }) {
  const btn = document.createElement("button");
  if (icon instanceof HTMLElement) {
    btn.appendChild(icon);
  } else {
    btn.textContent = icon;
  }
  btn.classList.add("style-btn");
  btn.title = title;
  btn.addEventListener("click", onClick);
  return btn;
}

export default class StyleControl {
  constructor(styleList, { onSetStyle, initialStyle } = {}) {
    this.styleList = styleList;
    this.currentStyle = initialStyle || this.styleList[0];
    this.onSetStyle = onSetStyle;
  }

  onAdd(map) {
    this._map = map;
    this._controlContainer = document.createElement("div");
    this._controlContainer.classList = `mapboxgl-ctrl mapboxgl-ctrl-group mapboxgl-ctrl-style`;

    const style = this.styleList[0];
    this._curStyleIcon = document.createElement("span");
    this._curStyleIcon.textContent = style.icon;
    this._styleMenu = createBtn({
      icon: this._curStyleIcon,
      title: 'Map style',
      onClick: () => this._styleMenu.classList.toggle("active"),
    });
    this._styleMenu.classList.add("style-menu");

    const container = document.createElement("div");
    container.classList.add("style-menu-container");
    this._styleMenu.appendChild(container);

    const btnList = document.createElement("ul");
    container.appendChild(btnList);
    btnList.classList.add("mapboxgl-ctrl-group");
    this._styleButtons = [];
    for (const style of this.styleList) {
      const { label, icon, url, slug } = style;
      const btn = createBtn({
        icon,
        title: label,
        onClick: (event) => {
          event.stopPropagation();
          this.currentStyle = style;
          this.onSetStyle && this.onSetStyle(style);
          this.syncTerrain();
          this._styleMenu.classList.remove("active");
          this.syncStyleButtons();
        },
      });
      this._styleButtons.push(btn);
      btn.setAttribute("data-style-slug", slug);
      btnList.appendChild(btn);
    }

    this._terrainBtn = createBtn({
      icon: "🏔️",
      title: "Toggle terrain",
      onClick: this.toggleTerrain.bind(this),
    });

    [this._terrainBtn, this._styleMenu].forEach((btn) =>
      this._controlContainer.appendChild(btn)
    );

    this._map.on("style.load", this.syncTerrain.bind(this));
    this._map.on("click", () => {
      this._styleMenu.classList.remove("active");
    });
    this.syncStyleButtons();

    return this._controlContainer;
  }

  syncStyleButtons() {
    this._curStyleIcon.textContent = this.currentStyle.icon;
    this._styleButtons.forEach((btn) => {
      const btnSlug = btn.getAttribute("data-style-slug");
      if (btnSlug === this.currentStyle.slug) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  syncTerrain() {
    if (this._map.getTerrain()) {
      this._terrainBtn.classList.add("active");
    } else {
      this._terrainBtn.classList.remove("active");
    }
  }

  toggleTerrain() {
    if (this._map.getTerrain()) {
      this._map.setTerrain(null);
    } else {
      const src = this._map.getSource("mapbox-dem");
      if (!src) {
        this._map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
      }
      this._map.setTerrain({
        source: "mapbox-dem",
        exaggeration: 1,
      });
    }
    this.syncTerrain();
  }

  onRemove() {
    this._controlContainer.remove();
    this._map = null;
  }
}

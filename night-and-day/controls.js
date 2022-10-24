export class DateOutputControl {
  onAdd(map) {
    const ctrl = document.createElement('div');
    ctrl.style.textAlign = 'right';
    this.el = document.createElement('span');
    ctrl.appendChild(this.el);
    this.el.id = 'date';
    return ctrl;
  }

  set (value) {
    el.textContent = value;
  }
}

export class InfoControl {
  onAdd(map) {
    this._map = map;
    this._controlContainer = document.createElement('div');
    this._controlContainer.classList = 'mapboxgl-ctrl mapboxgl-ctrl-group mapboxgl-ctrl-info';

    const toggle = document.createElement('button');
    toggle.textContent = 'i';
    toggle.addEventListener('click', this.toggle.bind(this));

    const popup = document.createElement('div');
    popup.style.display = 'none';
    popup.classList = 'info-popup';
    popup.innerHTML = `
      <div class="info-modal">
        <p>This page renders Earth's <a href="https://en.wikipedia.org/wiki/Terminator_(solar)">solar terminator</a> on a <a href="https://www.mapbox.com/">Mapbox</a> map. It fetches <a href="https://studio.mapbox.com/tilesets/rreusser.black-marble/">Black Marble tiles</a> and uses a WebGL shader to composite the terminator into the alpha channel of the tiles, outputting the result to a <a href="https://github.com/mapbox/mapbox-gl-js/pull/12063">custom raster source</a>.</p>
        <p>The astronomical calculations are entirely based on a distillation of Volodymyr Agafonkin's amazing <a href="https://github.com/mourner/suncalc">SunCalc</a> library.</p>
        <p>You can adjust the altitude (in degrees) above or below the horizon at which the terminator is faded. Step strength turns on six degree steps, corresponding to the steps of sunset (0˚), civil twilight (-6˚), nautical twilight (-12˚), and astronomical twilight (-18˚).</p>
        <p><em>Source: <a href="https://earthobservatory.nasa.gov/features/NightLights/page3.php">NASA Earth at Night</a></em></p>
      </div>
    `;

    document.getElementById('map').appendChild(popup);

    popup.addEventListener('click', this.toggle.bind(this));
    this.popup = popup;

    this._controlContainer.appendChild(toggle);
    return this._controlContainer;
  }

  toggle () {
    this.popup.style.display = this.popup.style.display === 'none' ? 'block' : 'none';
  }
}

export class GuiControl {
  constructor (guiParams, terminatorRenderer) {
    this.guiParams = guiParams;
    this.terminatorRenderer = terminatorRenderer;
  }

  onAdd(map) {
    const guiParams = this.guiParams;
    const terminatorRenderer = this.terminatorRenderer;

    guiParams['Download PNG'] = function downloadPng () {
      map.once("render", function () {
        var link = document.createElement("a");
        link.target = '_blank';
        link.download = "map.png";
        link.href = map._canvas.toDataURL();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
      map.triggerRepaint();
    }

    const gui = new dat.GUI({ autoPlace: false });
    gui.close();

    var projection = gui.add(guiParams, 'projection', ['globe', 'mercator', 'naturalEarth', 'albers', 'winkelTripel']);
    projection.onFinishChange((value) => {
        map.setProjection({name: value});
    });

    var dayOfYear = gui.add(guiParams, 'dayOfYear', 0, 365, 1).listen();
    dayOfYear.onChange((value) => {
      guiParams.live = false;
      clearInterval(interval);
      updateDate(value, guiParams.hourOfDay);
    });

    var hourOfDay = gui.add(guiParams, 'hourOfDay', 0, 24, 24 / 360).listen();
    hourOfDay.onChange((value) => {
      guiParams.live = false;
      clearInterval(interval);
      updateDate(guiParams.dayOfYear, value);
    });

    var dawnAltitude = gui.add(guiParams, 'dawnAltitude', 0, 90, 0.01);
    dawnAltitude.onChange((value) => {
      terminatorRenderer.fadeRange = [guiParams.dawnAltitude, guiParams.twilightAltitude];
    });

    var twilightAltitude = gui.add(guiParams, 'twilightAltitude', -90, 0, 0.01);
    twilightAltitude.onChange((value) => {
      terminatorRenderer.fadeRange = [guiParams.dawnAltitude, guiParams.twilightAltitude];
    });

    var stepStrength = gui.add(guiParams, 'stepStrength', 0, 1, 0.01);
    stepStrength.onChange((value) => {
      terminatorRenderer.stepping = guiParams.stepStrength;
    });

    var opacity = gui.add(guiParams, 'opacity', 0, 1);
    opacity.onChange((value) => {
        map.setPaintProperty('solar-terminator', 'raster-opacity', value);
    });


    var live = gui.add(guiParams, 'live', true).listen();
    let interval;
    function onLiveChange (value) {
      if (value) {
        updateDate();
        interval = setInterval(() => {
          updateDate();
        }, 1000);
      } else {
        clearInterval(interval);
      }
    }
    live.onChange(onLiveChange);
    onLiveChange(guiParams.live);

    function updateDate (dayOfYear, hourOfDay) {
      let date = new Date();
      if (!guiParams.live) {
        date = new Date(+new Date('2022-01-01T00:00:00.000Z') + (dayOfYear * 24 + hourOfDay) * 3600 * 1000)
      }
      document.getElementById('date').textContent = date.toLocaleString();
      terminatorRenderer.date = date;
    }

    gui.add(guiParams, 'Download PNG');

    return gui.domElement;
  }
}

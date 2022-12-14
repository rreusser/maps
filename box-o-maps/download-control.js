function downloadURI(uri, filename) {
  var link = document.createElement("a");
  link.target = '_blank';
  link.download = filename;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default class DownloadControl {
  constructor() { }

  onAdd(map) {
    this._controlContainer = document.createElement('div');
    this._controlContainer.classList = `mapboxgl-ctrl mapboxgl-ctrl-group mapboxgl-ctrl-download`;

    const btn = document.createElement('button');

    btn.textContent = '📷';
    btn.title = 'Download PNG';

    btn.addEventListener('click', function () {
      map.once("render", function() {
        downloadURI(map.getCanvas().toDataURL(), 'map.png');
      });
      map.triggerRepaint();
    });

    this._controlContainer.appendChild(btn);

    return this._controlContainer;
  }

  onRemove() {
    this._controlContainer.remove();
  }
}

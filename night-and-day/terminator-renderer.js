import LRU from 'https://cdn.skypack.dev/lru-cache@7.14.0';
import Tiler from './tiler.js';

export default class TerminatorRenderer {
  constructor({
    tileSize = 256,
    fadeRange = [12, -12],
    is2x = devicePixelRatio > 1,
    fetchTileImageBitmap,
    date = null,
    stepping=0
  } = {}) {
    this.type = "custom";
    this.tileSize = tileSize;

    // TODO: infer this from fetched tiles and select output size accordingly
    const renderSize = is2x ? 512 : 256;

    const canvas = document.createElement('canvas');
    canvas.width = renderSize;
    canvas.height = renderSize;
    this.tiler = new Tiler(canvas);
    this._fadeRange = fadeRange;
    this._date = date ?? new Date();
    this._stepping = stepping ?? 0.0;
    this.tileBitmapCache = new LRU({
      max: 50,
      fetchMethod: fetchTileImageBitmap
    });
  }

  clear() {
    this.update && this.update();
  }

  set fadeRange(value) {
    this._fadeRange = value;
    this.clear();
  }

  set stepping(value) {
    this._stepping = value;
    this.clear();
  }

  set date(value) {
    this._date = value;
    this.clear();
  }

  async loadTile({ x, y, z }) {
    this.tiler.render({
      x,
      y,
      z,
      date: this._date,
      fadeRange: this._fadeRange,
      stepping: this._stepping,
      texture: await this.tileBitmapCache.fetch(`${z}/${x}/${y}`)
    });
    return await this.tiler.getImageBitmap();
  }
}

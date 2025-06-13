function downloadURI(uri, filename) {
  var link = document.createElement("a");
  link.target = "_blank";
  link.download = filename;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function copyTextToClipboard(text) {
  var textArea = document.createElement("textarea");

  //
  // *** This styling is an extra step which is likely not required. ***
  //
  // Why is it here? To ensure:
  // 1. the element is able to have focus and selection.
  // 2. if the element was to flash render it has minimal visual impact.
  // 3. less flakyness with selection and copying which **might** occur if
  //    the textarea element is not visible.
  //
  // The likelihood is the element won't even render, not even a
  // flash, so some of these are just precautions. However in
  // Internet Explorer the element is visible whilst the popup
  // box asking the user for permission for the web page to
  // copy to the clipboard.
  //

  // Place in the top-left corner of screen regardless of scroll position.
  textArea.style.position = "fixed";
  textArea.style.top = 0;
  textArea.style.left = 0;

  // Ensure it has a small width and height. Setting to 1px / 1em
  // doesn't work as this gives a negative w/h on some browsers.
  textArea.style.width = "2em";
  textArea.style.height = "2em";

  // We don't need padding, reducing the size if it does flash render.
  textArea.style.padding = 0;

  // Clean up any borders.
  textArea.style.border = "none";
  textArea.style.outline = "none";
  textArea.style.boxShadow = "none";

  // Avoid flash of the white box if rendered for any reason.
  textArea.style.background = "transparent";

  textArea.value = text;

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand("copy");
    var msg = successful ? "successful" : "unsuccessful";
    console.log("Copying text command was " + msg);
  } catch (err) {
    console.log("Oops, unable to copy");
  }

  document.body.removeChild(textArea);
}

export default class SnapshotControl {
  onAdd(map) {
    this._map = map;
    this._container = document.createElement("div");
    this._container.classList.add("mapboxgl-ctrl");
    this._container.classList.add("mapboxgl-ctrl-group");
    this._container.classList.add("mapboxgl-ctrl-download");

    {
      const btn = document.createElement("button");
      btn.setAttribute("aria-label", "Download snapshot");
      btn.setAttribute("title", "Download snapshot");
      btn.style.lineHeight = "40px";
      btn.style.fontSize = "2em";

      const icon = document.createElement("span");
      icon.classList.add("mapboxgl-ctrl-icon");
      icon.setAttribute("aria-hidden", true);
      icon.textContent = "📷";
      btn.appendChild(icon);
      btn.addEventListener("click", this.download.bind(this));
      this._container.appendChild(btn);
    }

    {
      const btn = document.createElement("button");
      btn.setAttribute("aria-label", "Copy share link to clipboard");
      btn.setAttribute("title", "Copy share link to clipboard");
      btn.style.lineHeight = "40px";
      btn.style.fontSize = "2em";

      const icon = document.createElement("span");
      icon.classList.add("mapboxgl-ctrl-icon");
      icon.setAttribute("aria-hidden", true);
      icon.textContent = "🔗";
      btn.appendChild(icon);
      btn.addEventListener("click", () => {
        copyTextToClipboard(window.location.href);
        btn.classList.add("copied");
        btn.textContent = "✅";
        setTimeout(() => (btn.textContent = "🔗"), 2000);
      });
      this._container.appendChild(btn);
    }

    return this._container;
  }

  download() {
    this._map.once("render", () => {
      const link = document.createElement("a");
      link.target = "_blank";
      link.download = "map.png";
      this.prepareImage(this._map.getCanvas())
        .then((href) => {
          link.href = href;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((err) => {
          console.error(err);
        });
    });
    this._map.triggerRepaint();
  }

  prepareImage(mapCanvas) {
    const dpr = window.devicePixelRatio;
    const canvas = document.createElement("canvas");
    canvas.width = mapCanvas.width;
    canvas.height = mapCanvas.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(mapCanvas, 0, 0);

    ctx.scale(dpr, dpr);

    const logo = this._map.getContainer().querySelector(".mapboxgl-ctrl-logo");
    const attrib = this._map
      .getContainer()
      .querySelector(".mapboxgl-ctrl-attrib");

    const mapWidth = mapCanvas.width / dpr;
    const mapHeight = mapCanvas.height / dpr;

    let renderLogo = Promise.resolve();
    if (logo) {
      const img = new Image();
      const imgHeight = 23;
      const imgWidth = 88;
      renderLogo = new Promise(function (resolve, reject) {
        img.onload = () => resolve(img);
        img.onerror = reject;
      }).then((img) => {
        if (!img) return;
        ctx.drawImage(img, 6, mapHeight - imgHeight - 6, imgWidth, imgHeight);
      });
      img.src = window
        .getComputedStyle(logo)
        .backgroundImage.replace(/^url\(['"]/, "")
        .replace(/['"]\)$/, "");
    }

    if (attrib) {
      const text = attrib.textContent.replace("Improve this map", "").trim();
      ctx.font = `${window.getComputedStyle(attrib).fontSize} ${
        window.getComputedStyle(attrib).fontFamily
      }`;
      const vpad = 3;
      const hpad = 5;
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      const size = ctx.measureText(text);
      const height = size.fontBoundingBoxAscent + size.fontBoundingBoxDescent;
      ctx.fillStyle = "rgb(255 255 255 / .5)";
      ctx.fillRect(
        mapWidth - size.width - 2 * hpad,
        mapHeight - height - 2 * vpad,
        size.width + 2 * hpad,
        height + 2 * vpad
      );
      ctx.fillStyle = "black";
      ctx.fillText(
        text,
        mapWidth - hpad,
        mapHeight - size.fontBoundingBoxDescent - vpad
      );
    }

    return renderLogo.then(() => canvas.toDataURL());
  }

  onRemove() {
    this._container.remove();
  }
}

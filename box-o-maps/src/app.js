const { useRef, useState, useEffect } = React;
import StyleControl from "./style-control.js";
import DownloadControl from "./download-control.js";
//import TerrainControl from './terrain-control.js';

const styles = [
  {
    label: "Standard",
    slug: "standard",
    icon: "🌎",
    url: "mapbox://styles/mapbox/standard",
  },
  {
    label: "Standard Satellite",
    slug: "standard-satellite",
    icon: "🫱🏼‍🫲🏾",
    url: "mapbox://styles/mapbox/standard-satellite",
  },
  {
    label: "Satellite",
    slug: "satellite-v9",
    icon: "🛰️",
    url: "mapbox://styles/mapbox/satellite-v9",
  },
  {
    label: "Streets",
    slug: "streets-v12",
    icon: "🛣️",
    url: "mapbox://styles/mapbox/streets-v12",
  },
  {
    label: "Outdoors",
    slug: "outdoors-v12",
    icon: "🥾",
    url: "mapbox://styles/mapbox/outdoors-v12",
  },
  {
    label: "Dark",
    slug: "dark-v11",
    icon: "🌚",
    url: "mapbox://styles/mapbox/dark-v11",
  },
  {
    label: "Light",
    slug: "light-v11",
    icon: "🌝",
    url: "mapbox://styles/mapbox/light-v11",
  },
];

function pushState({ style }) {
  const params = new URLSearchParams(window.location.search);
  params.set("style", style.slug);
  const newUrl =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    "?" +
    params.toString() +
    window.location.hash;
  window.history.pushState({ path: newUrl }, "", newUrl);
}

function parseURL() {
  const params = new URLSearchParams(window.location.search);
  const styleSlug = params.get("style");
  const style = styles.find(({ slug }) => slug === styleSlug) || styles[0];
  const terrain = !!params.get("terrain");
  return { style, terrain };
}

export default function App() {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    const { style, terrain } = parseURL();

    pushState({ style, terrain });

    const newMap = (window.map = new mapboxgl.Map({
      container: mapContainer.current,
      style: style.url,
      center: [0, 0],
      zoom: 0.4,
      hash: true,
    }));

    const styleControl = new StyleControl(styles, {
      initialStyle: style,
      onSetStyle: (style) => {
        newMap.setStyle(style.url);
        pushState({ style });
      },
    });
    const downloadControl = new DownloadControl();
    const geocoderControl = new MapboxGeocoder({
      accessToken: window.mapboxgl.accessToken,
      mapboxgl: window.mapboxgl,
    });
    const fullscreenControl = new mapboxgl.FullscreenControl({
      container: document.querySelector("body"),
    });
    const navigationControl = new mapboxgl.NavigationControl();
    const scaleControl = new mapboxgl.ScaleControl();

    newMap.addControl(downloadControl, "bottom-left");
    newMap.addControl(styleControl, "bottom-left");
    newMap.addControl(geocoderControl, "top-right");
    newMap.addControl(fullscreenControl, "top-left");
    newMap.addControl(navigationControl, "top-left");
    newMap.addControl(scaleControl, "bottom-right");

    setMap(newMap);
  }, []);

  return html`<div>
    <div ref=${mapContainer} id="map" />
  </div>`;
}

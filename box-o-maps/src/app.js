const { useRef, useState, useEffect } = React;
import StyleControl from './style-control.js';
import DownloadControl from './download-control.js';

export default function App() {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [styleControl, setStyleControl] = useState(null);
  const [downloadControl, setDownloadControl] = useState(null);
  const [geocoderControl, setGeocoderControl] = useState(null);

  useEffect(() => {
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [0, 0],
      zoom: 0.4,
      hash: true,
      projection: 'mercator',
    });

    const styleControl = new StyleControl();
    const downloadControl = new DownloadControl();
    const geocoderControl = new MapboxGeocoder({
      accessToken: window.mapboxgl.accessToken,
      mapboxgl: window.mapboxgl
    });

    setStyleControl(styleControl);
    setDownloadControl(downloadControl);
    setGeocoderControl(geocoderControl);

    newMap.addControl(downloadControl, 'bottom-left');
    newMap.addControl(styleControl, 'bottom-left');
    newMap.addControl(geocoderControl, 'top-right');

    setMap(newMap);
  }, []);

  return html`<div>
    <div ref=${mapContainer} id="map" />
  </div>`;
}

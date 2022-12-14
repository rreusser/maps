mapboxgl.accessToken = 'pk.eyJ1IjoicnJldXNzZXIiLCJhIjoiY2w5a3ZvcHU3NTJvZDNvcW1hcHAzeXB6cCJ9.CDFj_g1W8pBg6KA-ascYig';

export default function createMap ({
  container = null,
  style = 'mapbox://styles/mapbox/streets-v12',
  center = [0, 0],
  zoom = 0.4,
  hash = true,
  projection = 'mercator'
}={}) {
  return new mapboxgl.Map({
    container,
    style,
    center,
    zoom,
    projection
  });
}

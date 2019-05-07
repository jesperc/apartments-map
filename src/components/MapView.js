import 'leaflet/dist/leaflet.css';
import '../styles/global.css';

import L from 'leaflet';

// Initialize the map
var map = L.map('map', {
    scrollWheelZoom: true
});

const MapView = (props) => {
    // Set the position and zoom level of the map
    map.setView([47.70, 13.35], 7);

    // Initialize the base layer
    var osm_mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OSM Mapnik <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    return null;
};

export default MapView;
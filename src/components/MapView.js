import 'leaflet/dist/leaflet.css';
import '../styles/global.css';

import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const map = L.map('map', {
    scrollWheelZoom: true
});

const MapView = ({list}) => {
    // set the position and zoom level of the map
    map.setView([59.334591, 18.063240], 11);

    // initialize the base layer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OSM Mapnik <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // set markers
    for (let item of list) {
        if (item.lat != null && item.lng != null) {
            L.marker([item.lat, item.lng]).addTo(map);
        }
    }

    return null;
};

export default MapView;
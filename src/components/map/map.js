import './map.css'
import { MapContainer, TileLayer } from 'react-leaflet'


function Map() {
    return(
        <MapContainer id="map" center={[43.87695, 11.79992]} zoom={18} scrollWheelZoom={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
        </MapContainer>
    );
}

export default Map;
var map = L.map('map').setView([44.0147, 11.5904], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var geojsonFeature = {
	"type": "Feature",
	"properties": {
		"name": "San Domenico in Campigno",
		"amenity": "Church",
		"popupContent": "Punto di partenza"
	},
	"geometry": {
		"type": "Point",
		"coordinates": [11.5914, 44.0199]
	}
};

var markerOptions = {
	radius: 8,
	fillColor: "#f54254",
	color: "#000000",
	weight: 1,
	opacity: 1,
	fillOpacity: 0.8
};

function onEachFeature(feature, layer) {
	if (feature.properties && feature.properties.popupContent) {
		layer.bindPopup(feature.properties.popupContent);
	}
}

L.geoJSON(geojsonFeature, {
	onEachFeature: onEachFeature,
	pointToLayer: function (feature, latlng) {
		return L.circleMarker(latlng, markerOptions);
	}
}).addTo(map);

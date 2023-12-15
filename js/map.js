var map = L.map('map').setView([44.0147, 11.5904], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

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

async function updatePoints() {
	var NE = map.getBounds()._northEast;
	var SW = map.getBounds()._southWest;
	//SWNE is the order for overpass bbox definition 
	//nwr(S,W,N,E)["fixme"="continue"]
	
	var overpassData = await getOverpassData(SW.lat, SW.lng, NE.lat, NE.lng);
	var geojson = jsonToGeoJson(overpassData);

	L.geoJSON(geojson, {
		onEachFeature: onEachFeature,
		pointToLayer: function (feature, latlng) {
			return L.circleMarker(latlng, markerOptions);
		}
	}).addTo(map);
}

function getOverpassData(south, west, north, east) {
	var apiCall = "https://overpass-api.de/api/interpreter?data=%5Bout%3Ajson%5D%5Btimeout%3A25%5D%3B%0Anwr%28" + south + "%2C" + west + "%2C" + north + "%2C" + east + "%29%5B%22fixme%22%3D%22continue%22%5D%3B%0Aout%20geom%3B";
	return fetch(apiCall)
		.then(response => {
			if (!response.ok) {
				throw new Error('nada');
			}
			return response.json();
		})
		.then(data => {
			return data;
		})
		.catch(error => {
			console.error('Error:', error);
		});
}

function jsonToGeoJson(json) {
	var geojson = {   type: "FeatureCollection",   features: [], };
	
	for (i = 0; i < json.elements.length; i++) {
		geojson.features.push({
			"type": "Feature",
			"geometry": {
				"type": "Point",
				"coordinates": [json.elements[i].lon, json.elements[i].lat]
			},
			"properties": {
				"popupContent": "fixme:continue"
			}
		});
	}

	return geojson;
}

//first map update
updatePoints();

map.on('zoomend', function() {
	updatePoints();
});

map.on('dragend', function() {
	updatePoints();
});

var map = L.map('map').setView([44.0147, 11.5904], 14); //TODO: how do we choose initial view? Get user position? Even better get a place nearby user position with many fixme:continue

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var fixmeContinueStyle = {
	radius: 8,
	fillColor: "#f54254",
	color: "#000000",
	weight: 1,
	opacity: 1,
	fillOpacity: 0.8
};

var highlightedFixmeContinueStyle = {
	radius: 8,
	fillColor: "#215229",
	color: "#000000",
	weight: 1,
	opacity: 1,
	fillOpacity: 1
};

var destinationStyle = {
	radius: 6,
	fillColor: "#42f560",
	color: "#000000",
	weight: 1,
	opacity: 1,
	fillOpacity: 0.8
};

var basemaps = {
	None: L.tileLayer(''),

	'CTR Toscana': L.tileLayer.wms('https://www502.regione.toscana.it/ows_ctr/com.rt.wms.RTmap/ows?', {
		map: 'owsctr',
		layers: 'rt_ctr.10k',
		format: 'image/png',
		transparent: true,
		version: '1.3.0'
	}),

	'CTR Emilia-Romagna': L.tileLayer.wms('https://servizigis.regione.emilia-romagna.it/wms/dbtr_ctrmultiscala?', {
		layers: 'DBTR_CtrMultiscala',
		format: 'image/png',
		transparent: true,
		version: '1.3.0'
	})
};

L.control.layers(basemaps).addTo(map);
basemaps.None.addTo(map);
var fixmecontinueLayer = new L.Layer();
var destinationLayer = new L.Layer();
var highlightedFixmecontinue = new L.circleMarker();

async function whenPointClicked(e) {
	//clean up old destination to avoid confusion/overlapping
	destinationLayer.remove();
	highlightedFixmecontinue.remove();
	//clean up all fixme continue for the same reason
	fixmecontinueLayer.remove();
	//center position on where i clicked
	map.panTo(e.latlng);
	var currentCoord = e.sourceTarget.feature.geometry.coordinates;
	var lon = currentCoord[0];
	var lat = currentCoord[1];
	var radius = document.getElementById('map-options-radius').value;

	var destinations = await getOverpassAround(lat, lon, radius);
	var geoJson = jsonToGeoJson(destinations);

	destinationLayer = L.geoJSON(geoJson, {
		pointToLayer: function (feature, latlng) {
			return L.circleMarker(latlng, destinationStyle);
		}
	});

	//draw the clicked button in a different color	
	highlightedFixmecontinue = L.circleMarker(e.latlng, highlightedFixmeContinueStyle).addTo(map);
	//remove the destination in the same coord
	for (let [key, value] of Object.entries(destinationLayer._layers)) {
		if (value._latlng.equals(e.latlng)) {
			delete destinationLayer._layers[key];
		}
	}

	destinationLayer.addTo(map);
}

function onEachFeature(feature, layer) {
	layer.on({
		click: whenPointClicked
	});
}

async function updatePoints() {
	if (map.getZoom() < 13) {
		return;
	}
	fixmecontinueLayer.remove();
	destinationLayer.remove();
	highlightedFixmecontinue.remove();
	var NE = map.getBounds()._northEast;
	var SW = map.getBounds()._southWest;
	
	var overpassData = await getOverpassData(SW.lat, SW.lng, NE.lat, NE.lng);
	var geoJson = jsonToGeoJson(overpassData);

	fixmecontinueLayer = L.geoJSON(geoJson, {
		onEachFeature: onEachFeature,
		pointToLayer: function (feature, latlng) {
			return L.circleMarker(latlng, fixmeContinueStyle);
		}
	}).addTo(map);
}

function getOverpassAround(lat, lon, around) {
	var apiCall = "https://overpass-api.de/api/interpreter?data=%5Bout%3Ajson%5D%3B%0A%28%0A%20node%5B%22natural%22%3D%22peak%22%5D%28around%3A" + around + "%2C%20" + lat + "%2C" + lon +"%29%3B%0A%20%20node%5B%22place%22~%22locality%7Cisolated_dwelling%22%5D%28around%3A" + around + "%2C%20" + lat + "%2C" + lon + "%29%3B%0A%20%20node%5B%22fixme%22%3D%22continue%22%5D%28around%3A" + around + "%2C%20" + lat + "%2C" + lon + "%29%3B%0A%29%3B%0Aout%20geom%3B";

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

document.getElementById('map-options-reload').addEventListener("click", updatePoints);
/*map.on('zoomend', function() {
	updatePoints();
});

map.on('dragend', function() {
	updatePoints();
});*/


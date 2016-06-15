var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm = new L.TileLayer(osmUrl, {minZoom: 1, maxZoom: 19, attribution: osmAttrib});

var map = L.map('map', {
    // default center on berlin
    center: [52.5196530,13.3728780],
    zoom: 4
});
map.addLayer(osm);

ajax({
    method: 'GET',
    url: 'http://localhost:8090/airports'
}).then(function(response) {
    response.forEach(function(airport) {
        if (airport.location && airport.location.length == 2) {
            var colorName = airport.delayed > airport.onTime ? 'red' : 'green';
            var color = airport.delayed > airport.onTime ? '#f03' : '#0f0';
            var circle = L.circleMarker(airport.location, {
                color: colorName,
                fillColor: color,
                fillOpacity: 0.5
            }).addTo(map);
            circle.bindPopup(airport.airportCode);
        }
    });
});

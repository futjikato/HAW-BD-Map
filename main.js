var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm = new L.TileLayer(osmUrl, {minZoom: 1, maxZoom: 19, attribution: osmAttrib});

var map = L.map('map', {
    // default center on berlin
    center: [52.5196530,13.3728780],
    zoom: 4
});
map.addLayer(osm);

var date = '14-06-2016';
var airportData = [];
var markers = [];

function showAirportMarkerForDate() {
    airportData.forEach(function(airport) {
        if (airport.dateData && airport.location && airport.location.length == 2) {
            var delayed = (airport.dateData[date] && airport.dateData[date].delayed ? airport.dateData[date].delayed : 0);
            var onTime = (airport.dateData[date] && airport.dateData[date].onTime ? airport.dateData[date].onTime : 0);

            if (delayed == 0 && onTime == 0)
                return;

            var total = delayed + onTime;
            var delayedPercentage = delayed / (total / 100);

            var colorName = delayedPercentage > 30 ? 'red' : 'green';
            var color = delayedPercentage > 30 ? '#f03' : '#0f0';

            var circle = L.circleMarker(airport.location, {
                color: colorName,
                fillColor: color,
                fillOpacity: 0.5
            }).addTo(map);
            circle.bindPopup(
                '<h2>' + airport.airportCode + '</h2>' +
                (airport.cityName ? '<h3>' + airport.cityName + '</h3>' : '') +
                '<dl>' +
                '<dt>Delayed</dt>' +
                '<dd>' + delayed + '</dd>' +
                '<dt>On time</dt>' +
                '<dd>' + onTime + '</dd>' +
                '</dl>'
            );
            circle.on('popupopen', function() {
                ajax({
                    method: 'GET',
                    url: 'http://localhost:8070/lat/'+airport.location[0]+'/lon/'+airport.location[1]+'/date/'+date+' 23:59:59'
                }).then(function(response) {
                    var cnt = circle.getPopup().getContent();
                    if (!cnt.indexOf('WEATHER')) {
                        cnt += '<p>Weather: '+response+'</p>';
                        circle.getPopup().setContent(cnt);
                    }
                });
            });
            markers.push(circle);
        } else {

        }
    });
}

document.getElementById('date-select').addEventListener('change', function(e) {
    date = e.target.value;
    markers.forEach(function (marker) {
        map.removeLayer(marker);
    });
    showAirportMarkerForDate();
});

ajax({
    method: 'GET',
    url: 'http://localhost:8090/airports'
}).then(function(response) {
    airportData = response;
    showAirportMarkerForDate();
});

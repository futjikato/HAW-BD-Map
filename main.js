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
var weatherData = [];
var markers = [];

function showAirportMarkerForDate() {
    console.log('Render markers');
    airportData.forEach(function(airport) {
        if (airport.dateData && airport.location && airport.location.length == 2) {
            var delayed = (airport.dateData[date] && airport.dateData[date].delayed ? airport.dateData[date].delayed : 0);
            var onTime = (airport.dateData[date] && airport.dateData[date].onTime ? airport.dateData[date].onTime : 0);

            if (delayed == 0 && onTime == 0)
                return;

            var total = delayed + onTime;
            var delayedPercentage = delayed / (total / 100);

            var weatherKey = airport.location[0] + ',' + airport.location[1];
            var weatherStat = 'No Info';
            if (weatherData.hasOwnProperty(weatherKey))
                weatherStat = weatherData[weatherKey];

            var colorName;
            var color;
            if (weatherStat == 'No Info') {
                colorName = delayedPercentage > 30 ? 'red' : 'green';
                color = delayedPercentage > 30 ? '#f03' : '#0f0';
            } else {
                if (delayedPercentage > 30 && weatherStat == 'Delay not possible') {
                    colorName = '#FF0DFF';
                    color = '#C105FF';
                } else if (delayedPercentage > 30) {
                    colorName = '#FF740D';
                    color = '#DE650B';
                } else if (delayedPercentage <= 30 && weatherStat == 'Delay not possible') {
                    colorName = 'green';
                    color = '#0f0';
                } else {
                    colorName = '#DEC000';
                    color = '#DEC000';
                }
            }

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
                '<dt>Weather</dt>' +
                '<dd>' + weatherStat + '</dd>' +
                '</dl>'
            );
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
    loadWeatherData().then(function() {
        showAirportMarkerForDate();
    });
});

ajax({
    method: 'GET',
    url: 'http://localhost:8090/airports'
}).then(function(response) {
    airportData = response;
    loadWeatherData().then(function() {
        showAirportMarkerForDate();
    });
});

function loadWeatherData() {
    return new Promise(function(resolve) {
        ajax({
            method: 'GET',
            url: 'http://localhost:8070/locations/date/' + date
        }).then(function(res) {
            if (!Array.isArray(res)) {
                weatherData = [];
                resolve();
                return;
            }

            var trans = {};
            res.forEach(function(obj) {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        trans[key] = obj[key];
                    }
                }
            });
            console.log(trans);
            weatherData = trans;
            resolve();
        });
    })
}

// Earthquake data link 
var URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(URL, function(data) {

  createFeatures(data.features);
  console.log(data.features)
});

function createFeatures(earthquakeData) {

  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + 
      "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
  }

  function bubblesize(magnitude) {
    return magnitude * 18000;
  }


  function circleColor(magnitude) {
    if (magnitude < 1) {
      return "green"
    }
    else if (magnitude < 2) {
      return "yellowgreen"
    }
    else if (magnitude < 3) {
      return "yellow"
    }
    else if (magnitude < 4) {
      return "gold"
    }
    else if (magnitude < 5) {
      return "orange"
    }
    else {
      return "red"
    }
  }


  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: bubblesize(earthquakeData.properties.mag),
        color: circleColor(earthquakeData.properties.mag),
        fillOpacity: 1
      });
    },
    onEachFeature: onEachFeature
  });

  createMap(earthquakes);
}

function createMap(earthquakes) {

  var grayscalemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  
  // baseMaps object to hold base layers
  var baseMaps = {
    "Greyscale Map": grayscalemap
   };

  // Create overlay object to hold  overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map using center coordinates for USA
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [grayscalemap, earthquakes]
  });

  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  
  
  // color function to be used when creating the legend
  function Gradient(magnitude) {
    return magnitude > 5 ? 'red' :
           magnitude > 4  ? 'orange' :
           magnitude > 3  ? 'gold' :
           magnitude > 2  ? 'yellow' :
           magnitude > 1  ? 'yellowgreen' :
                    'green';
  }

// Add legend to the map
  var legend = L.control({position: 'bottomright'});
  
  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
          mag = [0, 1, 2, 3, 4, 5],
          legendLabel = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

          
      for (var i = 0; i < mag.length; i++) {
          div.innerHTML +=
              '<i style="background:' + Gradient(mag[i] + 1) + '"></i> ' +
              mag[i] + (mag[i + 1] ? '&ndash;' + mag[i + 1] + '<br>' : '+');
      }
  
      return div;
  };
  
  legend.addTo(myMap);
}
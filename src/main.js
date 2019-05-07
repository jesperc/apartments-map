// main.js

function httpGetAsyncJSON(url, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        	callback(JSON.parse(xmlHttp.responseText));
        } 
    }
    xmlHttp.onerror = function() {
    	var body = document.getElementsByTagName("BODY")[0];
    	body.innerHTML = "Invalid url: <br/><br/>" + url;
    }
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);
}

function createPage(path) {
	addElementsToHTML(path);

    // Create new map
    var map = new google.maps.Map(document.getElementById('map'), {
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    
    var coordinates = getCoordinatesFromPath(path);
    
    // Add coordinates to map
    var flightPath = new google.maps.Polyline({
        path: coordinates,
        geodesic: true,
        strokeColor: '#0000FF',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    flightPath.setMap(map);

    // Create bounds in order to adjust zoom level according to route
    var latLngBounds = createLatLngBounds(coordinates);
    
    addMarkersToMap(path, latLngBounds, map);
    map.fitBounds(latLngBounds);
}

function getCoordinatesFromPath(path) {
	var coordinates = [];
    for (var i = 0; i < path.path_polyline.length; ++i) {
		var polylineArray = path.path_polyline[i]; // coordinates describing a path (lat, lng)
		for (var j = 0; j < polylineArray.length; ++j) {
			var polyline = polylineArray[j];
			coordinates.push({lat: polyline.lat, lng: polyline.lng});
		}
	}
    return coordinates;
}

function createLatLngBounds(coordinates) {
	var latLng = [];
    for (var i = 0; i < coordinates.length; ++i) {
    	latLng.push(new google.maps.LatLng(coordinates[i].lat, coordinates[i].lng));
    }
    var latLngBounds = new google.maps.LatLngBounds();
    for (var i = 0; i < latLng.length; i++) {
        latLngBounds.extend(latLng[i]);
    }
    return latLngBounds;
}

function addMarkersToMap(path, bounds, map) {
    for (var i = 0; i < path.places.length; ++i) {
    	var place = path.places[i];
    	var position = place.place_position;
    	
    	// add coordinates to bounds, so maps can automatically adjust zoom level
    	// depending on coordinates.
    	bounds.extend(new google.maps.LatLng(position.lat, position.lng));
    	
    	addCircle(position, place.place_radius, map);
    	
    	// add some additional info + image to popup window
    	var content = 
    		"<p>" + place.place_name + "</p>" +
    		"<p>" + place.place_info + "</p>";
    	
    	// add image if it exists.
    	if (place.place_image) {
    		content += getImageTagInHTML(place.place_image);
    	}
    	
    	// add media content
    	var media = getMediaContent(place.place_media);
    	if (media) {
    		content += media;
    	}
    	
    	// create new marker
    	var marker = new google.maps.Marker({
            position: {lat: position.lat, lng: position.lng},
            map: map,
            title: place.place_name
         });
    	
    	var infowindow = new google.maps.InfoWindow();
    	
    	// add click event to marker
    	google.maps.event.addListener(marker,'click', (function(marker, content, infowindow){ 
    	    return function() {
    	        infowindow.setContent(content);
    	        infowindow.open(map,marker);
    	    };
    	})(marker, content, infowindow));  
    }
}

function addCircle(position, radius, map) {
	var circle = new google.maps.Circle({
		strokeColor: '#FF0000',
	    strokeOpacity: 0.8,
	    strokeWeight: 2,
	    fillColor: '#00FF00',
	    fillOpacity: 0.35,
	    map: map,
	    center: position,
	    radius: radius
	});
}

function getMediaContent(mediaArray) {
	var result = "";
	for (var i = 0; i < mediaArray.length; ++i) {
		var media = mediaArray[i];
		// check if media has any content
		var type = media.media_type;
		if (type) {
			// if name exists, add as heading
			if (media.media_name) {
				result += media.media_name;
			}
			
			if (type.localeCompare("text") == 0) {
				result += media.media_contents;
				
				// add image if it exists
				if (media.media_image) {
					result += getImageTagInHTML(media.media_image);
				}
			} else if (type.localeCompare("audio") == 0) {
				result += media.media_contents.content_text;
				// add mp3 if it exists
				if (media.media_contents.content_url) {
					result += '</br>' + getAudioTagInHTML(media.media_contents.content_url);
				}
			} else if (type.localeCompare("image") == 0) {
				for (var j = 0; j < media.media_contents.length; ++j) {
					var json = media.media_contents[j];
					result += json.content_text;
					if (json.content_url) {
						result += getImageTagInHTML(json.content_url);
					}
				}
			}
		}
	}
	return result;
}

function addElementsToHTML(path) {
	// Display path name and route in google maps
	appendToBody('<h1>' + path.path_name + '</h1>');
	appendToBody('<div id="map"></div>');
	
	// Display path properties
	appendToBody("<p>Length: " + path.path_length + " km, Time: " + path.path_time + " h</p>");
	if (path.path_info) {
		appendToBody("<p>" + path.path_info);
	}
	
	// Display path image
	appendToBody('<img src="' + path.path_image + '" alt="path image">');
}

function getAudioTagInHTML(src) {
	return '' +
	    '<audio controls>' +
		    '<source src="' + src + '" type="audio/mpeg">' +
		'</audio>';
}

function getImageTagInHTML(src) {
	return '<img src="' + src + '" width=128px height=128px>';
}

function appendToBody(str) {
	$('body').append(str);
}

function getURLParam(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}
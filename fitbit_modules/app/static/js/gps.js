function initMap() {
    var layer;
    var projection;
    var overlay = new google.maps.OverlayView();
    var coords_array = getPoints()

    var map = new google.maps.Map(document.getElementById('map'), {
        //zoom: 19,
        center: {lat: center_map['lat'], lng: center_map['lng']},
        mapTypeId: 'satellite'
    });

    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < coords_array.length; i++) {
        bounds.extend(coords_array[i]);
    }
    map.fitBounds(bounds);

    // Add the container when the overlay is added to the map.
    overlay.onAdd = function() {
        layer = d3.select(this.getPanes().overlayLayer).append("div")
            .attr("class", "stations");
    };

    // Draw each marker as a separate SVG element.
    // We could use a single SVG, but what size would it have?
    overlay.draw = function() {
        projection = this.getProjection(),
        padding = 10;

        var marker = layer.selectAll("svg")
              //.data(coords.slice(0,1))
              .data([coords[0]])
              .each(transform) // update existing markers
              .enter().append("svg")
              .each(transform)
              .attr("class", "marker");

        // Add a circle.
        marker.append("circle")
            .attr("r", 6.5)
            .attr("cx", padding)
            .attr("cy", padding);

    };

    overlay.update = function(data) {
        d3.selectAll("svg")
          .data(data)
          .each(transform);
    }

    function transform(d) {
        d = new google.maps.LatLng(d[0], d[1]);
        d = projection.fromLatLngToDivPixel(d);
        return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px");
    }

    overlay.setMap(map);

    //simulate position update by receiving positions at random interval
    var d1Cnt = 1;
    (function loop() {
       var randTimeout = Math.round(Math.random() * 10) ;
       setTimeout(function () {
           i = d1Cnt++
           overlay.update([coords[i]]);
           loop();
       }, randTimeout);
    }());

}



function getPoints() {
    var coords_array = [];
    for (i = 0; i < coords.length; i++) {
        coords_array[i] = new google.maps.LatLng(coords[i][0], coords[i][1]);
    }
    return coords_array;
}



 var map, heatmap;

 function initMap() {
   map = new google.maps.Map(document.getElementById('map'), {
     //zoom: 19,
     center: {lat: center_map['lat'], lng: center_map['lng']},
     //center: {lat: 48.831485, lng: 2.272656},
     //center: {lat: 48.874586, lng: 2.277218},
     mapTypeId: 'satellite'
   });

   var coords_array = getPoints()

   heatmap = new google.maps.visualization.HeatmapLayer({
     data: coords_array,
     map: map,
     // radius: 11,
     radius: 9,
     opacity: 1
   });

   var bounds = new google.maps.LatLngBounds();
   for (var i = 0; i < coords_array.length; i++) {
      bounds.extend(coords_array[i]);
   }
   map.fitBounds(bounds);
 }

 function changeRadius() {
    // heatmap.set('radius', heatmap.get('radius') ? 20 : heatmap.get('radius'));
    heatmap.set('radius', heatmap.get('radius') ? null : 20);
 }

 function changeOpacity() {
     // heatmap.set('opacity', heatmap.get('opacity') ? 0.1 : heatmap.get('opacity'));
     heatmap.set('opacity', heatmap.get('opacity') ? null : 0.1);
 }

 function getPoints() {
   var coords_array = [];
   for (i = 0; i < coords.length; i++) {
        coords_array[i] = new google.maps.LatLng(coords[i][0], coords[i][1]);
   }
 return coords_array;
 }


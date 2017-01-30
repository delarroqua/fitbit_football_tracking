 var map, heatmap, a;

 function initMap() {
   map = new google.maps.Map(document.getElementById('map'), {
     zoom: 19,
     //center: {lat: 48.831485, lng: 2.272656},
     center: {lat: 48.874586, lng: 2.277218},
     mapTypeId: 'satellite'
   });

   heatmap = new google.maps.visualization.HeatmapLayer({
     data: getPoints(),
     map: map,
     radius: 11
     //opacity: 2
   });

 }



 function getPoints() {
   var coords_array = [];
   for (i = 0; i < coords_pedro.length; i++) {
        coords_array[i] = new google.maps.LatLng(coords_pedro[i][0], coords_pedro[i][1]);
   }

 return coords_array;
 }


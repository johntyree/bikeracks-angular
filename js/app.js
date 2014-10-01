/* jslint global: angular */
'use strict';

function takePhoto(id, callback) {
  console.log('start', id);
  var photoChooser = $('#photoChooser');
  photoChooser.click();
  var id = photoChooser.attr('marker');
  photoChooser.one('change', function() {
      console.log('change fired');
      var file = photoChooser[0].files[0];
      console.log(file);
      var reader = new FileReader();
      reader.onload = function() {
          console.log('loaded');
          var img = $('#currentPhoto');
          img.attr('src', reader.result);
          var dataURL = reader.result;
          $('#confirmPhotoUpload').click();
          callback && callback(reader.result);
      };
      reader.onerror = function() {
          alert('Error uploading file!');
      };
      reader.readAsDataURL(file);
  });
}


(function(_, L, angular) {

  var app = angular.module('bikeracks', ['leaflet-directive']);

 // app.factory('GetContentService', function() {
    // var service = {};

    // service.getContent = function() {
      // return {
        // title: 'Hello',
        // content: 'Some content, way to loooooooooooooonnnnnnnnnnnnngggggggggg.'
      // };
    // };
    // return service;
  // });

  // app.directive('popup', function(GetContentService) {
    // return {
      // restrict: 'A',
      // templateUrl: 'templates/marker-popup.html',
      // scope: { content: {} },
      // controller: function($scope, $timeout) {
        // $scope.getContent = function() {
          // // Simulate a call to the server to get data
          // $timeout(function() {
              // $scope.content = GetContentService.getContent();
          // }, 200);
        // };
      // }
    // };
  // });


  app.controller('MapController', ['$http', '$scope', '$compile',
                 function($http, $scope, $compile) {
    var map = this;

    var rootURL = 'http://john.bitsurge.net/bikeracks';
    var rackURL = rootURL + '/static/data/austin_racks_v1.json';
    var imageURL = rootURL + '/static/images';
    var options = {
      clusterIconUrl: imageURL + '/parking_bicycle_cluster_0.png',
      clusterShadowUrl:
        imageURL + '/parking_bicycle_cluster_shadow_0.png'
    };

    map.events = {
      marker: {
        enable: ['popupopen'],
        logic: 'emit'
      }
    };

    map.layers = {
      baselayers: {
        stamenterrain: (function() {
          var s = new L.StamenTileLayer('terrain', {});
          return {
            name: 'Stamen Terrain',
            url: s._url,
            type: 'xyz',
            layerParams: s.options
          };
        }())
      },
      overlays: {
        publicRacks: {
          name: 'Public Bike Racks',
          type: 'markercluster',
          visible: true,
          layerOptions: {
            chunkedLoading: true,
            maxClusterRadius: 30,
            iconCreateFunction: function iconCreateFunction(cluster) {

              var childCount = cluster.getChildCount();

              var c = ' marker-cluster-';
              if (childCount < 4) {
                c += 'small';
              } else if (childCount < 10) {
                c += 'medium';
              } else {
                c += 'large';
              }
              var html =
                '<div class="marker-cluster-shadow">' +
                '<img src="' + options.clusterShadowUrl + '"></img>' +
                '</div>' +
                '<img src="' + options.clusterIconUrl + '"></img>' +
                '<div class="marker-cluster-flair' + c + '">' +
                '<span>' + childCount + '</span>' +
                '</div>';

              var icon = new L.DivIcon({
                html: html,
                className: 'marker-cluster',
                iconSize: new L.Point(37, 26)
              });
              return icon;
            }
          }
        }
      }
    };

    var childscope = $scope.$new();
    var popupContent = angular.element(
      '<div ng-include="\'templates/marker-popup.html\'"></div>')[0];
    $scope.$on('leafletDirectiveMarker.popupopen', function(event, args) {
      var marker = $scope.map.markers[args.markerName];
      childscope.marker = marker;
      var node = angular.element(args.leafletEvent.target._popup._contentNode);
      var url = 'http://john.bitsurge.net/bikeracks/get/2';// + args.markerName;
      childscope.loading = true;
      $http.get(url).success(function(photos) {
        marker.photos = photos.slice(0, 1);
        marker.currentPhoto = marker.photos[0][0];
        childscope.loading = false;
      });
      $compile(popupContent)(childscope, function(popupContentNode) {
        node.empty();
        node[0].appendChild(popupContentNode[0]);
      });
    });

    map.markers = [];
    $http.get(rackURL).success(function(json) {
      map.markers = _.map(json, function(rack) {
        function f(n) { return Math.floor(n*1e6).toString() }
        var id = f(rack.lat) + f(rack.lng);
        return {
          layer: 'publicRacks',
          // Leaflet *hardcodes* popup size based on content.
          // This miserable hack is to force popups to be wide before the
          // dynamic content has loaded so that leaflet doesn't squeeze
          // everything into a 20px column :(.
          message: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          id: id,
          address: rack.address,
          photos: [],
          currentPhoto: "",
          lat: rack.lat,
          lng: rack.lng,
          icon: {
            iconUrl: imageURL + '/parking_bicycle_0.png',
            shadowUrl: imageURL + '/parking_bicycle_shadow_0.png',
            iconAnchor: [13, 32],
            popupAnchor: [5, -24]
          }
        };
      });
    });

    map.austin = {
      lat: 30.27,
      lng: -97.76,
      zoom: 14
    };

    map.center = angular.copy(map.austin);

  }]);

}(_, L, angular));

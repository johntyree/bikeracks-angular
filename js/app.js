/* jslint global: angular */
'use strict';

(function(_, L, angular) {

  var app = angular.module('bikeracks', ['leaflet-directive']);

  app.controller('MapController', ['$http', '$log', 'leafletData',
      function($http, $log, leafletData) {
    var map = this;

    // leafletData.getMap().then(function(m) {
      // map.map = m;
      // map.map.on('mousemove', function(e) {
        // map.event = e.latlng;
      // });
    // });


    var rootURL = 'http://john.bitsurge.net/bikeracks';
    var rackURL = rootURL + '/static/data/austin_racks_v1.json';
    var imageURL = rootURL + '/static/images';
    var options = {
      clusterIconUrl: imageURL + '/parking_bicycle_cluster_0.png',
      clusterShadowUrl:
        imageURL + '/parking_bicycle_cluster_shadow_0.png'
    };

    map.events = {
      map: {
        enable: [],
        logic: 'emit'
      },
      marker: {
        enable: [],
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

    map.markers = [];
    $http.get(rackURL).success(function(json) {
      map.markers = _.map(json, function(rack) {
        return {
          layer: 'publicRacks',
          message: rack.address,
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

    map.london = {
      lat: 51.505,
      lng: -0.09,
      zoom: 8
    };

    map.austin = {
      lat: 30.26,
      lng: -97.77,
      zoom: 14
    };

    map.taiwan = {
      lat: 25.0391667,
      lng: 121.525,
      zoom: 8
    };

    map.center = angular.extend({}, map.austin);

  }]);

}(_, L, angular));

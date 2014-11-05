(function(angular) {

  var app = angular.module('bikeracks-api', ['ngResource']);

  app.constant('IMGUR_API_KEY', 'f962410f5a6a13d');

  app.constant('IMGUR_BASE_URL', 'https://api.imgur.com/3/image/');

  app.constant('ROOT_URL', 'http://john.bitsurge.net/bikeracks_mongo/');

  app.factory('ImgurAPI',
    ['$resource', 'IMGUR_API_KEY', 'IMGUR_BASE_URL',
      function($resource, IMGUR_API_KEY, IMGUR_BASE_URL) {

    var imgurActions = {
      upload: {
        method: 'POST',
        params: {type: 'base64'},
        transformRequest: function(base64Image, headersGetter) {
          var trimmed = base64Image.slice(base64Image.indexOf(',') + 1);
          headersGetter().Authorization = 'Client-ID ' + IMGUR_API_KEY;
          return trimmed;
        },
        transformResponse: function(result) {
          result = JSON.parse(result);
          return {
            url: result.data.link,
            id: result.data.id
          };
        }
      }
    };

    return $resource(IMGUR_BASE_URL, {}, imgurActions);

      }
  ]);

  app.factory('BikeracksAPI', ['$resource', 'ROOT_URL',
              function($resource, ROOT_URL) {

    var apiURL = ROOT_URL + 'rack/:rack_id';
    var paramDefaults = {rack_id: '@rack_id'};
    var customActions = {
      upload: {method: 'POST'},
      getRacks: {
        method: 'GET',
        url: ROOT_URL + '/static/data/austin_racks_v1.json',
        isArray: true
      },
    };

    return $resource(apiURL, paramDefaults, customActions);

  }]);

  app.service('API', ['ImgurAPI', 'BikeracksAPI', 'ROOT_URL',
              function(ImgurAPI, BikeracksAPI, ROOT_URL) {
    return {
      uploadRackImage: function(rack_id, base64Image) {
        return ImgurAPI.upload(base64Image).$promise.then(function(resp) {
          resp.rack_id = rack_id;
          return BikeracksAPI.upload({'rack_id': rack_id}, resp);
        });
      },
      getRacks: function() {
        return BikeracksAPI.getRacks();
      },
      get: function(args) {
        var x = BikeracksAPI.get(args);
        return x;
      },
      br: BikeracksAPI,
      root: ROOT_URL
    };
  }]);
}(angular));

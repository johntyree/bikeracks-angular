
(function (angular) {

  var app = angular.module('submit-modal', ['ui.bootstrap']);

  app.controller('SubmitModalCtrl', ['$scope', '$modal', '$log',
                 function($scope, $modal, $log) {

    var marker = $scope.$parent.$parent.marker;

    var photoChooser = $('#photo-chooser');
    photoChooser.on('change', function() {
      $log.log('change fired');
      var file = photoChooser[0].files[0];
      $log.log(file);
      var reader = new FileReader();
      reader.onload = function() {
        $log.log('loaded');
        resizeImage(reader.result, function(photoURL) {
          var modalInstance = $modal.open({
            templateUrl: 'templates/submit-modal.html',
            controller: 'ModalInstanceCtrl',
            controllerAs: 'mic',
            size: '',
            resolve: {
              photoURL: function() {
                return photoURL;
              },
              rack_id: function() {
                return marker.id;
              }
            }
          });

          modalInstance.result.then(
            function success(result) {
              marker.photos.push(result.url);
              marker.currentPhoto = result.url;
            },
            function failure(error) {
              $log.log(error);
            }
          );
        });
      };
      reader.onerror = function() {
        alert('Error reading file!');
      };
      reader.readAsDataURL(file);
    });

    this.takePhoto = function takePhoto() {
      var id = marker.id;
      $log.log('start', id);
      photoChooser.click();
    };

  }]);

  app.controller('ModalInstanceCtrl',
                 ['$modalInstance', '$scope', 'photoURL', 'rack_id', 'API',
                 function(modalInstance, $scope, photoURL, rack_id, API) {
    $scope.candidatePhoto = photoURL;
    $scope.submit = function() {
      API.uploadRackImage(rack_id, photoURL).then(
        function success(result) {
        modalInstance.close(result);
      },
      function error() {
        modalInstance.dismiss('Upload failed.');
      });
    };

    $scope.cancel = function() {
      modalInstance.dismiss('Submission canceled.');
    };
  }]);

}(angular));

QuestionManagerApp.controller('EditQuestionPaperControl', ['$scope','$http','$mainControllerScope', '$uibModalInstance',
  function($scope, $http, $mainControllerScope, $uibModalInstance) {

    angular.extend($scope,$mainControllerScope);

    var EditModalManager = {
      init: function(config) {
        angular.extend(this,config);
        this.registerHelper();
        // this.eventHandler();
      },

      registerHelper: function() {
        var self = this;
        console.log(self.$scope.Questions)
      },
    };


    EditModalManager.init({
      $scope: $scope,
      $mainControllerScope : $mainControllerScope,
      $uibModalInstance: $uibModalInstance,
      $http: $http
    });
  }
]);

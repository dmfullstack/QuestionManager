QuestionManagerApp.controller('EditQuestionPaperControl', ['$scope','$http','$mainControllerScope', '$uibModalInstance','$ajaxService',
  function($scope, $http, $mainControllerScope, $uibModalInstance,$ajaxService) {

    angular.extend($scope,$mainControllerScope);

    var EditModalManager = {
      init: function(config) {
        angular.extend(this,config);
        this.eventHandler();
      },

      eventHandler: function() {
        var self = this;
        self.$scope.editQuestionClose = function() {
           self.$uibModalInstance.dismiss('cancel');
        };

        self.$scope.saveQuestionPaper = function(){
          $ajaxService.saveQuestionPaper({
            requestType : 'saveQuestionPaper',
            questionPaperName : self.$scope.QuestionPaper.name,
            questions : self.$scope.Questions[0]._id
          },function(err,response){
            if(err){
              console.log(err);
            }
        });
      }

      self.$scope.deleteQuestion = function(index){//TO DO : change index to get array of indexes for multi delete
        var questionToRemove = self.$scope.Questions[index];
        console.log(questionToRemove);
        console.log(self.$scope.Questions.splice(questionToRemove,1));
      };
    }
  }

    EditModalManager.init({
      $scope: $scope,
      $mainControllerScope : $mainControllerScope,
      $uibModalInstance: $uibModalInstance,
      $http: $http,
      $ajaxService : $ajaxService
    });
  }
]);

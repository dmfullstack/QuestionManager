QuestionManagerApp.controller('EditQuestionPaperControl', ['$scope','$http','$mainControllerScope', '$uibModalInstance','$ajaxService', '$uibModal',
function($scope, $http, $mainControllerScope, $uibModalInstance,$ajaxService,$uibModal) {

  angular.extend($scope,$mainControllerScope,{
    selectedQuestionIndices : []
  });

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
          qSetId : self.$scope.QuestionPaper._id,
          questions : self.$scope.QuestionPaper.Questions
        },function(err,response){
          if(err){
            console.log(err);
          }
          console.log(self.$scope.QuestionPaper._id);
          console.log(self.$scope.Questions);
          console.log("saved");
        });
      }

      self.$scope.deleteQuestions = function(){//TO DO : change index to get array of indexes for multi delete
        console.log($scope.selectedQuestionIndices);
        for (var i = 0; i < $scope.selectedQuestionIndices.length; i++) {
          self.$scope.Questions.splice($scope.selectedQuestionIndices[i],1);
        }
        $scope.selectedQuestionIndices = [];
      };

      self.$scope.selectQuestion = function(index,emptyIndices)
      {
        if(emptyIndices)
        {
          $scope.selectedQuestionIndices = [];
        }
        $scope.selectedQuestionIndices.push(index);
      }

      self.$scope.toggleSelection = function toggleSelection(index) {
        var idx = $scope.selectedQuestionIndices.indexOf(index);

        // is currently selected
        if (idx > -1) {
          $scope.selectedQuestionIndices.splice(idx, 1);
        }

        // is newly selected
        else {
          $scope.selectQuestion(index)
        }
      };

      self.$scope.dateFormater = function(date) {
        var tDate = new Date(date);
        return tDate;
      };

      self.$scope.onEditClick = function(index) {
        $uibModal.open({
          animation: self.$scope.animationsEnabled,
          templateUrl: 'modal.html',
          controller: 'EditQuestionControl',
          resolve: {
            $mainControllerScope: function () {
              return {
                selectedQuestion: angular.copy(self.$scope.Questions[index]),
                QuestionManager: self,
                dateFormater:self.$scope.dateFormater
              }
            }
          }
        });
      }

    }
  }

  EditModalManager.init({
    $scope: $scope,
    $mainControllerScope : $mainControllerScope,
    $uibModalInstance: $uibModalInstance,
    $http: $http,
    $uibModal : $uibModal,
    $ajaxService : $ajaxService
  });
}
]);

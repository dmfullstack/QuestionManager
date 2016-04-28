QuestionManagerApp.controller('EditQuestionPaperControl', ['$scope','$http','$mainControllerScope', '$uibModalInstance','$ajaxService', '$uibModal', '_', '$QuestionService', '$rootScope', 'ngNotify',
function($scope, $http, $mainControllerScope, $uibModalInstance,$ajaxService,$uibModal,_, $QuestionService,$rootScope,ngNotify) {

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
        var topicIds = _.uniq(self.$scope.QuestionPaper.questions.map(function(e) { return e.topicId.join(',') }))
        $ajaxService.getTopics({
          requestType : 'getTopics',
          topicIds : topicIds
        },function(err,response){
          if(err){
            console.log(err);
          }
          $ajaxService.saveQuestionPaper({
            requestType : 'saveQuestionPaper',
            questionPaper : self.$scope.QuestionPaper,
            name : self.$scope.QuestionPaper.name,
            topics: response.data.map(function(e) {return e.topicName})
          },function(err,response){
            if(err){
              ngNotify.set("Error while Saving the Question Paper","error");
            }
            $QuestionService.setExistingQuestions(_.pluck(self.$scope.QuestionPaper.questions,'_id'));
            $QuestionService.setUserSelectedQuestions([]);
            $rootScope.$emit("initializeQuestions",{});
            $rootScope.$emit("refreshQSet",{});
          })
           $scope.editQuestionClose();
           ngNotify.set("Question Paper Saved","success");
        });
      };

      self.$scope.deleteQuestions = function(){
        console.log(self.$scope);
        for (var i = 0; i < $scope.selectedQuestionIndices.length; i++) {
          self.$scope.QuestionPaper.questions.splice($scope.selectedQuestionIndices[i],1);
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
          scope : $scope,
          resolve: {
            $mainControllerScope: function () {
              return {
                selectedQuestion: angular.copy(self.$scope.QuestionPaper.questions[index]),
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

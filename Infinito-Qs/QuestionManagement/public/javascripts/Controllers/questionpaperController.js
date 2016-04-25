QuestionManagerApp.controller('questionPaper',  ['$scope','$http','$uibModal','$ajaxService', function($scope,$http,$uibModal,$ajaxService) {

  $scope = angular.extend($scope,{

  });

  $scope.getQSet = function(){
    $ajaxService.getQSet({
      requestType : 'getQuestionPapers'
    },function(err,response){
      if(err){
        console.log(err);
      }
      $scope.QuestionPapers = response.data;//get only Question Paper Data
      angular.forEach($scope.QuestionPapers , function(question){
        question.IsPickedInTournament = question.tournaments.length > 0 ? true : false
      });
    });
  },

  $scope.deleteQuestionPaper = function(index){
    var selectedQuestionPaper = $scope.QuestionPapers[index];
    $ajaxService.onQuestionPaperDelete({
      requestType : 'deleteQuestionPaper',
      questionPaperName : selectedQuestionPaper.name
    },function(err,response){
      if(err){
        console.log(err);
      }
      $scope.getQSet();
    });
  },

  $scope.editQuestionPaper = function(index){
    var selectedQuestionPaper = $scope.QuestionPapers[index];
    $ajaxService.editQuestionPaper({
      requestType : 'getQuestionsForQuestionPaper',
      questionPaperName : selectedQuestionPaper.name
    },function(err,response){
      if(err){
        console.log(err);
      }
      $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'questionModal.html',
        controller: 'EditQuestionPaperControl',
        resolve: {
          $mainControllerScope: function () {
            return {
              Questions : response.data,
              QuestionPaper : selectedQuestionPaper
            }
          }
        }
      })
    });
  }
  $scope.getQSet();
}
]);

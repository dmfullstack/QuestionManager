QuestionManagerApp.controller('questionPaper',  ['$scope','$http','$uibModal','$ajaxService','$QuestionService','$rootScope', function($scope,$http,$uibModal,$ajaxService,$QuestionService, $rootScope) {

  $scope = angular.extend($scope,{
    selectedQuestions : $QuestionService.getUserSelectedQuestions(),
    questionPaper : {},
    qpSelect: "New Question Name"
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
      selectedQuestionPaper.Questions = response.data;
      $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'questionPaperModal.html',
        controller: 'EditQuestionPaperControl',
        resolve: {
          $mainControllerScope: function () {
            return {
              QuestionPaper : selectedQuestionPaper
              }
            }
          }
        })
      })
    };
    $scope.createQuestionPaper = function () {
      var tempObj = JSON.parse($scope.qpSelect);
      $ajaxService.createQuestionPaper({
        requestType : 'getQuestionsForQuestionPaper',
        questionPaperName : tempObj.name
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
                QuestionPaper : tempObj
                }
              }
            }
          });
        });
      }
      $scope.onQuestionPaperSelect = function () {
        var tempObj = JSON.parse($scope.qpSelect);
        $QuestionService.setExistingQuestions(tempObj.questions);
        $rootScope.$emit("initializeQuestions",{});
      }
  $scope.getQSet();
}
]);

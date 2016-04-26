QuestionManagerApp.controller('questionPaper',  ['$scope','$http','$uibModal','$ajaxService','$QuestionService','$rootScope', '$q', function($scope,$http,$uibModal,$ajaxService,$QuestionService, $rootScope, $q) {

  $scope = angular.extend($scope,{
    questionPaper : {},
    qpSelect: ""
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
      })
    };
    $scope.createQuestionPaper = function () {
      var questionPaper = $scope.questionPaper;
      var promise = getUserSelectedQuestions();
      promise.then(function (userSelectedQuestions) {
        if($scope.qpSelect!=""){
          questionPaper = JSON.parse($scope.qpSelect);
          $ajaxService.createQuestionPaper({
            requestType : 'getQuestionsForQuestionPaper',
            questionPaperName : questionPaper.name
          },function(err,response){
            if(err)
              console.log(err);
              questionPaper.Questions = _.union(response.data,userSelectedQuestions);
            });
          }else{
            questionPaper = {};
            questionPaper.Questions = userSelectedQuestions;
          }
          $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'questionModal.html',
            controller: 'EditQuestionPaperControl',
            resolve: {
              $mainControllerScope: function () {
                return {
                  QuestionPaper : questionPaper
                  }
                }
              }
            });
          });
      }
      $scope.onQuestionPaperSelect = function () {
        var tempObj = {};
        if($scope.qpSelect!="")
          tempObj = JSON.parse($scope.qpSelect);
        $QuestionService.setExistingQuestions(tempObj.questions);
        $rootScope.$emit("initializeQuestions",{});
      }
  $scope.getQSet();

  function getUserSelectedQuestions() {
    return $q(function(resolve,reject){
      var questionIds = $QuestionService.getUserSelectedQuestions();
      $ajaxService.getQuestionsById({
        requestType : 'getQuestionsById',
        questionIds : questionIds
      },function(err,response){
        if(err)
          console.log(err);
          resolve(response.data);
        });
    })
  }
}
]);

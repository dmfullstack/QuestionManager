QuestionManagerApp.controller('questionPaper',  ['$scope','$http','$uibModal','$ajaxService','$QuestionService','$rootScope', '$q', function($scope,$http,$uibModal,$ajaxService,$QuestionService, $rootScope, $q) {

  $rootScope.$on("refreshQSet", function(){
    $scope.getQSet();
  });

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
    $ajaxService.getQuestionsForQuestionPaper({
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
    var questionPaper = $scope.questionPaper;
    var promise = getUserSelectedQuestions();
    promise.then(function (userSelectedQuestions) {
      if($scope.qpSelect!=""){
        questionPaper = JSON.parse($scope.qpSelect);
        $ajaxService.getQuestionsForQuestionPaper({
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
        templateUrl: 'questionPaperModal.html',
        controller: 'EditQuestionPaperControl',
        resolve: {
          $mainControllerScope: function () {
            return {
              QuestionPaper : questionPaper
            }
          }
        }
      })
    })
  }

    $scope.createQuestionPaper = function () {
      var questionPaper = $scope.questionPaper;
      var promise = getUserSelectedQuestions();
      promise.then(function (userSelectedQuestions) {
        if($scope.qpSelect!=""){
          questionPaper.name = $scope.qpSelect;
          $ajaxService.getQuestionsForQuestionPaper({
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
        })
      };

  $scope.onQuestionPaperSelect = function () {
    if($scope.qpSelect!=""){
      $ajaxService.getQuestionsForQuestionPaper({
        requestType : 'getQuestionsForQuestionPaper',
        questionPaperName : $scope.qpSelect
      },function(err,response){
        if(err)
        console.log(err);
        $QuestionService.setExistingQuestions(_.pluck(response.data,'_id'));
        $rootScope.$emit("initializeQuestions",{});
      });
    }else {
      $QuestionService.setExistingQuestions([]);
      $rootScope.$emit("initializeQuestions",{});
    }
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

QuestionManagerApp.controller('questionPaper',  ['$scope','$http','$uibModal','$ajaxService','$QuestionService','$rootScope', '$q' ,'_', function($scope,$http,$uibModal,$ajaxService,$QuestionService, $rootScope, $q,_) {

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
      questionPaperId : selectedQuestionPaper._id
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
      questionPaperId : selectedQuestionPaper._id
    },function(err,response){
      if(err){
        console.log(err);
      }
      $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'questionPaperModal.html',
        controller: 'EditQuestionPaperControl',
        resolve: {
          $mainControllerScope: function () {
            return {
              QuestionPaper : response.data
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
        questionPaper._id = $scope.qpSelect;
        $ajaxService.getQuestionsForQuestionPaper({
          requestType : 'getQuestionsForQuestionPaper',
          questionPaperId : questionPaper._id
        },function(err,response){
          if(err)
          console.log(err);
          questionPaper = response.data;
          console.log(questionPaper);
          Array.prototype.push.apply(questionPaper.questions,userSelectedQuestions);
          openModalWindow(questionPaper);
        });
      }
      else
      {
        questionPaper = {};
        questionPaper.questions = userSelectedQuestions;
        openModalWindow(questionPaper);
      }
    });


  }

  $scope.onQuestionPaperSelect = function () {
    if($scope.qpSelect!=""){
      $ajaxService.getQuestionsForQuestionPaper({
        requestType : 'getQuestionsForQuestionPaper',
        questionPaperId : $scope.qpSelect
      },function(err,response){
        if(err)
        console.log(err);
        $QuestionService.setExistingQuestions(_.pluck(response.data.questions,'_id'));
        $rootScope.$emit("initializeQuestions",{});
      });
    }else {
      $QuestionService.setExistingQuestions([]);
      $rootScope.$emit("initializeQuestions",{});
    }
  }
  $scope.getQSet();

  function openModalWindow(questionPaper){
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
    });
  }

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

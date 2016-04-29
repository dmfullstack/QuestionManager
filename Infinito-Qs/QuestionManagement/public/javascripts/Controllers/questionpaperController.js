 QuestionManagerApp.controller('questionPaper',  ['$scope','$http','$uibModal','$ajaxService','$QuestionService','$rootScope', '$q' ,'_','ngNotify','ngToast', function($scope,$http,$uibModal,$ajaxService,$QuestionService, $rootScope, $q,_ ,ngNotify,ngToast) {

  $rootScope.$on("refreshQSet", function(){
    $scope.getQSet(true)
  });

  $scope = angular.extend($scope,{
    questionPaper : {},
    qpSelect: "",
  });

  $scope.getQSet = function(canSetQSetInOption){
    $ajaxService.getQSet({
      requestType : 'getQuestionPapers'
    },function(err,response){
      if(err){
        console.log(err);
      }
      $scope.QuestionPapers = response.data;//get only Question Paper Data
      if(canSetQSetInOption)
          $scope.qpSelect = response.data[response.data.length-1]['_id'];
      angular.forEach($scope.QuestionPapers , function(question){
        question.IsPickedInTournament = question.tournaments.length > 0 ? true : false
      });
    });

  },

  $scope.deleteQuestionPaper = function(index,isMultiDelete){
    var selectedQuestionPaper = $scope.QuestionPapers[index];
    $ajaxService.onQuestionPaperDelete({
      requestType : 'deleteQuestionPaper',
      questionPaperId : selectedQuestionPaper._id
    },function(err,response){
      if(err){
        console.log(err);
      }
      if(!isMultiDelete)
      {
        ngNotify.set('Q-Set Deleted', 'error');
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
      selectedQuestionPaper.isCreateMode = false;
      openModalWindow(response.data)
    })
  };

  $scope.createQuestionPaper = function () {
    var questionPaper = $scope.questionPaper;
    var promise = getUserSelectedQuestions();
    promise.then(function (userSelectedQuestions) {
      if(userSelectedQuestions.length == 0)
      {
        ngToast.create({
          className :"danger",
          content : "Oh Snap! Please select At least one Question to Add to Q-Set",
          animation : 'slide'
        })
      }
      else{
        if($scope.qpSelect!=""){
          questionPaper._id = $scope.qpSelect;
          $ajaxService.getQuestionsForQuestionPaper({
            requestType : 'getQuestionsForQuestionPaper',
            questionPaperId : questionPaper._id
          },function(err,response){
            if(err)
            console.log(err);
            questionPaper = response.data;
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
        questionPaper.isCreateMode = true;
      }});
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

    $scope.selectedQuestionPaper = function(index){
      $scope.selectedQuestionPaperIndices.push(index);
      console.log('Came In');
    }

    $scope.toggleSelection = function toggleSelection(index) {
      var idx = $scope.selectedQuestionPaperIndices.indexOf(index);

      // is currently selected
      if (idx > -1) {
        $scope.selectedQuestionPaperIndices.splice(idx, 1);
      }

      // is newly selected
      else {
        $scope.selectedQuestionPaper(index)
      }
    };

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

QuestionManagerApp.controller('questionPaper',  ['$scope','$http','$uibModal','$QuestionService', function($scope,$http,$uibModal,$QuestionService) {

  var QuestionPaperManager = {
    init: function(config) {
      angular.extend(this,config);
      this.getQuestionPapers();
      this.eventHandlers();
    },

    getQuestionPapers : function ()
    {
      $http.get('/QuestionPaperRequestHandler/getQuestionPaper')
      .then(function(response){
        $scope.questionPapers = response.data;
        angular.forEach($scope.questionPapers , function(value){
          value.IsPickedInTournament = value.tournaments.length > 0 ? true : false
        })
      })
    },

    deleteQuestionPaper : function(index)
    {
      var self=this;
      var selectedQuestionPaper = $scope.questionPapers[index];
      $http.get('/QuestionPaperRequestHandler/' + selectedQuestionPaper.Name)
      .then(function(response){
        self.getquestionPapers();
      })
    },

    editQuestionPaper : function(index)
    {
      var self = this;
      var selectedQuestionPaper = $scope.questionPapers[index];
      $http.get('/QuestionPaperRequestHandler/getQuestions/' + selectedQuestionPaper.Name)
      .then(function(response){
        var modalInstance = self.$uibModal.open({
          animation: self.$scope.animationsEnabled,
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
    },

  eventHandlers: function() {
    var self=this;
    self.$scope.onQuestionPaperDelete= function(index){
      self.deleteQuestionPaper(index);
    };

    self.$scope.onEditClick = function(index){
      self.editQuestionPaper(index);
    }
  }

};

QuestionPaperManager.init({
  $scope: $scope,
  $http: $http,
  $uibModal: $uibModal
});
}]);

QuestionManagerApp.controller('questionPaper',  ['$scope','$http','$ajaxService', function($scope,$http) {

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
        $scope.QuestionPapers = response.data;
        angular.forEach($scope.QuestionPapers , function(value){
          value.IsPickedInTournament = value.Tournaments.length > 0 ? true : false
        })
      })
    },

    deleteQuestionPaper : function(index)
    {
      var self=this;
      var selectedQuestionPaper = $scope.QuestionPapers[index];
      $http.get('/QuestionPaperRequestHandler/' + selectedQuestionPaper.Name)
      .then(function(response){
        self.getQuestionPapers();
      })
    },

    eventHandlers: function() {
      var self=this;
      self.$scope.onQuestionPaperDelete= function(index){
        self.deleteQuestionPaper(index);
      };
    }

  };

  QuestionPaperManager.init({
    $scope: $scope,
    $http: $http
  });
}]);

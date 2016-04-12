QuestionManagerApp.controller('questionPaper',  ['$scope','$http','$ajaxService', function($scope,$http) {

  var QuestionPaperManager = {
    init: function(config) {
      angular.extend(this,config);
      this.getQuestionPapers();
    },

    getQuestionPapers : function ()
    {
      var self =this;
      $http.get('/QuestionPaperRequestHandler/getQuestionPaper')
      .then(function(response){
        $scope.QuestionPapers = response.data;
        angular.forEach($scope.QuestionPapers , function(value){
          value.IsPickedInTournament = value.Tournaments.length > 0 ? true : false
        })
      })
    },
  };

  QuestionPaperManager.init({
    $scope: $scope,
    $http: $http
  });
}]);

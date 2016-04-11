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
      .then(function(successreponse){
        console.log(successreponse.data);
        $scope.QuestionPapers = successreponse.data
      })
    },
  };

  QuestionPaperManager.init({
    $scope: $scope,
    $http: $http
  });
}]);

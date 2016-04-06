QuestionManagerApp.controller('pattern',function($scope, $http, $timeout, $uibModal, $ajaxService){

  /*Initialize variables for pattern search form*/
  $scope = angular.extend($scope, {
    variableList : ['Sachin Tendulkar','Rahul Dravid', 'Sourav Ganguly'],
    formFields : ['whitelist','blacklist','regexPatterns','wikiRange','gTrendsRange','usageRange','correctRange','searchIn'],
    whitelist : [],
    blacklist : [],
    regexFields : [{value:0}],//Array to dynamically create input boxes for regex
    wikiRange : {min: 10, max: 70, options: {floor: 0, ceil: 100, step: 5}},
    gTrendsRange : {min: 10, max: 70, options: {floor: 0,ceil: 100, step: 5}},
    usageRange : {min: 10, max: 400, options: {floor: 0,ceil: 1000, step: 100}},
    correctRange : {min: 100, max: 700, options: {floor: 0,ceil: 1000, step: 50}},
    regexPatterns : [],
    searchIn : {
      all: true,
      ques: false,
      top: false,
      cat: false
    }, //Checkbox fields
    patternJson : {}
  });

  var i = 1;
  /*Push and pop controls for regex input fields*/
  $scope.addField = function(){
    $scope.regexFields.push({value:i++});
  };
  $scope.removeField = function(){
    $scope.regexFields.pop();
    if($scope.regexFields.length == $scope.regexPatterns.length-1) //Pop the value only if the field is already removed
      $scope.regexPatterns.pop();
    i--;
  };

  //Force render sliders on show
  $scope.refreshSlider = function () {
    $timeout(function () {
      $scope.$broadcast('rzSliderForceRender');
    });
  };

  //handle checkbox selection
  $scope.changeSelection = function(control) {
    var $scp = $scope;
    if($scp.searchIn.ques && $scp.searchIn.top && $scp.searchIn.cat)
    {
      control=0;
      $scp.searchIn.all = true;
    }
    if(control && ($scp.searchIn.ques || $scp.searchIn.top || $scp.searchIn.cat)) {
      $scp.searchIn.all = false;
    } else if($scp.searchIn.all) {
      $scp.searchIn.ques = false;
      $scp.searchIn.top = false;
      $scp.searchIn.cat = false;
    }
  };

  //Search form submit handler
  $scope.submitSearch = function () {
    $scope.patternJson = {};
    for(var i=0; i<$scope.formFields.length; i++){
        $scope.patternJson[$scope.formFields[i]] = $scope[$scope.formFields[i]];
    }
    $ajaxService.listPattern({
      requestType: 'listPattern'
    }, function(err, results) {
        if(err)
          console.log(err);
        console.log(results);
    });

  }

  //Save a particular pattern
  $scope.onSavePattern = function() {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'tempModal.html', //Treat modal as seperate template for syntactical purposes
      controller: 'patternModal'
    });

    modalInstance.result.then(function (name) {
      $scope.patternName = name;
      $ajaxService.savePattern({
        requestType: 'savePattern',
        data: patternJson
      }, function(err, results) {
          if(err)
            console.log(err);
          console.log(results);
      });
    });
  }
});

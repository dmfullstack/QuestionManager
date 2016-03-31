QuestionManagerApp.controller('pattern',function($scope, $timeout){

  /*Initialize variables for pattern search form*/
  $scope = angular.extend($scope, {
    variableList : ['Sachin Tendulkar','Rahul Dravid', 'Sourav Ganguly'],
    formFields : ['whitelist','blacklist','patterns','wikiRange','gTrends','usage','correct','searchIn'],
    whitelist : [],
    blacklist : [],
    regexPatterns : [{value:0}],//Array to dynamically create input boxes for regex
    patterns : [],
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
    $scope.regexPatterns.push({value:i++});
  };
  $scope.removeField = function(){
    $scope.regexPatterns.pop();
    if($scope.regexPatterns.length == $scope.patterns.length-1) //Pop the value only if the field is already removed
      $scope.patterns.pop();
    i--;
  };

  //Sliders with initial settings
  $scope.wikiRange = {min: 10, max: 70, options: {floor: 0, ceil: 100, step: 5}};
  $scope.gTrends = {min: 10, max: 70, options: {floor: 0,ceil: 100, step: 5}};
  $scope.usage = {min: 10, max: 400, options: {floor: 0,ceil: 1000, step: 100}};
  $scope.correct = {min: 100, max: 700, options: {floor: 0,ceil: 1000, step: 50}};

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
  }
});

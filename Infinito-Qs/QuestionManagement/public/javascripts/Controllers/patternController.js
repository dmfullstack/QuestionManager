QuestionManagerApp.controller('pattern', function($scope, $timeout, $uibModal, $ajaxService){
  /*Initialize variables for pattern search form*/
  $scope = angular.extend($scope, {
    newPattern : false,
    patternList :[],
    variableList : ['Sachin Tendulkar','Rahul Dravid', 'Sourav Ganguly'],
    //formFields : ['whitelist','blacklist','regexPatterns','wikiRange','gTrendsRange','usageRange','correctRange','searchIn'],
    patternJson : {
      patternName : "Sample Pattern",
      whitelist : [],
      blacklist : [],
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
    },
    regexFields : [{value:0}]//Array to dynamically create input boxes for regex
  });

  $scope.init = function(){
    $ajaxService.listPattern({ //get the existing patterns
        requestType: 'listPattern'
      }, function(err, results) {
          if(err)
            console.log(err);
          $scope.patternList = results;
          console.log($scope.patternList);
    });
  }

  $scope.patternChoice = function(choice){
    if(choice){
      if(!$scope.newPattern)
        $scope.newPattern = (!$scope.newPattern);
    }
    else
      if($scope.newPattern)
        $scope.newPattern = (!$scope.newPattern);
  }

  var i = 1;
  /*Push and pop controls for regex input fields*/
  $scope.addField = function(){
    $scope.regexFields.push({value:i++});
  };
  $scope.removeField = function(){
    $scope.regexFields.pop();
    if($scope.regexFields.length == $scope.patternJson.regexPatterns.length-1) //Pop the value only if the field is already removed
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
    if($scp.patternJson.searchIn.ques && $scp.patternJson.searchIn.top && $scp.patternJson.searchIn.cat)
    {
      control=0;
      $scp.patternJson.searchIn.all = true;
    }
    if(control && ($scp.patternJson.searchIn.ques || $scp.patternJson.searchIn.top || $scp.patternJson.searchIn.cat)) {
      $scp.patternJson.searchIn.all = false;
    } else if($scp.patternJson.searchIn.all) {
      $scp.patternJson.searchIn.ques = false;
      $scp.patternJson.searchIn.top = false;
      $scp.patternJson.searchIn.cat = false;
    }
  };

  //Search form submit handler
  $scope.submitSearch = function () {
    /*for(var i=0; i<$scope.formFields.length; i++){
        $scope.patternJson[$scope.formFields[i]] = $scope[$scope.formFields[i]];
    }*/
  }

  //Save a particular pattern
  $scope.onSavePattern = function() {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'tempModal.html', //Treat modal as seperate template for syntactical purposes
      controller: 'patternModal',
      resolve:{
        patternName : function (){
          return $scope.patternJson.patternName;
        }
      }
    });

    modalInstance.result.then(function (name) {
      $scope.patternJson.patternName = name;
      $ajaxService.savePattern({
        requestType: 'savePattern',
        data: $scope.patternJson
      }, function(err, results) {
          if(err)
            console.log(err);
          console.log(results);
      });
    });
  }
});

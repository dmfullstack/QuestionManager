QuestionManagerApp.controller('index', ['$scope', '$uibModal', '$http', '$ajaxService','$window', '$patternService','$rootScope','_','$sce', '$QuestionService','$location',
function($scope, $uibModal, $http, $ajaxService, $window, $patternService, $rootScope,_,$sce,$QuestionService) {
  $scope = angular.extend($scope, {
    /* Dropdown options */
    noOfQuestions: [50, //first one default
                    100,
                    150,
                    250,
                    500,
                    1000],
    selectedRowCountIndex: 0,
    selectedRowCount: 50,

    /* checkbox intialization for selection */
    quesSelected : [],
    deleteIds: [],
    querydelete: false,

    /* Intializing question table with empty obj Array */
    questions: [{}],

    /* Pagination Setup */
    firstQuestion: 0,
    currentPage: 1,

    /* default sort setup*/
    sortType: '', // set the default sort type
    sortReverse: false,  // set the default sort order

    // default search settings
    searchText:"",
    searchIn : {
      all: true,
      ques: false,
      top: false,
      cat: false
    },
    /*Changes for pattern search starts*/
    isPattern : false,
    isBasic : false,
    patternJson : $patternService.getPattern(),
    qsetArray : [],
    /*Changes for pattern search ends*/
 
    searchWith : {
      difficulty      : false,
      difficultyRange : {min:1, max:10},
      wiki            : false,
      wikiRange       : {minRank:1, maxRank:10, min:0, max:0},
      google          : false,
      googleRange     : {minRank:1, maxRank:10, min:0, max:0}
    }, 
    rangeOptions : {floor:1, 
      ceil: 10
    },
    wikiRange : ["1-100","100-500","500-2k","2k-5k","5k-10k","10k-20k","20k-30k","30k-40k","40k-50k","50k+"],
    googleRange : ["1-100","100-200","200-300","300-400","400-500","500-600","600-700","700-800","800-900","900-1000"],

    difficultyLevelHelperHtml : "",
    wikiHelperHtml            : "",
    googleHelperHtml          : "",
    questionPapers : [],
    checkbox : []
  });
  var QuestionManager = {

    /* Intializes the config data into the object */
    init: function(config) {
      angular.extend(this,config);
      this.getQuestionJson();
      this.registerHelpers();
      this.eventHandlers();
    },

    registerHelpers: function() {
      var self = this;
      self.$scope.dateFormater = function(date) {
        var tDate = new Date(date);
        return tDate;
      };
      self.$scope.intializeQuesSelect= function() {
        //intialize quesSelected variable to false;
        var $scp = self.$scope;
        var matched = [];
        var existingQuestions = $QuestionService.getExistingQuestions();
        $scp.qsetArray = $QuestionService.getAllSelectedQuestions();
        if(!_.isEmpty($scp.qsetArray)){
           matched = _.intersection($scp.qsetArray, _.pluck($scp.questions,'_id'));
           console.log(matched);
        }
        $scp.checkbox[0] = true;
        for(var i=1,len = $scp.questions.length; i<=len; i++) {
          var objectId = $scp.questions[i-1]['_id'];
          if($scp.isPattern){
            if(_.contains(existingQuestions, objectId))
              $scp.checkbox[i] = true;
            else
              $scp.checkbox[i] = false;
              
            if(matched.length>0 && _.contains(matched, objectId))
              $scp.quesSelected[i] = true;
            else
              $scp.quesSelected[i] = false;
          }else
            $scp.quesSelected[i] = false;
        }
        $scope.quesSelected[0] = _.every(_.rest($scope.quesSelected));
        $scp.deleteIds= [];
        $scp.querydelete= false;
      };
      self.$scope.helpContentForMetadata = function() {
        var $scp = self.$scope;
        $scp.difficultyLevelHelperHtml = $sce.trustAsHtml("<div> <p> Difficulty Level are derived based on several Parameters(Wiki PageView, Google Trend Rank, User Analytics). <br><hr> Difficulty Level are mapped in Ascending order.</p> <b><span style = 'color:red'>Hard</span></b> [ 1 | 2 | ..... | 9 | 10 ]  <b><span style = 'color:green'> Easy</span></b></p> </div>");
        $scp.wikiHelperHtml= $sce.trustAsHtml("<div> <p> Wiki Rank is derived based on WikiPedia PageViews of the question's Keywords. Wiki PageViews gives the popularity of the articles.<br><hr> Wiki Rank is mapped in Ascending order.</p> <b><span style = 'color:red'>Hard</span></b> [ 1 | 2 | ..... | 9 | 10 ]  <b><span style = 'color:green'> Easy</span></b></p> </div>");
        $scp.googleHelperHtml = $sce.trustAsHtml("<div> <p> Google Rank is derived based on Google Knowlege Graph. <br><hr> Google Rank is mapped in Ascending order.</p> <b><span style = 'color:red'>Hard</span></b> [ 1 | 2 | ..... | 9 | 10 ]  <b><span style = 'color:green'> Easy</span></b></p> </div>");
      }();

    },

    eventHandlers: function() {
      var self=this;
      self.$scope.onSearch= function(){
        self.getQuestionJson();
      };

      self.$scope.onReset= function() {
        var range = {minRank:1, maxRank:10, min:0, max:0};
        self.$scope.searchText="";
        self.$scope.searchWith.wiki = false;
        self.$scope.searchWith.google = false;
        self.$scope.searchWith.difficulty = false;
        self.$scope.searchWith.wikiRange = {minRank: 1, maxRank: 10};
        self.$scope.searchWith.googleRange = {minRank: 1, maxRank :10};
        self.$scope.searchWith.difficultyRange = {min:1, max:10}; 
        self.getQuestionJson();
      };

      self.$scope.selectBasic= function (condition) {
        if(condition){
          self.$scope.isPattern = false;
          self.$scope.isBasic = true;
        }else{
          self.$scope.isPattern = true;
          self.$scope.isBasic = false;
        }
      };

      self.$scope.goTo = function(pageName){
        $window.location.href = "/#" + pageName;
      }

      self.$scope.questionpaper=function(){
        $window.location.href='/manageQuestions.html';
      };
      // self.$scope.QP1=function(){
      //   $window.location.href='models/questionpaper.js'
      // }
      self.$scope.noOfRowChange = function(item, indexSelected) {
        var $scp = self.$scope;
        $scp.firstQuestion = 0;
        $scp.currentPage = 1;
        $scp.selectedRowCount = (typeof item == 'number')? item : $scp.totalQuestions;
        $scp.selectedRowCountIndex = indexSelected;
        self.getQuestionJson();
      };

      self.$scope.rangeReset = function(option) {
        var $scp = self.$scope;
        switch(option) {
          case 'difficulty':
          {
            $scp.searchWith.difficulty= false;
            $scp.searchWith.difficultyRange = {min:1, max:10}; 
            break;
          }
          case 'wiki':
          {
            $scp.searchWith.wiki = false;
            $scp.searchWith.wikiRange = {minRank:1, maxRank:10}; 
            break;
          }
          case 'google':
          {
            $scp.searchWith.google = false;
            $scp.searchWith.googleRange = {minRank:1, maxRank:10}; 
            break;
          }
        }
      }


      self.$scope.rangeSelected = function(option) {
        var $scp = self.$scope;
        switch(option) {
          case 'difficulty':
          {
            var min = $scp.searchWith.difficultyRange.min;
            var max = $scp.searchWith.difficultyRange.max;

            if ((min == 1) && (max == 10)) {
              $scp.searchWith.difficulty = false;
            }
            else {
              $scp.searchWith.difficulty = true;
            }
            break;
          }
          case 'wiki':
          {
            var minRank = $scp.searchWith.wikiRange.minRank;
            var maxRank = $scp.searchWith.wikiRange.maxRank;

            if ((minRank == 1) && (maxRank == 10)) {
              $scp.searchWith.wiki = false;
            }
            else {
              $scp.searchWith.wiki = true;
              var minArray = $scp.wikiRange[minRank-1].replace(/k/g,"000").split("-");
              var maxArray = $scp.wikiRange[maxRank-1].replace(/k/g,"000").split("-");
              $scp.searchWith.wikiRange.min = minArray[0];
              $scp.searchWith.wikiRange.max = maxArray[1];
            }
            break;
          }
          case 'google':
          {
            var minRank = $scp.searchWith.googleRange.minRank;
            var maxRank = $scp.searchWith.googleRange.maxRank;

            if ((minRank == 1) && (maxRank == 10)) {
              $scp.searchWith.google = false;
            }
            else {
              $scp.searchWith.google = true;
              var minArray = $scp.googleRange[minRank-1].split("-");
              var maxArray = $scp.googleRange[maxRank-1].split("-");
              $scp.searchWith.googleRange.min = minArray[0];
              $scp.searchWith.googleRange.max = maxArray[1];
            }
            break;
          }
        }
      }

      self.$scope.onPageclick = function(page) {
        var $scp = self.$scope;
        $scp.firstQuestion = (page-1) * $scp.selectedRowCount;
        self.getQuestionJson();
      };
      self.$scope.onEditClick = function(index) {
        var modalInstance = self.$uibModal.open({
          animation: self.$scope.animationsEnabled,
          templateUrl: 'modal.html',
          controller: 'EditQuestionControl',
          resolve: {
            $mainControllerScope: function () {
              return {
                selectedQuestion: angular.copy(self.$scope.questions[index]),
                QuestionManager: self,
                dateFormater:self.$scope.dateFormater
              }
            }
          }
        });
      };
      self.$scope.onDeleteClick = function(index) {
        var selectedQuestion = self.$scope.questions[index];
        self.onQuestionDelete(self,selectedQuestion.questionId);
      };
      self.$scope.onSortClick = function(x) {
        self.$scope.sortType = x;
        self.$scope.sortReverse = !(self.$scope.sortReverse);
        self.getQuestionJson();
      };
      self.$scope.changeSelection = function(control) {
        var $scp = self.$scope;
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
      self.$scope.selectQuestion = function(isEnabled, index, questionId, objectId) {
        var scp = self.$scope;
        var isPattern = scp.isPattern;
        /*  If all question is selected enable querydelete, check all the checkboxes and empty the deleteIds
          if all is unselected make querydelete to false and uncheck all the checkboxes
          If single question select push it questionSelected Array
          If single question unselect push
          */
        switch (isEnabled) {
          case true:
            if(index==0) {
              for(var i=1;i<scp.quesSelected.length;i++) {
                scp.quesSelected[i] = true;
              }
              if(isPattern){
                var newQuestions = [];
                if(scp.qsetArray.length>0)
                  newQuestions = _.difference(_.pluck(scp.questions,'_id'), scp.qsetArray);
                else
                  newQuestions = _.pluck(scp.questions,'_id');
                scp.qsetArray = _.union(scp.qsetArray, newQuestions);
              }
              else{
                scp.querydelete = true;
                scp.deleteIds = [];
              }
            } else {
              scp.quesSelected[0] = false;
              if(isPattern)
                scp.qsetArray.push(objectId);
              else {
                scp.querydelete = false;
                scp.deleteIds.push(questionId);
              }
            }
            break;
          case false:
            if(index==0) {
              for(var i=1;i<scp.quesSelected.length;i++) {
                scp.quesSelected[i] = false;
              }
              if(isPattern)
                scp.qsetArray = _.difference(scp.qsetArray, _.pluck(scp.questions,'_id'));
              else
                scp.querydelete = false;
            } else {
              scp.quesSelected[0] = false;
              if(isPattern){
                //scp.qsetArray.splice(scp.qsetArray.indexOf(questionId),1);
                scp.qsetArray.splice(scp.qsetArray.indexOf(objectId),1);
              }else{
                scp.querydelete = false;
                scp.deleteIds.splice(scp.deleteIds.indexOf(questionId),1);
              }
            }
            break;
        }
        if(scp.isPattern){
          console.log(scp.qsetArray);
          console.log("count : "+ scp.qsetArray.length);
          var tempList = _.difference(scp.qsetArray, $QuestionService.getExistingQuestions());
          $QuestionService.setUserSelectedQuestions(tempList);
          console.log(tempList);
        }
        /*console.log({
          querydelete: scp.querydelete,
          quesSelected: scp.quesSelected,
          deleteIds: scp.deleteIds
        });*/
      };
      self.$scope.deleteSelected =  function() {
        // create a post in service
        var query,
            $scp = self.$scope;
        if($scp.querydelete) {
          query= $scp.searchText;
        }
        //console.log("deleted selected called");
        self.$ajaxService.deleteSelectedQuestion({
          requestType: 'deleteSelected',
          query: query,
          deleteIds: $scp.deleteIds,
          searchIn: $scp.searchIn,
          searchWith: $scp.searchWith
        }, function(err, results) {
          self.getQuestionJson();
        });
      };
    },
    getQuestionJson: function() {
      var self=this,
          $scp = self.$scope,
          queryObj = {
            requestType: 'search',
            firstQuestion: $scp.firstQuestion,
            count: $scp.selectedRowCount,
            query: $scp.searchText,
            sortType: $scp.sortType,
            sortReverse: $scp.sortReverse,
            searchIn: $scp.searchIn,
            searchWith: $scp.searchWith
          };

      //Changes for pattern search starts
      if($scp.isPattern)
        queryObj.searchWith = $scp.patternJson;
      //Changes for pattern search ends

      self.$ajaxService.getQuestionJson(queryObj, function(err, results) {
        if(err)
        {
          console.log(err);
        }
        var dt = results.data;
        $scp.questions = dt.rows;
        $scp.totalQuestions = dt.count;
        $scp.lastQuestion = $scp.firstQuestion + $scp.selectedRowCount;
        $scp.lastQuestion = ($scp.lastQuestion > $scp.totalQuestions)? $scp.totalQuestions : $scp.lastQuestion;

        self.$scope.intializeQuesSelect();
      });
    },
    onQuestionDelete: function(self,id) {
      var scp = self.$scope;
      //console.log(scp);
      self.$ajaxService.onQuestionDelete({
        requestType: 'delete',
        questionId: id
      }, function(err, results) {
        if(err)
        {
          console.log(err);
        }
        self.getQuestionJson();
      });
    },

  };

  $rootScope.$on("filterQuestions", function () {
    $scope.onSearch();
  });
  $rootScope.$on("initializeQuestions", function () {
    $scope.intializeQuesSelect();
  });


  QuestionManager.init({
    $scope: $scope,
    $http: $http,
    $uibModal: $uibModal,
    $ajaxService: $ajaxService,
    $window:$window,
    $patternService:$patternService,
    $rootScope:$rootScope
  });

}]);

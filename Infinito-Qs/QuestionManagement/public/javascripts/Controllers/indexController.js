QuestionManagerApp.controller('index', ['$scope', '$uibModal', '$http', '$ajaxService','$window', '$patternService','$rootScope','_','$sce', '$QuestionService',
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
    qsetArray : $QuestionService.getSelectedQuestions(),
    /*Changes for pattern search ends*/
    searchWith : {
      difficultyLevelValue : 0,
      wiki            : false,
      wikiRange       : {min:1, max:100},
      google          : false,
      googleRange     : {min:1, max:100}
    },
    wikiRange : ["1-100","100-500","500-2k","2k-5k","5k-10k","10k-20k","20k-30k","30k-40k","40k-50k","50k+"],
    googleRange : ["1-100","100-200","200-300","300-400","400-500","500-600","600-700","700-800","800-900","900-1000"],
    difficultyLevels : [0,1,2,3,4,5,6,7,8,9,10],
    currentWikiLevel : 0,
    currentGoogleLevel : 0,
    difficultyLevelHelperHtml : "",
    wikiHelperHtml            : "",
    googleHelperHtml          : "",
    questionPapers : []
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
        if(!_.isEmpty($scp.qsetArray)){
           matched = _.intersection($scp.qsetArray, _.pluck($scp.questions,'_id'));
           console.log(matched);
        }
        for(var i=1,len = $scp.questions.length; i<=len; i++) {
          if($scp.isPattern && matched.length>0){
            if(_.contains(matched, $scp.questions[i-1]['_id'])){
              $scope.quesSelected[i] = true;
            }
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
        self.$scope.searchText="";
        self.$scope.searchWith.wiki = false;
        self.$scope.currentWikiLevel= 0;
        self.$scope.searchWith.google = false;
        self.$scope.currentGoogleLevel = 0;
        self.$scope.searchWith.difficultyLevelValue= 0;
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

      self.$scope.rangeSelected = function(option) {
        var $scp = self.$scope;
        switch(option) {
          case 'wiki':
            if ($scp.currentWikiLevel == 0) {
              $scp.searchWith.wiki = false;
            }
            else {
              $scp.searchWith.wiki = true;
              var minMaxArray = $scp.wikiRange[$scp.currentWikiLevel-1].replace(/k/g,"000").split("-");
              $scp.searchWith.wikiRange.min = minMaxArray[0];
              $scp.searchWith.wikiRange.max = minMaxArray[1];
            }
            break;
          case 'google':
            if ($scp.currentGoogleLevel == 0) {
              $scp.searchWith.google = false;
            }
            else {
              $scp.searchWith.google = true;
              var minMaxArray = $scp.googleRange[$scp.currentGoogleLevel-1].split("-");
              $scp.searchWith.googleRange.min = minMaxArray[0];
              $scp.searchWith.googleRange.max = minMaxArray[1];
            }
            break;
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
          $QuestionService.setSelectedQuestions(scp.qsetArray);
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

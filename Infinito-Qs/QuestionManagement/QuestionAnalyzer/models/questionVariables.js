var mongoose = require('mongoose'),
    questionVarSchema = mongoose.Schema({
      variable     : String,
      questionIds  : Array,
      wikiPageView : Number,
      googleTrend  : Number 
    });

questionVarSchema.statics.getWikiRank = function getWikiRank(doc){
    var score = 0;
    if (doc !== undefined) {
      score = doc.wikiPageView;
    }

    if (score == 0) {
       return 0;
    }
    else if (score < 100) {
        return 1;
    } else if (score < 500) {
        return 2;
    } else if (score < 2000) {
        return 3;
    } else if (score < 5000) {
        return 4;
    } else if (score < 10000) {
        return 5;
    } else if (score < 20000) {
        return 6;
    } else if (score < 30000) {
        return 7;
    } else if (score < 40000) {
        return 8;
    } else if (score < 50000) {
        return 9;
    } else {
        return 10;
    }    
};

questionVarSchema.statics.getGoogleRank = function getGoogleRank(doc){
    var score = 0;
    if (doc != undefined) {
      score = doc.googleResultScore;
    }

    if (score < 100) {
        return 1;
    } else if (score < 200) {
        return 2;
    } else if (score < 300) {
        return 3;
    } else if (score < 400) {
        return 4;
    } else if (score < 500) {
        return 5;
    } else if (score < 600) {
        return 6;
    } else if (score < 700) {
        return 7;
    } else if (score < 800) {
        return 8;
    } else if (score < 900) {
        return 9;
    } else {
        return 10;
    }
};

var questionVariables = mongoose.model('questionVariables', questionVarSchema,'questionVariables');
module.exports = questionVariables;


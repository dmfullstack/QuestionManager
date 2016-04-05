var mongoose = require('mongoose'),
    questionVarSchema = mongoose.Schema({
      variable     : String,
      questionIds  : Array,
      wikiPageView : Number,
      googleTrend  : Number 
    }),
    questionVariables = mongoose.model('questionVariables', questionVarSchema,'questionVariables');

module.exports = questionVariables;


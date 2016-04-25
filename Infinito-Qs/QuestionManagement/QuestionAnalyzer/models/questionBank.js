var mongoose = require('mongoose'),
    questionSchema = mongoose.Schema({
      image: String,
      questionId: String,
      question : String,
      correctIndex: Number,
      options: Array,
      topicId:Array,
      patternId: String,
      correctRatio: { type: String, default: "" },
      difficultyLevel: Number,
      wikiPageView: Number,
      googleResultScore : Number
    });

questionSchema.statics.getRankFromCorrectRatio = function getRankFromCorrectRatio(doc) {
      //console.log(doc.correctRatio);
      return 5;
};

var questionBank = mongoose.model('questionBank', questionSchema,'questionBank');
module.exports = questionBank;

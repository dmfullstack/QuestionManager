var mongoose = require('mongoose'),

questionPaperSchema = mongoose.Schema({
  topics: [{ type: String, ref: 'Topics' }],// Distinct Topic Ids of the Questions in the Selected Question paper
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],//question Ids of Questions Selected for the Question Paper
  Name : String ,// Name of the Question Paper. Should Be Unique across the Collection
  patternId : String, //patternId used to create the Question Paper
  active_in : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tournaments' }], // In which all Tournaments is the Question Paper is currently used
  difficultyLevel : String // Difficult Level of the Question Paper(User Selected)
});

QuestionPapers = mongoose.model('QuestionPapers',questionPaperSchema,'QuestionPapers');

module.exports = QuestionPapers;

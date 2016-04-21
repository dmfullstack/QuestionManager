var mongoose = require('mongoose'),

questionPaperSchema = mongoose.Schema({
  topics: [{ type: String, ref: 'Topics' }],// Distinct Topic Ids of the Questions in the Selected Question paper
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],//question Ids of Questions Selected for the Question Paper
  name : String ,// Name of the Question Paper. Should Be Unique across the Collection
  patternId : String, //patternId used to create the Question Paper
  tournaments : [{ type: String, ref: 'Tournaments' }], // In which all Tournaments is the Question Paper is currently used
  difficultyLevel : Number // Difficult Level of the Question Paper(User Selected)
});

QuestionPaper = mongoose.model('QuestionPaper',questionPaperSchema,'QuestionPapers');

module.exports = QuestionPaper;

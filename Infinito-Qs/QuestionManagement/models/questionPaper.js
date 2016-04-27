var mongoose = require('mongoose'),

questionPaperSchema = mongoose.Schema({
  topics: [String],// Distinct Topic Ids of the Questions in the Selected Question paper
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],//question Ids of Questions Selected for the Question Paper
  name : String ,// Name of the Question Paper. Should Be Unique across the Collection
  tournaments : [String], // In which all Tournaments is the Question Paper is currently used
  difficultyLevel : Number // Difficult Level of the Question Paper(User Selected)
});

QuestionPaper = mongoose.model('QuestionPaper',questionPaperSchema,'questionPapers');

module.exports = QuestionPaper;

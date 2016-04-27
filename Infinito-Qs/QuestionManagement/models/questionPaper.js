var mongoose = require('mongoose'),

questionPaperSchema = mongoose.Schema({
  topics: [String],// Distinct Topic Ids of the Questions in the Selected Question paper
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' , required : [true , 'Seriously ? No Questions ?'] }],//question Ids of Questions Selected for the Question Paper
  name : {type : String , required : [true , 'Why No Name ?'] , unique : true } ,// Name of the Question Paper. Should Be Unique across the Collection
  tournaments : [String], // In which all Tournaments is the Question Paper is currently used
  difficultyLevel : Number, // Difficult Level of the Question Paper(User Selected)
  createdDate : Date, //Date on which Question Paper was created
  lastEditedDate : Date //Date n which last update was made
});

QuestionPaper = mongoose.model('QuestionPaper',questionPaperSchema,'questionPapers');

module.exports = QuestionPaper;

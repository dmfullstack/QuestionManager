var express = require('express')

var router = express.Router();

var questionPaper = require('../models/questionPaper')


router.route('/getQuestionPaper').get(function (req,res) {
  questionPaper.find()
  .select({'Name' : 1 , 'topics' : 1 , 'Tournaments' : 1 , "_id" : 0})
  .exec(function(err, questionPapers) {
    if (err) {
      return res.send(err);
    }
    return res.send(questionPapers);
  });
});

router.route('/:questionPaperName').get(function(req,res){
  questionPaper.remove({"Name" : req.params.questionPaperName})
                .exec(function(err, questionPaperNames) {
                            if (err) {
                              return res.send(err);
                            }
                            return res.send("Success");
                          });
})


module.exports = router;

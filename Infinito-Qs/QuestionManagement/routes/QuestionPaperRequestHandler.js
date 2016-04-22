var express = require('express')

var router = express.Router();

var questionPaper = require('../models/questionPaper');

var question = require("../models/question");

//Populate Question Papers from the Collection
router.route('/getQuestionPaper').get(function (req,res) {
  questionPaper.find({})
  .exec(function(err, questionPapers) {
    if (err) {
      return res.send(err);
    }
    return res.send(questionPapers);
  });
});

//Remove Question Paper By Name(Name is Unique)
router.route('/:questionPaperName').get(function(req,res){
  questionPaper.remove({"Name" : req.params.questionPaperName})
  .exec(function(err, questionPaperNames) {
    if (err) {
      return res.send(err);
    }
    return res.send("Success");
  })
});

router.route('/getQuestions/:questionPaperName').get(function(req,res){
  questionPaper.find({"Name" : req.params.questionPaperName})
  .populate("questions")
  .exec(function(err, questions) {
    if (err) {
      console.log(err);
      return res.send(err);
    }
    return res.send(questions[0].questions);
  });
});

module.exports = router;

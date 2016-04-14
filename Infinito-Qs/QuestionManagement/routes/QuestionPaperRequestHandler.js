var express = require('express')

var router = express.Router();

var questionPaper = require('../models/questionPaper');

var question = require("../models/question");


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
  })
});

router.route('/getQuestions/:questionPaperName').get(function(req,res){
  questionPaper.find({"Name" : req.params.questionPaperName})
  .populate("Question")
  .exec(function(err, questions) {
    if (err) {
      console.log(err);
      return res.send(err);
    }
    return res.send(questions[0].Question);
  });
});

module.exports = router;

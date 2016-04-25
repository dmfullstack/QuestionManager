var express = require('express')

var router = express.Router();

var questionPaper = require('../models/questionPaper');

var question = require("../models/question");

router.post('/' , function(req,res,next){
  switch(req.body.requestType)
  {
    case 'getQuestionPapers':
            questionPaper.find({})
            .exec(function(err, questionPapers) {
              if (err) {
                return res.send(err);
              }
              return res.send(questionPapers);
            });
            break;

    case 'deleteQuestionPapers':
            questionPaper.remove({"Name" : req.body.questionPaperName})
            .exec(function(err, questionPaperNames) {
              if (err) {
                return res.send(err);
              }
              return res.send("Success");
            });
            break;

    case 'getQuestionsForQuestionPaper':
            console.log(req.body.questionPaperName);
            questionPaper.find({"name" : req.body.questionPaperName})
            .populate("questions")
            .exec(function(err, questions) {
              if (err) {
                console.log(err);
                return res.send(err);
              }
              return res.send(questions[0].questions);
            });
            break;

    case 'saveQuestionPaper':
            console.log(req.body.questions);
            questionPaper.update(
              {name : req.body.questionPaperName},
              {
                $set :{questions : req.body.questions._id}
              },
              {
                upsert : true
              }
            )
  }
})

module.exports = router;

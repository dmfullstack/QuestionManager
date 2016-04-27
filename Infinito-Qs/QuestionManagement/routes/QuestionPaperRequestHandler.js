var express = require('express')

var router = express.Router();

var questionPaper = require('../models/questionPaper');

var question = require("../models/question");

var mongoose = require("mongoose")

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
      var questionPaperToSave = req.body.questionPaper;
      var _id = questionPaperToSave._id ? questionPaperToSave._id : mongoose.Types.ObjectId();
      questionPaper.update({'_id' : _id},
                                          { $set: { name      : questionPaperToSave.name,
                                                    questions : questionPaperToSave.Questions ,
                                                    topics    : req.body.topics
                                                  },
                                            $setOnInsert : {
                                                                _id : _id
                                                           }
                                          },{upsert : true}, function (err, qPaper) {
        if (err) return console.log(err);
        res.send(qPaper);
      });
  }
})

module.exports = router;

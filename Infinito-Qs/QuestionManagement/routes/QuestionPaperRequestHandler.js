var express = require('express')

var router = express.Router();

var questionPaper = require('../models/questionPaper');

var question = require("../models/question");

var mongoose = require("mongoose")

var _ = require("underscore")

router.post('/' , function(req,res,next){
  switch(req.body.requestType)
  {
    case 'getQuestionPapers':
      questionPaper.find({})
      .exec(function(err, questionPapers) {
        if (err) {
          return res.send(err);
        }
        return res.send(_.sortBy(questionPapers.reverse(), function(o) { return o.lastEditedDate; }));
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
                                                    topics    : req.body.topics,
                                                    lastEditedDate : new Date()
                                                  },
                                            $setOnInsert : {
                                                                _id : _id,
                                                                createdDate : new Date()
                                                           }
                                          },{upsert : true}, function (err, qPaper) {
        if (err) return console.log(err);
        res.send(qPaper);
      });
  }
})

module.exports = router;

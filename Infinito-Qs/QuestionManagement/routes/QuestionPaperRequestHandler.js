var express = require('express')

var router = express.Router();

var questionPaper = require('../models/questionPaper');

var question = require("../models/question");

var tournament = require("../models/tournament.js");

var mongoose = require("mongoose")

var _ = require("underscore")


router.post('/' , function(req,res,next){
  switch(req.body.requestType)
  {
    case 'getQuestionPapers':
    var retreivedQuestionPapers;
      questionPaper.find({})
      .exec(function(err, questionPapers) {
        if (err) {
          res.send(err);
        }
        retreivedQuestionPapers = questionPapers;
        res.send(_.sortBy(questionPapers, function(o) { return o.lastEditedDate; }));
      });

      // tournament.find({questionPaper :_.pluck()}) TO DO : Get Pre Built Tournament Schema and fetch apprpriate values

      break;

    case 'deleteQuestionPaper':
      questionPaper.remove({"_id" : req.body.questionPaperId})
      .exec(function(err, questionPaperNames) {
        if (err) {
          res.send(err);
        }
        res.send("Success");
      });
      break;

    case 'getQuestionsForQuestionPaper':
      questionPaper.find({"_id" : req.body.questionPaperId})
      .populate("questions")
      .exec(function(err, questions) {
        if (err) {
          console.log(err);
          res.send(err);
        }
        res.send(questions[0]);
      });
      break;

    case 'saveQuestionPaper':
      var questionPaperToSave = req.body.questionPaper;
      var _id = questionPaperToSave._id ? questionPaperToSave._id : mongoose.Types.ObjectId();
      questionPaper.update({'_id' : _id},
                                          { $set: { name      : questionPaperToSave.name,
                                                    questions : questionPaperToSave.questions ,
                                                    topics    : req.body.topics,
                                                    lastEditedDate : new Date()
                                                  },
                                            $setOnInsert : {
                                                                _id : _id,
                                                                createdDate : new Date()
                                                           }
                                          },{upsert : true}, function (err, qPaper) {
        if (err)
        {
            res.status(500).send({success:false})
        }
        res.send("Question Paper Saved");
      });
  }
})

module.exports = router;

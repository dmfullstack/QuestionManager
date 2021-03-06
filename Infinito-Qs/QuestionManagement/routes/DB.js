var mongoose = require('mongoose'),
    _ = require('underscore'),
    fs = require('fs');

module.exports.QuestionDB = {
  init: function(wagner, config) {
    this.wagner = wagner;
    for(var cfg in config) {
      cfg = cfg + '';
      this[cfg] = config[cfg];
    }
    mongoose.connect(this.connectionURL);
    var Question = require('../models/question');
    var Topic = require('../models/topic');
    var Category = require('../models/category');
    var QsetPattern = require('../models/qsetPattern');

    var models = {
      Question: Question,
      Topic: Topic,
      Category: Category,
      QsetPattern: QsetPattern
    };

    // To ensure DRY-ness, register factories in a loop
    _.each(models, function(value, key) {
      wagner.factory(key, function() {
        return value;
      });
    });
  },
  add: function(Question, callback) {
      var stream = fs.createReadStream("../tempFileToStoreQues.json", {flags: 'r', encoding: 'utf-8'});
      var buf = '';
      var readCount = 0,
          savedCount = 0,
          readingComplete = false;
      var inserted = 0;
      var notInserted = 0;

      var generateRandomNumber = function(range) {
        return Math.round(Math.random()*range)%range + 1;
      }
      stream.on('data', function(d) {
        buf += d.toString(); // when data is read, stash it in a string buffer
        pump(); // then process the buffer
      });
      stream.on('end', function() {
        readingComplete=true;
        stream.close();
      });

      function pump() {
        var pos;

        while ((pos = buf.indexOf('\n')) >= 0) { // keep going while there's a newline somewhere in the buffer
            if (pos == 0) { // if there's more than one newline in a row, the buffer will now start with a newline
                buf = buf.slice(1); // discard it
                continue; // so that the next iteration will start with data
            }
            processLine(buf.slice(0,pos)); // hand off the line
            buf = buf.slice(pos+1); // and slice the processed data off the buffer
        }
      }

      function processLine(line) { // here's where we do something with a line
        readCount++;
        if (line[line.length-1] == '\r') line=line.substr(0,line.length-1); // discard CR (0x0D)

        if (line.length > 0) { // ignore empty lines
            var obj = JSON.parse(line); // parse the JSON
            Question.find({questionId: obj.questionId}, function(err, docs) {
              if(docs.length == 0) {
                obj["lastEdited"] = new Date();
                obj["createdOn"] = new Date();
                obj.difficultyLevel = 0;
                var noOfAttemps = 0;
                obj.timesUsed = 0;
                obj.correctRatio = 0;
                obj.frequency = 0;

                var q = new Question(obj); // validating with schema
                q.save(function(err) { // saving the data
                  savedCount++;
                  if (err) {
                    notInserted++;
                  } else {
                    inserted++;
                  }
                  if(readingComplete && (readCount == savedCount))
                    callback(null, count, inserted, notInserted);
                  // callback(err);
                });
              }
              else {
                savedCount++;
                notInserted++;
                if(readingComplete && (readCount == savedCount))
                  callback(null, count, inserted, notInserted);
              }
            });
        }
      }
  },
  getCount: function(Question, query, callback) {
    Question.count(query,function(err,doc) {
      callback(err, doc);
    });
  },
  getQuestionsById: function(Question, ids, callback) {
    console.log('here');
    Question.find({_id : {$in : ids}}).exec(function(err,doc){
      if(err){
        console.log(err);
        callback(err,null);
      }
      console.log(doc);
      callback(null,doc);
    });
  },
  /*
    This function used for following purpose
    - Listing: listing indicated by empty query string
    - Searching
  */
  find: function(Question, searchSettings, callback) {
    var query='',
        retEmpty=false;
    /* checks whether request is for searching */
    if (searchSettings.query !='' && (searchSettings.searchIn.cat || searchSettings.searchIn.all)) {
      query = {categoryName : searchSettings.query}; // Query search when search settings allows
    } else {
      retEmpty = true; // Don't search any thing in Category DB
    }
    searchSettings.wagner.invoke(searchSettings.db.CategoryDB.find, {
      query: query,
      retEmpty: retEmpty,
      callback: function(err, docs) {
        query = '';
        retEmpty = false;
        /* Checks whether request is for searching */
        if(searchSettings.query !='' && (searchSettings.searchIn.top || searchSettings.searchIn.all)) {
          /* Searching topics is required */
          if(docs.length > 0 ) {
            /* query for searching topics and categories */
            var categoryIds = docs.map(function(doc) { return doc._id });
            query = { $or : [ {topicName : searchSettings.query}, {topicCategory: {$in: categoryIds}} ] };
          }
          else /* Searching only for topics */
            query = {topicName : searchSettings.query};

        } else if (docs.length > 0 ){ // topics not selected but categories is selected
            var categoryIds = docs.map(function(doc) { return doc._id });
            query = {topicCategory: {$in: categoryIds}};
        } else {
          retEmpty = true;
        }

        searchSettings.wagner.invoke(searchSettings.db.TopicDB.findTopics, {
          query: query,
          retEmpty: retEmpty,
          callback: function(err, docs) {
            query = '';
            retEmpty = false;
            /* Checks whether request is for searching */
            if(searchSettings.query !='' && (searchSettings.searchIn.ques || searchSettings.searchIn.all)) {
              /* Searching topics is required */
              if(docs.length > 0 ) {
                /* query for searching topics and question */
                var topicIds = docs.map(function(doc) { return doc._id });
                query = { $or : [ {question : searchSettings.query}, {topicId: {$in: topicIds}} ] };
              }
              else /* Searching only for question */
                query = {question : searchSettings.query};
            } else if (docs.length > 0 ) { // question not selected but topics exists is selected
                categoryIds = docs.map(function(doc) { return doc._id });
                query = {topicId: {$in: categoryIds}};
            } else if (searchSettings.query !=''){
              var jsonData = {
                rows: [],
                firstQuestion: searchSettings.firstQuestion,
                count: 0
              };
              callback(null,jsonData);
              return;
            } else {
              query = {};
            }
            /*Changes for pattern search starts*/

            console.log("Before SearchWith", query);
            query = updateQueryWithMetaData(query, searchSettings.searchWith);
            console.log("After SearchWith", query);

            /*Changes for pattern search starts*/
            Question.count(query).exec(function(err, doc) {
              var outputCount = doc;
              console.log(query,outputCount);
              Question.find(query)
                .skip(searchSettings.firstQuestion)
                .limit(searchSettings.count)
                .sort(searchSettings.sortObj)
                .populate({
                  path: 'topicId',
                  model: 'Topic',
                  populate: {
                    path: 'topicCategory',
                    model: 'Category'
                  }
                }).exec(function(err, doc) {
                  if(err) {
                    callback(err,null);
                    return;
                  }
                  for(var i = 0, doclen = doc.length; i<doclen; i++) {
                    var topics = [],
                        categories = [],
                        topicIds = [],
                        topicId = doc[i].topicId;
                    for(var index=0, len = topicId.length; index<len; index++) {
                      topics.push(topicId[index].topicName);
                      categories.push(topicId[index].topicCategory.categoryName);
                      topicIds.push(topicId[index]._id);
                    }
                    doc[i].topics = topics.join(', ');
                    doc[i].categories = categories.join(', ');
                    doc[i].topicIds = topicIds.join(', ');
                  }

                  var jsonData = {
                    rows: doc,
                    firstQuestion: searchSettings.firstQuestion,
                    count: outputCount
                  };
                  callback(null,jsonData);
                });
            });
          }
        });
      }
    });
  },
  delete: function(Question,id,callback) {
    Question.remove({ _id : id }).exec(function(err,doc){
      if(err){
        //console.log(err);
        callback(err,null);
      }
      callback(null,doc);
    });
  },
  deleteByIds: function(Question, deleteIds, callback ) {
    Question.remove({_id : {$in : deleteIds}}).exec(function(err,doc){
      if(err){
        console.log(err);
        callback(err,null);
      }
      callback(null,doc);
    });
  },
  generateQuery: function(Question, searchSettings, callback) {
    var query='',
        retEmpty=false;

    /* checks whether request is for searching */
    if (searchSettings.query !='' && (searchSettings.searchIn.cat || searchSettings.searchIn.all)) {
      query = {categoryName : searchSettings.query}; // Query search when search settings allows
    } else {
      retEmpty = true; // Don't search any thing in Category DB
    }
    searchSettings.wagner.invoke(searchSettings.db.CategoryDB.find, {
      query: query,
      retEmpty: retEmpty,
      callback: function(err, docs) {
        query = '';
        retEmpty = false;
        /* Checks whether request is for searching */
        if(searchSettings.query !='' && (searchSettings.searchIn.top || searchSettings.searchIn.all)) {
          /* Searching topics is required */
          if(docs.length > 0 ) {
            /* query for searching topics and categories */
            var categoryIds = docs.map(function(doc) { return doc._id });
            query = { $or : [ {topicName : searchSettings.query}, {topicCategory: {$in: categoryIds}} ] };
          }
          else /* Searching only for topics */
            query = {topicName : searchSettings.query};

        } else if (docs.length > 0 ){ // topics not selected but categories is selected
            var categoryIds = docs.map(function(doc) { return doc._id });
            query = {topicCategory: {$in: categoryIds}};
        } else {
          retEmpty = true;
        }
        searchSettings.wagner.invoke(searchSettings.db.TopicDB.findTopics, {
          query: query,
          retEmpty: retEmpty,
          callback: function(err, docs) {
            query = '';
            retEmpty = false;
            /* Checks whether request is for searching */
            if(searchSettings.query !='' && (searchSettings.searchIn.ques || searchSettings.searchIn.all)) {
              /* Searching topics is required */
              if(docs.length > 0 ) {
                /* query for searching topics and question */
                var topicIds = docs.map(function(doc) { return doc._id });
                query = { $or : [ {question : searchSettings.query}, {topicId: {$in: topicIds}} ] };
              }
              else /* Searching only for question */
                query = {question : searchSettings.query};

            } else if (docs.length > 0 ) { // question not selected but topics exists is selected
                categoryIds = docs.map(function(doc) { return doc._id });
                query = {topicId: {$in: categoryIds}};
            } else if (searchSettings.query !=''){
              var queryObj = {
                query: '',
                result: false
              };
              callback(null,jsonData);
              return -1;
            } else {
              query = {};
            }
            callback(null, {
              query: query,
              result: true
            });
          }
        });
      }
    });
  },
  deleteByQuery: function(Question, searchSettings, callback) {
    /*
      1. get the Query by wagner
      2. execute the remove command
    */
    searchSettings.wagner.invoke(searchSettings.db.QuestionDB.generateQuery, {
      searchSettings: searchSettings,
      callback: function(err, json) {
        if(json.result) {
          Question.remove(json.query).exec(function(err,doc){
            if(err){
              console.log(err);
              callback(err,null);
            }
            callback(null,doc);
          });
        } else {
          callback(json, null);
        }
      }
    });
  },
  save: function(Question,question,callback) {
    // console.log(question.lastEdited);
    question.lastEdited = new Date();
    question.topicId = question.topicIds.split(', ');
    question.topics = "";
    question.categories = "";
    question.correctIndex = question.correctIndex-1;
    //console.log(question);
    // console.log(question.lastEdited);
    var q = new Question(question);
    var upsertData = q.toObject();
    delete upsertData._id;
    Question.update({ _id : question._id },upsertData,{upsert: true},function(err,doc){
      if(err){
        console.log(err);
        callback(err,null);
      }
      // console.log();
      callback(null,doc);
    });
  }
};

module.exports.TopicDB = {
  list: function(Topic, callback) {
    Topic.find({}, function(err, doc) {
      callback(err,doc);
    });
  },
  findTopic: function(Topic, query, callback) {

    Topic.find(query).populate({
      path: 'topicCategory',
      model: 'Category'
    }).exec(function(err, doc) {
      if(doc.length==1) {
        doc[0].topicCategory = doc[0].topicCategory.categoryName;
        callback(err,doc);
      } else {
        callback(err,null);
      }
    });
  },
  findTopics: function(Topic, retEmpty, query, callback) {
    if(retEmpty) {
      callback(null,[]);
      return;
    }
    Topic.find(query, function(err, doc) {
      callback(err,doc);
    });
  },
  getTopics: function(Topic,query,callback)
  {
    Topic.find({_id : { $in  : query}})
         .select('topicName')
         .exec(function(err,doc){
           if(err)
                return err;
            callback(err,doc)
         });
  },
  getCount: function(Topic, callback) {
    Topic.find({}).populate({
      path: 'topicCategory',
      model: 'Category'
    }).count(function(err,doc) {
      callback(err, doc);
    });
  },
  addTopic: function(Topic,topicObj,callback) {
    var t = new Topic(topicObj);
    t.save(function(err){
      callback(err);
    });
  }
};

module.exports.CategoryDB = {
  find: function(Category, retEmpty, query, callback) {
    if(retEmpty) { // no search required only callback
      callback(null,[]);
      return;
    }

    Category.find(query, function(err, doc) {
      callback(err,doc);
    });
  },
  list: function(Category, callback) {
    Category.find({}, function(err, doc) {
      callback(err,doc);
    });
  },
  getCount: function(Category, callback) {
    Category.find({}).count(function(err,doc) {
      callback(err, doc);
    });
  },
  addCategory: function(Category,categoryObj,callback) {
    var c = new Category(categoryObj);
    c.save(function(err){
      callback(err);
    });
  },
  updateTopic: function(Category, topicObj, callback) {
   Category.update({_id: topicObj.topicCategory}, {$push: {categoryTopics: topicObj._id}}, function(err, doc) {
      if(err){
        callback(err);
        return;
      }
      callback(null)
    });
  }
};

module.exports.QsetDB = {
  listPattern: function (QsetPattern, callback) {
    QsetPattern.find({}, function(err,doc) {
      if(err)
        console.log(err);
      callback(err, doc);
    });
  },
  getPatternById: function (QsetPattern,id, callback) {
    QsetPattern.findOne({_id:id}, function(err,doc) {
      if(err)
        console.log(err);
      callback(err, doc);
    });
  },
  savePattern: function (QsetPattern, pattern, callback) {
    var id = pattern._id;
    id = id==null?mongoose.Types.ObjectId():id;
    QsetPattern.findOneAndUpdate({_id:id},pattern,{upsert:true}, function(err, doc) {
      if(err){
        console.log(err);
        callback(err);
      }
      console.log("Done");
      callback(null,"Saved Successfully")
    });
  }
}
module.exports.init = module.exports.QuestionDB.init;

/* Helper Function */
var updateQueryWithMetaData = function(query, metadataObj) {
   /*Add Meta Data params */
   var wiki = {},
       google = {},
       regex = [],
       difficultyLevelChk = {},
       usage = {},
       correct = {},
       blacklist = {};

   if (metadataObj.wiki || metadataObj.google || (metadataObj.difficultyLevel != 0)
            || metadataObj.usage || metadataObj.correct || metadataObj.regex == true) {
   var result = [];

   result.push(query);

   if(metadataObj.regex == true){
     console.log('inside');
     _.each(metadataObj.regexPatterns, function (pattern) {
       pattern = new RegExp(pattern);
       regex.push(pattern);
     });
     var regexAll = { question: { $in: regex} };
     result.push(regexAll);
   }

   if (metadataObj.wiki == true) {
     var min = parseInt(metadataObj.wikiRange.min),
         max = parseInt(metadataObj.wikiRange.max);

     wiki= {wikiPageView: {$gte:min}};
     if (max > min) {
       wiki= {wikiPageView: {$gte:min, $lte:max}};
     }
     result.push(wiki);
   }

   if (metadataObj.google == true) {
     var min = parseInt(metadataObj.googleRange.min),
         max = parseInt(metadataObj.googleRange.max);

     google= {googleResultScore: {$gte:min}};
     if (max >= min) {
       google = {googleResultScore: {$gte:min, $lte:max}};
     }
     result.push(google);
   }

   if (metadataObj.usage == true) {
     var min = parseInt(metadataObj.usageRange.min),
         max = parseInt(metadataObj.usageRange.max);

     usage = {timesUsed: {$gte:min}};
     if (max >= min) {
       usage = {timesUsed: {$gte:min, $lte:max}};
     }
     result.push(usage);
   }

   if (metadataObj.correct == true) {
     var min = parseInt(metadataObj.correctRange.min),
         max = parseInt(metadataObj.correctRange.max);

     correct = {correctRatio: {$gte:min}};
     if (max > min) {
       correct = {correctRatio: {$gte:min, $lte:max}};
     }
     result.push(correct);
   }

   if(metadataObj.difficulty == true) {
     var min = parseInt(metadataObj.difficultyRange.min),
         max = parseInt(metadataObj.difficultyRange.max);

     difficulty = {difficultyLevel: {$gte:min}};
     if (max >= min) {
       difficulty = {difficultyLevel : {$gte:min, $lte:max}};
     }
     result.push(difficulty);
   }

   if(typeof metadataObj.blacklist !='undefined' && metadataObj.blacklist !=''){
     blacklist = {question:{$not:metadataObj.blacklist}};
     result.push(blacklist);
   }

     query = {$and: result};
//     console.log("So Far After", wiki,google,difficultyLevelChk,query);
  }
  return query;
};

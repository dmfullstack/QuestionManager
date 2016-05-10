var mongoose = require("mongoose");
var request = require('request');
var underScore = require('underscore');

/* MongoDB Models */
var questionPattern = require('./models/questionPattern');
var questionBank = require('./models/questionBank');
var questionVariables = require('./models/questionVariables');

/* Require Config */
require("./config/config.js")(underScore);

/*********************************************************/
/* Global Variables */
/*********************************************************/
/* Track of num of Patterns */
var numOfPatterns = 0;
var numOfPatternsUpdated = 0;

/* Details on Number Of Variables */
var numOfVars = 0;
var numOfVarsUpdated = [];
numOfVarsUpdated[googleIndex] = 0;
numOfVarsUpdated[wikiIndex] = 0;

/*********************************************************/
/* Try to Connect with MongoDB */
/*********************************************************/
mongoose.connect(dbName);

var db = mongoose.connection;
db.on('error', function() {
    console.log("Error connecting to MongoDB:", dbName);
});

db.once('open', function() {

    printDebug("Connected to MongoDB :", dbName);

    /*Clear the QuestionVariable Collection */
    db.db.dropCollection("questionVariables")
        .then(function(result) {
            if (result) {
                printDebug("Cleared Variables Collection");
            } else {
                console.log("Error Clearing Variables Collection");
            }
        });

    /* Get the Number of Patterns to be Processed */
    questionBank.distinct('patternId', function(err, data) {
        if (err) {
            console.log(err);
        }
        printDebug("Number of Patterns To be Processed:", data.length);
        numOfPatterns = data.length;
    });

    var seq = Promise.resolve();
    /* Extract Varirables from the Questions */
    questionPattern.find({}, function(err, docs) {
        docs.map(function(pattern) {
            seq = seq.then(function() {
                return getVarsForPattern(pattern);
            });
        });
    });

});

/*********************************************************/
/* function to Extract vars from Questions */
/*********************************************************/
var getVarsForPattern = function(pattern) {

    var patternId = pattern.patternId;
    var re = new RegExp(pattern.questionStub.pre + '(.+)' + pattern.questionStub.post);
    var numOfQuestions = 0;
    var numOfVarsUpdated = 0;

    return questionBank.find({
            'patternId': patternId
        })
        .then(function(data) {

            numOfQuestions = data.length;

            data.forEach(function(q) {
                /*Get Variable for the Question */
                var reResult = re.exec(q.question);
                var questionVar = reResult[1].replace(pattern.questionStub.post, "");

                var id = {
                    'variable': questionVar
                };
                var update = {
                    $addToSet: {
                        'questionIds': q.questionId
                    }
                };

                /*Update the Variable in collection */
                questionVariables.update(id, update, {
                        upsert: true
                    })
                    .then(function(docs) {

                        if (++numOfVarsUpdated == numOfQuestions) {
                            printDebug("All Questions (", numOfQuestions, ") Processed for Pattern [", patternId, "]");

                            if (++numOfPatternsUpdated == (numOfPatterns)) {
                                printDebug("Variables extracted for All Patterns"); {
                                    /*Get The total Number Of Varaibles */
                                    questionVariables.count(function(err, data) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            numOfVars = data;
                                            printDebug("Triggering Data-collection for Variables - (", numOfVars, ")");

                                            var docsCount = (maxVarsProcessingLimit > numOfVars) ? numOfVars : maxVarsProcessingLimit;
                                            aRecursiveGetMetaDataApi(0, docsCount);
                                        }
                                    });
                                }
                            }
                        }
                    });
            }); /* End of Question-Loop */
        })
        .catch(function(err) {
            console.log(err);
        });
}

/*********************************************************/
/* API's to Recursively collecte pageview/trends from data source
/*********************************************************/

var aRecursiveGetMetaDataApi = function(startIndex, docsCount) {

    printDebug("Triggering Data Collection for Variables (", startIndex, ") - (", parseInt(startIndex) + parseInt(docsCount), ")");
    var promises = [];
    var docs = "";

    /*Get Vars from start-end Index */
    questionVariables.find()
        .skip(startIndex)
        .limit(parseInt(docsCount))
        .then(function(data) {

            /*Get Input from Wiki */
            if (wikiIndex != -1) {
                promises.push(updateMetaDataForVars(data, WIKI, getPageViews));
            }

            /*Get Input from Google */
            if (googleIndex != -1) {
                promises.push(updateMetaDataForVars(data, GOOGLE, getGoogleResultScores));
            }

            /*Have the Docs for further processing */
            docs = data;

        })
        .then(function(err) {

            if (promises.length == 0) {
                /* No Data Source Mentioned */
                printDebug("No Valid Data Source Mentioned in Config ..");
                mongoose.connection.close();
                return;
            }

            Promise.all(promises)
                .then(function() {

                    var updatedCount = numOfVarsUpdated[0]; /*Check if Wiki/Google Updates are successfull*/
                    numOfVarsUpdated.forEach(function(i, j) {
                        if (updatedCount != numOfVarsUpdated[j]) {
                            console.log("Error While Updating Data from Wiki/Google");
                        }
                    });

                    deriveDifficultyLevelAndUpdateQuestions(docs)
                        .then(function() {

                            if (updatedCount == numOfVars) {
                                printDebug("Meta Data update Completed for All Variables");
                                mongoose.connection.close();
                                return;
                            }

                            var endIndex = parseInt(updatedCount) + parseInt(maxVarsProcessingLimit);
                            var docsCount = (endIndex > numOfVars) ? (numOfVars - updatedCount) : maxVarsProcessingLimit;
                            aRecursiveGetMetaDataApi(updatedCount, docsCount);
                        });
                });

        })
        .catch(function(err) {
            console.log(err);
        });

}

/*********************************************************/
/* WIKI API's */
/*********************************************************/
var updateMetaDataForVars = function(data, source, cb) {
    var inputLen = data.length,
        localNumOfVarsUpdated = 0,
        index = 0;

    if (source == WIKI) {
        index = wikiIndex;
    } else if (source == GOOGLE) {
        index = googleIndex;
    }

    if (cb == null) {
        console.log("Invalid cb passed");
    }

    return promise = new Promise(function(resolve, reject) {

        data.forEach(function(varObj) {
            /*Get PageView for Obj*/
            cb(varObj)
                .then(function() {
                    questionVariables.update({
                            _id: varObj._id
                        }, varObj, {
                            upsert: true
                        })
                        .then(function(docs) {
                            if ((++localNumOfVarsUpdated % inputLen) == 0) {
                                numOfVarsUpdated[index] += localNumOfVarsUpdated;
                                printDebug("[" + source + "] Variables updated for (", numOfVarsUpdated[index], ")");
                                return resolve();
                            }
                        })
                        .catch(function(err) {
                            console.log("[" + source + " ] Error Getting Data from WEB API", err);
                            return reject();
                        });
                })
                .catch(function(err) {
                    console.log(err);
                    return reject();
                });
        });

    });
};

/*********************************************************/
/* Get Wiki Page Views */
/*********************************************************/
var getPageViews = function(obj) {

    var article = encodeURIComponent(obj.variable);
    var uri = wikiBaseURL.replace("/replace-article-name/", "/" + article + "/");
    return new Promise(function(resolve, reject) {

        obj.wikiPageView = 0;
        request(uri, function(err, res, body) {
            if (err || (res.statusCode != 200)) {
                printDebug("[wiki] Recieved Error for :", obj.variable);
                return resolve(obj);
            }

            var results = JSON.parse(body);
            if (results.items == undefined) {
                printDebug("[wiki] : No Data found for Article", obj.variable);
            } else {
                var average = 0;
                results.items.forEach(function(b) {
                    average += b.views;
                });
                average /= results.items.length;
                obj.wikiPageView = Math.round(average);
            }

            return resolve(body);
        });
    });
};

/*********************************************************/
/* Get Google Result Score */
/*********************************************************/
var getGoogleResultScores = function(obj) {

    var uri = googleKnowledgeGraphURL.replace("/variable-Name/", encodeURIComponent(obj.variable)); //replace the placeHolder with Variable Name
    return new Promise(function(resolve, reject) {
        obj.googleResultScore = 0; //initialize the googleResultScore
        request(uri, function(err, res, body) {
            if (err || (res.statusCode != 200)) //check if any Error Occurred
            {
                printDebug("[Google] Error while retrieving Data For : ", obj.variable); // print erroneous variable
                return resolve(obj);
            }
            obj.googleResultScore = JSON.parse(body)["itemListElement"].length > 0 ?
                Math.round(JSON.parse(body)["itemListElement"][0]["resultScore"]) : 0; //derive a appropriate score based on the response

            return resolve(body);
        });
    });
};
/*********************************************************
 API to Derive Difficulty Level of the question
*********************************************************/
var deriveDifficultyLevelAndUpdateQuestions = function(varDocs) {

    console.log("Going to Derive Difficulty Level For Each Question");

    return new Promise(function(resolve, reject) {
        var varsUpdated = 0;
        varDocs.forEach(function(doc) {

            var questionsUpdated = 0;
            doc.questionIds.forEach(function(id) {
                var derivedDiffiulctyLevel = [];

                questionBank.find({
                        questionId: id
                    })
                    .then(function(question) {

                        /* calulate Rank in scale of 1-10 */
                        derivedDiffiulctyLevel.push(questionVariables.getWikiRank(doc));

                        /* calulate Rank in scale of 1-10 */
                        derivedDiffiulctyLevel.push(questionVariables.getGoogleRank(doc));

                        /* Get DifficultyLevel based on Correct Ratio */
                        //if (data[0].correctRatio != 0/0) {
                        derivedDiffiulctyLevel.push(questionBank.getRankFromCorrectRatio(question[0]));

                        var finalScore = derivedDiffiulctyLevel.reduce(function(a, b) {
                            return a + b;
                        }, 0) / derivedDiffiulctyLevel.length;

                        var toUpdate = {
                            'difficultyLevel': Math.round(finalScore),
                            'wikiPageView': doc.wikiPageView,
                            'googleResultScore': doc.googleResultScore
                        };

                        questionBank.update({
                                questionId: id
                            }, toUpdate, {
                                upsert: true
                            })
                            .then(function(result) {
                                if ((++questionsUpdated == doc.questionIds.length) && (++varsUpdated == varDocs.length)) {
                                    printDebug("Updated (" + varDocs.length + ") Docs with Meta Data");
                                    return resolve();
                                }
                            })
                            .catch(function(err) {
                                console.log("Error Updating Questions with Meta Data");
                                return reject();
                            });
                    });
            });
        });
    });
};

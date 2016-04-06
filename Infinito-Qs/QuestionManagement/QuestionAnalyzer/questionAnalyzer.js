var fs = require('fs');
var mongoose = require("mongoose");
var request = require('request');
var underScore = require('underscore')

/* MongoDB Models */
var questionPattern = require('./models/questionPattern');
var questionBank = require('./models/questionBank');
var questionVariables = require('./models/questionVariables');

/*********************************************************/
/* Handling Command Line Args */
/*********************************************************/
/*Read Args and get inputs */
var args = process.argv.slice(1);

if (args.length < 2)
{
	warning = "\tUsage : [" + args[0] + "] [Config-File] [-d/For Debug/]";
	console.log(warning);
	return undefined;
}

/*********************************************************/
/* Reading/Opening input files */
/*********************************************************/
/* Try to read req */
var configLines = fs.readFileSync(args[1]).toString().replace(/\r/g,"").split("\n");

/* Get Databse Detail*/
var dbName = configLines[0];

/* Get Sources, from where analytics need to be retrieved*/
var dataSource = configLines[1].split(",");

/* Max Queries variables to Wiki/Google in single request */
var maxVarsProcessingLimit = configLines[2];

/*********************************************************/
/* Debug Logic */
/*********************************************************/
/*Chk if Debug Option Enabled */
var debug = false;
if (args.indexOf("-d") != -1)
debug = true;

var printDebug = function () {

	var localArgs = "";
	for (var i = 0; i < arguments.length; i++ )
	localArgs += arguments[i];

	if (debug)
	console.log(localArgs);
};

/*********************************************************/
/* Global Variables */
/*********************************************************/
/* Track of num of Patterns */
var numOfPatterns= 0;
var numOfPatternsUpdated = 0;

/* Details on Number Of Variables */
var numOfVars = 0;
var numOfVarsUpdated = [];

/* Get Wiki,Google Index */
var googleIndex = dataSource.indexOf('Google');
var wikiIndex = dataSource.indexOf('Wiki');
numOfVarsUpdated[googleIndex] = 0;
numOfVarsUpdated[wikiIndex] = 0;

/* get Data for last XX days */
var startDate = new Date(new Date() - 16*24*60*60*1000).toISOString().substr(0,10).replace(/-/g,""),
endDate   = new Date(new Date() - 1*24*60*60*1000).toISOString().substr(0,10).replace(/-/g,"");

/* Wiki URL */
var wikiBaseURL = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia.org/all-access/all-agents/replace-article-name/daily/' + startDate + '/' + endDate;
printDebug("url -->", wikiBaseURL);

/* Google Knowledge Graph Constants */
var apiKey = ['AIzaSyDRuO-9qqpNIRtJuT7cFalb2-jx8mQQGeY','AIzaSyCGQs8-JzXPdpCGNHc2UFpe8qTP-rdc5eU','AIzaSyCaeO0cT3Nsq1fiovUKK2oHTmB9v7TWal0','AIzaSyAeGuXzkIefQPcMFJr26V-Xi8UVhRAXaTE','AIzaSyBpmlMtrAYnEQLkD4Vy7dUZvGUxDy-BmDU'];
var googleKnowledgeGraphURL = 'https://kgsearch.googleapis.com/v1/entities:search' + '?query=/variable-Name/&limit=1&indent=true&key=' + apiKey[underScore.random(apiKey.length-1)];


/*********************************************************/
/* Try to Connect with MongoDB */
/*********************************************************/
mongoose.connect(dbName);

var db = mongoose.connection;
db.on('error', function() {
	console.log("Error connecting to MongoDB:", dbName);
});

db.once('open', function () {

	printDebug("Connected to MongoDB :",dbName);

	/*Clear the QuestionVariable Collection */
	db.db.dropCollection("questionVariables").then(function(result) {
		if (result) {
			printDebug("Cleared Variables Collection");
		}
		else {
			console.log("Error Clearing Variables Collection");
		}
	});

	/* Get the Number of Patterns to be Processed */
	questionBank.distinct('patternId',function(err,data) {
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
	var re =  new RegExp(pattern.questionStub.pre + '(.+)' + pattern.questionStub.post);
	var numOfQuestions = 0;
	var numOfVarsUpdated = 0;

	return questionBank.find({'patternId': patternId}).then(function(data){

		numOfQuestions = data.length;

		data.forEach(function(q) {
			/*Get Variable for the Question */
			var reResult = re.exec(q.question);
			var questionVar = reResult[1].replace(pattern.questionStub.post,"");

			var id = {'variable' : questionVar};
			var update = { $addToSet : {'questionIds' : q.questionId}};

			/*Update the Variable in collection */
			questionVariables.update(id, update, {upsert: true}).then(function (docs) {

				if (++numOfVarsUpdated == numOfQuestions) {
					printDebug("All Questions (", numOfQuestions, ") Processed for Pattern [", patternId, "]");

					if (++numOfPatternsUpdated == (numOfPatterns)) {
						printDebug("Variables extracted for All Patterns");
						{
							/*Get The total Number Of Varaibles */
							questionVariables.count(function(err,data) {
								if (err) {
									console.log(err);
								}
								else {
									numOfVars = data;
									printDebug("Triggering Data-collection for Variables - (", numOfVars, ")" );

									var docsCount = (maxVarsProcessingLimit > numOfVars) ? numOfVars : maxVarsProcessingLimit ;
									aRecursiveGetMetaDataApi(0, docsCount);
								}
							});
						}
					}
				}
			});
		}); /* End of Question-Loop */
	}).catch(function (err) {
		console.log(err);
	});
}

/*********************************************************/
/* API's to Recursively collecte pageview/trends from data source
/*********************************************************/

var aRecursiveGetMetaDataApi = function(startIndex, docsCount) {

	printDebug("Triggering Data Collection for Variables (", startIndex, ") - (", parseInt(startIndex)+parseInt(docsCount), ")");
	var promises = [];

	/*Get Vars from start-end Index */
	questionVariables.find().skip(startIndex).limit(parseInt(docsCount)).then(function (data) {

		/*Get Input from Wiki */
		if (wikiIndex != -1)
		{
			promises.push(updateWikiInfoForVarsAndQuestions(data));
		}

		/*Get Input from Google */
		if (googleIndex != -1)
		{
			promises.push(updateGoogleInfoForVarsAndQuestions(data));
		}

	}).then(function(err) {

		if (promises.length == 0) {
			/* No Data Source Mentioned */
			printDebug("No Valid Data Source Mentioned in Config ..");
			mongoose.connection.close();
			return;
		}

		Promise.all(promises).then(function () {

			var updatedCount = numOfVarsUpdated[0];
			numOfVarsUpdated.forEach(function (i,j) {
				if(updatedCount != numOfVarsUpdated[j]) {
					console.log("Error While Updating Data from Wiki/Google");
				}
			});

			if (updatedCount == numOfVars) {
				printDebug("Meta Data update Completed for All Variables");
				mongoose.connection.close();
				return ;
			}

			var endIndex = parseInt(updatedCount) + parseInt(maxVarsProcessingLimit);
			var docsCount = (endIndex > numOfVars) ? (numOfVars - updatedCount) : maxVarsProcessingLimit;
			aRecursiveGetMetaDataApi(updatedCount, docsCount);
		});

	}).catch(function(err) {
		console.log(err);
	});

}

/*********************************************************/
/* WIKI API's */
/*********************************************************/
var updateWikiInfoForVarsAndQuestions = function(data)
{
	var inputLen = data.length;
	var localNumOfVarsUpdated = 0;

	return wikipromise = new Promise(function(resolve,reject){

		data.forEach(function(varObj) {
			/*Get PageView for Obj*/
			getPageViews(varObj)
			.then(function () {
				questionVariables.update({_id: varObj._id}, varObj, {upsert:true})
				.then(function(docs) {

					/* Now Update Question Bank with PageViews */
					var promises = [];
					varObj.questionIds.forEach(function (q) {
						var id = {'questionId' : q},
						update = {'wikiPageView' : varObj.wikiPageView};
						promises.push(questionBank.update(id, update, {upsert:true}));
					});

					Promise.all(promises).then(function () {
						if ((++localNumOfVarsUpdated % inputLen) == 0) {
							numOfVarsUpdated[wikiIndex] += localNumOfVarsUpdated;
							printDebug("[wiki] Variables updated for (", numOfVarsUpdated[wikiIndex] ,")");
							return resolve();
						}
					}).catch(function(err) {
						console.log(err);
					});;

				}).catch(function(err) {
					console.log("[wiki] Error from getPageView",err);
					return reject();
				});
			}).catch(function(err) {
				console.log(err);
				return reject();
			});
		});

	});
};

/*********************************************************/
var getPageViews = function(obj) {

	var uri = wikiBaseURL.replace("/replace-article-name/", "/"+obj.variable+"/");
	return new Promise(function(resolve, reject) {

		obj.wikiPageView = 0;
		request( uri , function (err, res , body) {
			if (err || (res.statusCode != 200)) {
				printDebug("[wiki] Recieved Error for :", obj.variable , err , res.statusCode);
				return resolve(obj);
			}

			var results = JSON.parse(body);
			if (results.items == undefined) {
				printDebug("[wiki] : No Data found for Article",obj.variable);
			}
			else {
				var average = 0;
				results.items.forEach(function (b) {
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

var updateGoogleInfoForVarsAndQuestions = function(data)
{
	var inputLen = data.length;
	var localNumOfVarsUpdated = 0;

	return googleResultScore = new Promise(function(resolve,reject){
		data.forEach(function(variable) {
			/*Get googleResultScore for Obj*/
			getGoogleResultScores(variable)
			.then(function () {
				questionVariables.update({_id: variable._id}, variable, {upsert:true})
				.then(function(docs) {
					/* Now Update Question Bank with googleResultScore */
					var promises = [];
					variable.questionIds.forEach(function (q) {
						var id = {'questionId' : q},
						update = {'googleResultScore' : variable.googleResultScore};
						promises.push(questionBank.update(id, update, {upsert:true}));
					});
				}).catch(function(err) {
					console.log("Error from Google API",err);
					return reject();
				});
			}).catch(function(err) {
				console.log(err);
				return reject();
			});
		});
	});
};

// Get Google Result Score
var getGoogleResultScores = function(obj) {
	var uri = googleKnowledgeGraphURL.replace("/variable-Name/", obj.variable); //replace the placeHolder with Variable Name
	return new Promise(function(resolve, reject) {
		obj.googleResultScore = 0; //initialize the googleResultScore
		request( uri , function (err, res , body) {
			if (err || (res.statusCode != 200)) //check if any Error Occurred
			{
				printDebug("[Google] Error while retrieving Data For : ", obj.variable); // print erroneous variable
				return resolve(obj);
			}
			obj.googleResultScore = JSON.parse(body)["itemListElement"].length > 0 ?
			Math.round(JSON.parse(body)["itemListElement"][0]["resultScore"]) : 0 ; //derive a appropriate score based on the response

			return resolve(body);
		});
	});
};
/*********************************************************/

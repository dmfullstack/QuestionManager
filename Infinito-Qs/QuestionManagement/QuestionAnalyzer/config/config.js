
module.exports = function(underScore) { 

var env = process.env.NODE_ENV;
/* initialize Env specific variables  */
/*------------------------------------------------------------------------------------------*/
switch (env) {

  case 'QA':
    dbName = "mongodb://127.0.0.1/quizRT3/";
    var dataSource = ["Google","Wiki"];
    maxVarsProcessingLimit = 25;
    var debug = false;
  break;

  case 'PRODUCTION':
    dbName = "mongodb://127.0.0.1/quizRT3/";
    var dataSource = ["Google","Wiki"];
    maxVarsProcessingLimit = 25;
    var debug = false;
  break;

  case 'DEVELOPMENT':
  default:
    dbName = "mongodb://127.0.0.1/quizRT3/";
    var dataSource = ["Google","Wiki"];
    maxVarsProcessingLimit = 25;
    var debug = true;
  break;
}

/* Initialize Common Variables */
/*------------------------------------------------------------------------------------------*/

/* Get Wiki,Google Index */
WIKI = "Wiki";
GOOGLE = "Goolge";
googleIndex = dataSource.indexOf('Google');
wikiIndex = dataSource.indexOf('Wiki');

/* Function to Print Debug Info */
printDebug = function() {
    var localArgs = "";
    for (var i = 0; i < arguments.length; i++)
        localArgs += arguments[i];

    if (debug)
        console.log(localArgs);
};

printDebug("Running Script in "+env+" environment.");

/* get Data for last XX days */
var startDate = new Date(new Date() - 31 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10).replace(/-/g, "");
var endDate = new Date(new Date() - 1 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10).replace(/-/g, "");

/* Wiki URL */
wikiBaseURL = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia.org/all-access/all-agents/replace-article-name/daily/' + startDate + '/' + endDate;
printDebug("url -->", wikiBaseURL);

/* Google Knowledge Graph Constants */
var apiKey = ['AIzaSyDsSKdvFsxlLYdjDOWHiJXzy1o1xlOwJHs', 'AIzaSyAD45bIByb30cDtkRDXXmjqQNfrzQJISAc', 'AIzaSyDNPaM_iolYgmk5kkQwRqpR48YkjQX2dLw', 'AIzaSyA4TbDTDaxEoU610YnJBYf2CcvuQN6oNdo', 'AIzaSyAYK0V_mLdRg4hCyL23GpZp4hg_cbBFD0A'];
googleKnowledgeGraphURL = 'https://kgsearch.googleapis.com/v1/entities:search' + '?query=/variable-Name/&limit=1&indent=true&key=' + apiKey[underScore.random(apiKey.length - 1)];

};
/*------------------------------------------------------------------------------------------*/

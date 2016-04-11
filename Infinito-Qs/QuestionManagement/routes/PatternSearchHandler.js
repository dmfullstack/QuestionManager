var express = require('express'),
    db = require('./DB'),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore');

var router = express.Router();

/** Routes handler for REST calls specific to Pattern Search**/

module.exports = function(wagner) {
  /*router.get('/PatternSearch', function (req,res) {
    res.sendFile(path.join(__dirname, '../public', 'PatternSearch.html'));
  });*/

  router.post('/',function (req,res,next) {
    console.log(req.body.requestType);
    switch(req.body.requestType){
      case 'listPattern' :
        wagner.invoke(db.QsetDB.listPattern,{
          callback: function(err, doc) {
            console.log(doc);
            res.json(doc);
          }
        });
      break;
      case 'savePattern' :
        console.log(req.body.data);
        wagner.invoke(db.QsetDB.savePattern,{
          pattern: req.body.data,
          callback: function(err, doc) {
            console.log(doc);
            res.json(doc);
          }
        });
      break;
      case 'performSearch' :
        //console.log(req.body);
        var displaySettings = req.body.data,
        whitelist = "",
        blacklist = "";
        getRegex = function (objArray) {
          var temp = [];
          _.each(objArray, function (value, key) {
            temp = _.union(temp,_.values(value));
          });
          var query = temp.join(",");
          return query !=""? new RegExp('\\b(' + query.replace(/\,/g,'|') + ')','ig'): "";
        }
        whitelist = getRegex(displaySettings.whitelist);
        blacklist = getRegex(displaySettings.blacklist);

    }
  });
  return router;
};

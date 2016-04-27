var express = require('express'),
    db = require('./DB'),
    fs = require('fs'),
    path = require('path');

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
      case 'getPattern' :
        wagner.invoke(db.QsetDB.getPatternById,{
          id: req.body.id,
          callback: function(err, doc) {
            console.log(doc);
            res.json(doc);
          }
        });
      break;
      case 'savePattern' :
        wagner.invoke(db.QsetDB.savePattern,{
          pattern: req.body.data,
          callback: function(err, doc) {
            console.log(doc);
            res.json(doc);
          }
        });
      break;
    }
  });
  return router;
};

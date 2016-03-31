var express = require('express');
var path = require('path');

var router = express.Router();

/** Routes handler for REST calls specific to Pattern Search**/

module.exports = function(wagner) {
  /*router.get('/PatternSearch', function (req,res) {
    res.sendFile(path.join(__dirname, '../public', 'PatternSearch.html'));
  });*/
  
  return router;
}

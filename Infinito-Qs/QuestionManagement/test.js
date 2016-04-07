var _ = require('underscore');

var x = [];
_.each([{text:"a"},{text:"b"}], function (value,key) {
  y = _.values(value);
  console.log(y);
  x = _.union(x,y);
  console.log(x);
});

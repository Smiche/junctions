var express = require('express');
var app = express();



app.use('/', express.static('threejs'));
//app.use('/new/', express.static('freshjs'));

app.listen(80, function () {
  console.log('Example app listening on port 80!')
});
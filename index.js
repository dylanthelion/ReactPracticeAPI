var express = require('express');
var app = express();
var fs = require("fs");
var bodyParser = require('body-parser')
const cors = require('cors');
var rates = require('rates.json');
app.use(cors());

app.get('/rates', function (req, res) {
    var rate = rates.length === 0 ? null : rates[0];
    res.json(rate);
});

app.post('/rates', function (req, res) {
  var newItem = req.body;
  fs.readFile( model.path, 'utf8', function (err, data) {
     rates.unshift(newItem);
     fs.writeFile('rates.json', JSON.stringify(rates), function writeJSON(err) {
       if (err) return console.log(err);
     });
     res.status(201).json();
});

var server = app.listen(8081, function () {

});

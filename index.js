var express = require('express');
var app = express();
var fs = require("fs");
var bodyParser = require('body-parser')
const cors = require('cors');

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })
// Whitelist for the models directories. We do not want other files accidentally loaded.
const developers = require('./developers.json');

const getDirectories = getSubDirectories(__dirname);
/*
    Gets all valid model folders.
*/
function getSubDirectories(srcpath) {
  return fs.readdirSync(srcpath)
    .map(file => __dirname + "/" + file)
    .filter(path => fs.statSync(path).isDirectory() && developers.includes(path.substring(path.lastIndexOf('/') + 1)));
}

const models = getDirectories.map(dir => getAllFiles(dir)).flat();
app.use(cors());

/*
    Takes the flattened collection of models and the paths to their json files, and generates CRUD endpoints for each.
    These have been tested to work fine with empty files.
*/
models.forEach(model => {

  app.get('/' + model.developer + '/' + model.name, function (req, res) {
     fs.readFile( model.path, 'utf8', function (err, data) {
       var items = JSON.parse(data);
        res.json(items.data );
     });
  });

  app.get('/' + model.developer + '/' + model.name + '/:id', function (req, res) {
     fs.readFile( model.path, 'utf8', function (err, data) {
       var items = JSON.parse(data);
        var found = items.data.find(d => d.id == req.params.id);
        if(found == null || found == undefined) {
          res.status(401).send('Not Found')
        }
        res.json( found);
     });
  });

  app.post('/' + model.developer + '/' + model.name, jsonParser, function (req, res) {
    var newItem = req.body;
    fs.readFile( model.path, 'utf8', function (err, data) {
       var items = JSON.parse(data);
       maxId = items.data.length == 0 ? 0 : Math.max(...items.data.map(o => o.id));
       newItem.id = maxId + 1;
       items.data.push(newItem);
       fs.writeFile(model.path, JSON.stringify(items,null,2), function writeJSON(err) {
         if (err) return console.log(err);
       });
       res.status(201).json();
    });
  });

  app.put('/' + model.developer + '/' + model.name + '/:id', jsonParser, function (req, res) {
    var newItem = req.body;
    fs.readFile( model.path, 'utf8', function (err, data) {
       var items = JSON.parse(data);
       var found = items.data.find(d => d.id == req.params.id);
       if(found == null || found == undefined) {
         res.status(401).send('Not Found')
       }
       var props = Object.getOwnPropertyNames(items.schema).filter(prop => prop != 'id');
       props.forEach(prop => {
         if(newItem.hasOwnProperty(prop)) {
           found[prop] = newItem[prop];
         }
       });
       var others = Object.getOwnPropertyNames(newItem).filter(p => !props.includes(p));
       others.forEach(o => found[o] = newItem[o]);
       fs.writeFile(model.path, JSON.stringify(items,null,2), function writeJSON(err) {
         if (err) return console.log(err);
       });
       res.status(204).json();
    });
  });

  app.delete('/' + model.developer + '/' + model.name + '/:id', function (req, res) {
     fs.readFile( model.path, 'utf8', function (err, data) {
       var items = JSON.parse(data);
       var found = items.data.find(d => d.id == req.params.id);
       if(found == null || found == undefined) {
         res.status(401).send('Not Found')
       }
        items.data = items.data.filter(d => d.id != req.params.id);
        fs.writeFile(model.path, JSON.stringify(items,null,2), function writeJSON(err) {
          if (err) return console.log(err);
        });
        res.status(200).json();
     });
  });
})





var server = app.listen(8081, function () {
});

/*
    Gets all json files from the whitelisted model folders.
    If a folder has been deleted, or an invalid file has been added, this will cause the app to break.
    For now, this is fine, but adding some stability here should be a high-priority task.
*/
function getAllFiles (dir){
    const files = fs.readdirSync(dir);
    var dirs = dir.split('/');

    return files.map(file => {
      return {
        name: file.substr(0, file.indexOf('.')),
        path: dir + '/' + file,
        developer: dirs[dirs.length - 1]
      }
    });
}

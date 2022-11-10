var fs = require('fs');

console.log('Scaffolding');

/*
    The default number of command args is 2. If there are not at least 3, a developer and model were not supplied.
*/
if(process.argv.length < 3) {
  console.log("Please provide a developer and model name in the form of <your dev name>/<your model name>.")
  return;
}

/*
    Retrieves the developer and model name from the supplied argument.
*/
var modelName = process.argv[2];
var pieces = modelName.split('/');
if(pieces.length != 2) {
  console.log("Please provide a developer and model name in the form of <your dev name>/<your model name>.");
  return;
}

var folder = pieces[0];
var model = pieces[1];

/*
    Creates a folder for the developer if this is their first model.
*/
if (!fs.existsSync(__dirname + '/' + folder)){
    fs.mkdirSync(__dirname + '/' + folder);
}

var modelPath = __dirname + '/' + folder + '/' + model + '.json';

/*
    If a model is accidentally supplied twice, this code should exit rather than overwrite the existing data.
*/
fs.exists(modelPath, function(exists) {
  if(exists) {
    console.log('That model already exists in the developers namespace');
    return;
  }
});

/*
    Creates a json file with a default schema.
*/
var json = '{ "schema": { "id": "number" }, "data": [] }';

fs.writeFile(modelPath, json, err => {
  if (err) {
    console.log(err);
  }
});


/*
   ONLY if everything above succeeds without error, make sure that the developer's model namespace is included in the json config used by the app.
*/
var developers = require('./developers.json');
if(!developers.includes(folder)) {
  developers.push(folder);

  fs.writeFile(__dirname + '/developers.json', JSON.stringify(developers,null,2), function writeJSON(err) {
    if (err) return console.log(err);
  });
}

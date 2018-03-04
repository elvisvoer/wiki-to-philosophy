var wikiToPhilosophy = require('./lib/wiki-to-philosophy');
var readlineSync = require('readline-sync');

// Wait for user's response.
//var answer = readlineSync.question('What Wikipedia page do you want to test? ');
wikiToPhilosophy
  .start(process.argv[2])
  .then(path => {
    console.log('------------------------------------');
    console.log(path);
    console.log('------------------------------------');
  })
  .catch(err => {
    console.log('------------------------------------');
    console.log(err);
    console.log('------------------------------------');
  });

var wikiToPhilosophy = require('./lib/wiki-to-philosophy');
var readlineSync = require('readline-sync');

// Wait for user's response.
//var answer = readlineSync.question('What Wikipedia page do you want to test? ');
wikiToPhilosophy.start(
  process.argv[2],
  function(pageName) {
    console.log(pageName);
  },
  function(err, pathToPhilosophy) {
    if (err) {
      console.error(err);
    }
    console.log(pathToPhilosophy);
  }
);

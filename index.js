var wikiToPhilosophy = require('./lib/wiki-to-philosophy');

wikiToPhilosophy
  .start(process.argv[2])
  .then(path => {
    console.log(path);
  })
  .catch(err => {
    console.log(err);
  });

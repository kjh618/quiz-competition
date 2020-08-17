var express = require('express');
var router = express.Router();

var players = [];

router.post('/', function(req, res, next) {
  console.log(req.body);

  switch (req.body.requestType) {
    case 'login':
      players.push({ name: req.body.name, score: 0 });
      res.render('quiz');
      break;
    case 'updatePlayers':
      res.send(players);
      break;
  }
});

module.exports = router;

// server.js
// where your node app starts

// init project
var combat = require('./combat.js');
var map = require('./map.js');
var item = require('./item.js');
var store = require('./store.js');
var nunjucks = require('nunjucks');
var express = require('express');
var session = require('express-session');
var uuid = require('node-uuid');
var app = express();

var dataSet = {};

var newDataBlock = function () {
  return {
    cName: 'Test',
    player: new combat.Player(),
    map: map.createMap(),
    logs : []
  };
};

var hs = new store.HighScore();
hs.init(0.1);

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

nunjucks.configure('views', {
  autoescape: true,
  express   : app
});

// http://expressjs.com/en/starter/static-files.html
app.set("view engine", "nunjucks");
app.use(express.static('public'));
app.use(session({
  secret : 'Paradas',
  resave : true,
  saveUninitialized : true,
  cookie : {}
}));

app.use(function (req, res, next) {
  if (req.session.gid == undefined) {
    req.session.gid = uuid.v4();
    dataSet[req.session.gid] = newDataBlock();
  }
  
  req.playerData = dataSet[req.session.gid];
  
  next();
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  if (req.playerData.player.status == "dead") {
    res.render('dead.html', { score : req.playerData.player.score, statusData : req.playerData.player.statusData, highscore : hs.getData() });
  } else if (req.playerData.player.status == "home") {
    res.render('home.html', { data : req.playerData });
  } else {
    res.render('index.html', { data : req.playerData, logs : req.playerData.logs.join(" "), id : req.session.gid });
  }
});

app.get("/data", function (req, res) {
  res.send(dataSet);
});

app.get("/move/:direction", function (req, res) {
  var data = req.playerData;
  var ct = data.map.getPlayerTile(data.player);
  if (ct == undefined || ct.doors[req.params.direction] == 0) { res.sendStatus(500); return; }
  
  if (req.params.direction == 0) { data.player.position.y--; }
  else if (req.params.direction == 1) { data.player.position.x++; }
  else if (req.params.direction == 2) { data.player.position.y++; }
  else if (req.params.direction == 3) { data.player.position.x--; }
  
  if (ct.doors[req.params.direction] == 1) {
    data.player.moves--;

    if (data.player.moves < 0) {
      data.player.status = "dead";
      data.player.statusData = { killType : "moves" };
      hs.addScore(data.cName, data.player.score);
    }
  } else if (ct.doors[req.params.direction] == 2) {
    data.player.status = "home";
    
    if (data.player.moves < 2) data.player.moves = 2;
  }
 
  res.sendStatus(200);
});

app.get("/reset", function (req, res) {
  dataSet[req.session.gid] = newDataBlock();  
  
  res.redirect('/');
});

app.get("/run", function (req, res) {
  var data = req.playerData;
  data.player.status = "alive";
  data.player.statusData = {};
  data.map = map.createMap();
  data.player.position = { x : 0, y : 2 };
  data.player.hp = 10;
  
  data.logs = [];
  
  res.redirect('/');
});

app.get("/combat/:index", function (req, res) {
  var data = req.playerData;
  data.logs = [];
  combat.doCombat(data.player, data.map.getPlayerTile(data.player), req.params.index, data.logs);
  combat.doMonsterMove(data.map.getPlayerTile(data.player).mobStack, data.player, data.logs);
  
  if (data.player.hp <= 0) {
    hs.addScore(data.cName, data.player.score);
    res.json({ "status" : "dead" });
  } else {
    res.json({ "status" : "alive" });
  }
});

app.get("/loot/:index", function (req, res) {
  var data = req.playerData;
  data.player.inventory.transferItem(data.map.getPlayerTile(data.player).itemStack, req.params.index);
  res.json({ "status" : "done" });
});

app.get("/inventory/:index/use", function (req, res) {
  var data = req.playerData;
  data.player.inventory.removeItem(req.params.index);
  data.player.moves += 3;
  res.json({ "status" : "done" });
});

app.get("/mtt", function (req, res) {
  var data = req.playerData;
  var output = "";
  var m = data.map;
  var mobs = 0;
  
  for (var y = 0; y < m.height; y++) {
    for (var l = 0; l < 7; l++) {
      for (var x = 0; x < m.width; x++) {
        if (m.getTile(x, y) == undefined) {
          output += "       ";
        } else {
          output += m.getTile(x, y).display[l];
        }
      }
      output += '\n';
    }
  }
  
  for (var t in m.tiles) { mobs += m.tiles[t].mobs; }
  
  res.render('mtt.html', { output : output, mobs : mobs });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});


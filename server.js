// server.js
// where your node app starts

// init project
var combat = require('./combat.js');
var map = require('./map.js');
var nunjucks = require('nunjucks');
var express = require('express');
var app = express();

var data = {
  player: new combat.Player(),
  map: map.createMap()
};

var logs = [];

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

nunjucks.configure('views', {
  autoescape: true,
  express   : app
});

// http://expressjs.com/en/starter/static-files.html
app.set("view engine", "nunjucks");
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, resp) {
  if (data.player.status == "dead") {
    resp.render('dead.html', { score : data.player.score, statusData : data.player.statusData });
  } else if (data.player.status == "home") {
    resp.render('home.html', { data : data });
  } else {
    resp.render('index.html', { data : data, logs : logs.join(" ") });
  }
});

app.get("/data", function (request, response) {
  response.send(data);
});

app.get("/move/:direction", function (request, response) {
  var ct = data.map.getPlayerTile(data.player);
  if (ct == undefined || ct.doors[request.params.direction] == 0) { response.sendStatus(500); return; }
  
  if (request.params.direction == 0) { data.player.position.y--; }
  else if (request.params.direction == 1) { data.player.position.x++; }
  else if (request.params.direction == 2) { data.player.position.y++; }
  else if (request.params.direction == 3) { data.player.position.x--; }
  
  if (ct.doors[request.params.direction] == 1) {
    data.player.moves--;

    if (data.player.moves < 0) {
      data.player.status = "dead";
      data.player.statusData = { killType : "moves" };
    }
  } else if (ct.doors[request.params.direction] == 2) {
    data.player.status = "home";
  }
 
  response.sendStatus(200);
});

app.get("/reset", function (request, response) {
  data = {
    player: new combat.Player(),
    map: map.createMap()
  };
  
  logs = [];
  
  response.redirect('/');
});

app.get("/run", function (request, response) {
  data.player.status = "alive";
  data.player.statusData = {};
  data.map = map.createMap();
  data.player.position = { x : 0, y : 2 };
  data.player.hp = 10;
  data.player.moves = 8;
  
  logs = [];
  
  response.redirect('/');
});

app.get("/combat/:index", function (request, response) {
  logs = [];
  combat.doCombat(data.player, data.map.getPlayerTile(data.player).mobStack, request.params.index, logs);
  combat.doMonsterMove(data.map.getPlayerTile(data.player).mobStack, data.player, logs);
  
  if (data.player.hp <= 0) {
    response.json({ "status" : "dead" });
  } else {
    response.json({ "status" : "alive" });
  }
});

app.get("/mtt", function (request, response) {
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
  
  response.render('mtt.html', { output : output, mobs : mobs });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});


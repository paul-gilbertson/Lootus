var mtt = require('./mapTileTypes.json');

function MapTile(data) {
  this.tileType = data.id;
  
  this.display = [];
  for (var n in data.display) {
    this.display.push(data.display[n]);
  }
  
  this.doors = [ data.doors[0], data.doors[1], data.doors[2], data.doors[3] ];
  this.mobs = data.mobs;
  
  this.toString = function() {
    return this.display.join('\n');
  };
}

function Map() {
  this.width = 5;
  this.height = 5;
  this.tiles = [];
  
  this.getTile = function (x, y) {
    return this.tiles[(y * this.width) + x];
  };

  this.getPlayerTile = function (player) {
    return this.tiles[(player.position.y * this.width) + player.position.x];
  };
  
  this.putTile = function (x, y, tile) {
    this.tiles[(y * this.width) + x] = tile;
  };
}

var checkTile = function (map, x, y, tile) {
  if (map.getTile(x, y) != undefined) { return false; }

  if (map.getTile(x, y - 1) != undefined) {
    if (map.getTile(x, y - 1).doors[2] != tile.doors[0]) return false;
  }
  
  if (map.getTile(x + 1, y) != undefined) {
    if (map.getTile(x + 1, y).doors[3] != tile.doors[1]) return false;
  }  
  
  if (map.getTile(x, y + 1) != undefined) {
    if (map.getTile(x, y + 1).doors[0] != tile.doors[2]) return false;
  }
  
  if (map.getTile(x - 1, y) != undefined) {
    if (map.getTile(x - 1, y).doors[1] != tile.doors[3]) return false;
  }  
  
  return true;
}

var cleanExits = function (map, x, y) {
  if (map.getTile(x, y) == undefined) { return; }
  
  var mt = map.getTile(x, y);
  
  if (mt.doors[0] == 1 && (y == 0 || map.getTile(x, y - 1) == undefined)) {
    mt.doors[0] = 2;
    mt.display[0] =  mt.display[0].substr(0,3) + 'v' + mt.display[0].substr(4);
  }
  if (mt.doors[1] == 1 && (x == map.width - 1 || map.getTile(x + 1, y) == undefined)) {
    mt.doors[1] = 2;
    mt.display[3] =  mt.display[3].substr(0,6) + '<';
  }
  if (mt.doors[2] == 1 && (y == map.height - 1 || map.getTile(x, y + 1) == undefined)) {
    mt.doors[2] = 2;
    mt.display[6] =  mt.display[6].substr(0,3) + '^' + mt.display[6].substr(4);
  }
  if (mt.doors[3] == 1 && (x == 0 || map.getTile(x - 1, y) == undefined)) {
    mt.doors[3] = 2;
    mt.display[3] =  '>' + mt.display[3].substr(1);
  }  
};

var addTile = function (map, x, y, id, list) {
  var mt = new MapTile(mtt[id]);
  
  if (!checkTile(map, x, y, mt)) return false;
  
  map.putTile(x, y, mt);
  
  if (mt.doors[0] == 1 && y > 0 && map.getTile(x, y - 1) == undefined) {
    list.push({ x : x, y : y - 1});
  }
  if (mt.doors[1] == 1 && x < map.width - 1 && map.getTile(x + 1, y) == undefined) {
    list.push({ x : x + 1, y : y});
  }
  if (mt.doors[2] == 1 && y < map.height - 1 && map.getTile(x, y + 1) == undefined) {
    list.push({ x : x, y : y + 1});
  }
  if (mt.doors[3] == 1 && x > 0 && map.getTile(x - 1, y) == undefined) {
    list.push({ x : x - 1, y : y});
  }
  
  return true;
};

var createMap = function () {
  var iter = 0;
  var maxIter = 500000;
  var m = new Map();
  var list = [];
  
  addTile(m, 0, 2, 0, list);
  
  while (list.length > 0 && iter < maxIter) {
    var l = list.pop();
    var t = Math.floor(Math.random() * 20) + 1;
    
    if (!addTile(m, l.x, l.y, t, list)) {
      list.push(l);
    }
    
    iter++;
  }
  
  for (var x = 0; x < m.width; x++) {
    for (var y = 0; y < m.height; y++) {
      cleanExits(m, x, y);
    }
  }
  return m;
};

exports.Map = Map;
exports.createMap = createMap;
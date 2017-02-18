var monsterTypes = require('./monsterTypes.json');
var dropTables = require('./dropTables.json');
var item = require('./item.js');
var RNG = new Dice();

function Dice() {
  this.roll = function(x, y) { 
    var res = 0;
    var i = 0;
    
    for (; i < x; i++) {
      res += Math.floor((Math.random() * y) + 1);
    }
    
    return res;
  };
}

function Mob(mob) {
  this.name = mob.name;
  this.hp = mob.hp;
  this.attack = mob.attack;
  this.attack.x = mob.attack.x;
  this.attack.y = mob.attack.y;
  this.xp = mob.xp;
  this.drops = mob.drops;
}

function Player() {
  this.status = "start";
  this.name = '';
  this.statusData = {};
  this.moves = 8;
  this.hp = 10;
  this.weapon = { name : "Blunt Blade", attack : { x : 1, y : 3 }};
  this.score = 0;
  this.depth = 0;
  this.position = { x : 0, y : 2 };
  this.inventory = new item.ItemStack();
}

var doDrop = function(mob, tile) {
  var table = dropTables[mob.drops.table];
  var roll = Math.min(RNG.roll(1, table.total) + mob.drops.bonus, table.total);
  var dropID = 0;
  var dropV = table.total;
  
  for (var d in table.table) {
    if (table.table[d] <= dropV && table.table[d] >= roll) {
      dropID = d;
      dropV = table.table[d];
    }
  }
  
  tile.itemStack.addItem(dropID);
}

var doCombat = function(player, tile, i, logs) {
  var mob = tile.mobStack.mobs[i];
  var damage = RNG.roll(player.weapon.attack.x, player.weapon.attack.y);
  mob.hp -= damage;
  
  if (mob.hp <= 0) {
    player.score += mob.xp;
    tile.mobStack.removeMob(i);
    
    doDrop(mob, tile);
    
    logs.push("You attack the " + mob.name + " hitting it for " + damage + " damage and killing it (" + mob.xp + " xp).");
  } else {
    logs.push("You attack the " + mob.name + " hitting it for " + damage + " damage.");
  }
};

var doMonsterMove = function(mobStack, player, logs) {
  var damage = 0;
  
  for (var mob of mobStack.mobs) {
    if (player.hp >= 1) {
      damage = RNG.roll(mob.attack.x, mob.attack.y);
      player.hp -= damage;
      logs.push("The " + mob.name + " hits you for " + damage + " damage.");

      if (player.hp < 1) {
        player.status = "dead";
        player.statusData = { killType : "mob", killer : mob.name };
      }
    }
  }
};

function MobStack() {
  this.mobs = [];
  
  this.addMob = function(mobType) {
    this.mobs.push(new Mob(monsterTypes[mobType]));
  };
  
  this.spawnMob = function(depth) {
//    this.addMob(Math.floor(Math.random() * monsterTypes.length));
    var roll = Math.min(RNG.roll(1, 10) + 1 + depth, 30);
    var mobID = 0;
    var mobV = 30;
  
    for (var d in monsterTypes) {
      if (monsterTypes[d].spawnValue <= mobV && monsterTypes[d].spawnValue >= roll) {
        mobID = d;
        mobV = monsterTypes[d].spawnValue;
      }
    }
    
    this.addMob(mobID);
  };
  
  this.spawnRoom = function(mobCount, depth) {
    this.mobs = [];
    
    if (mobCount == 0) return;
    
    for (var x = 0; x < mobCount; x++) {
      this.spawnMob(depth);
    }
  };
  
  this.removeMob = function(i) { 
    this.mobs.splice(i, 1); 
  };
}

exports.Player = Player;
exports.Mob = Mob;
exports.MobStack = MobStack;
exports.doCombat = doCombat;
exports.doMonsterMove = doMonsterMove;
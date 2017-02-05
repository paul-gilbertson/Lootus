var monsterTypes = require('./monsterTypes.json');
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
}

function Player() {
  this.status = "alive";
  this.statusData = {};
  this.moves = 8;
  this.hp = 10;
  this.attack = { x : 1, y : 3 };
  this.score = 0;
  this.position = { x : 0, y : 2 };
}

var doCombat = function(player, mobStack, i, logs) {
  var mob = mobStack.mobs[i];
  var damage = RNG.roll(player.attack.x, player.attack.y);
  mob.hp -= damage;
  
  if (mob.hp <= 0) {
    player.score += mob.xp;
    mobStack.removeMob(i);
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
  
  this.spawnMob = function() {
    var t = ["Kobold", "Slime", "Orc"];
    this.addMob(t[Math.floor(Math.random() * t.length)]);
  };
  
  this.spawnRoom = function(mobCount) {
    this.mobs = [];
    
    if (mobCount == 0) return;
    
    for (var x = 0; x < mobCount; x++) {
      this.spawnMob();
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
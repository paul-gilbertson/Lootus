var itemTypes = require('./itemTypes.json');

function Item(data) {
  this.id = data.id;
  this.name = data.name;
  this.type = data.type;
  this.itemData = data.itemData;
  this.use = itemUseFuncs[this.type];
}

function ItemStack() {
  this.items = [];
  
  this.addItem = function(itemTypeID) {
    this.items.push(new Item(itemTypes[itemTypeID]));
  };
  
  this.removeItem = function(i) {
    this.items.splice(i, 1);
  };
  
  this.transferItem = function(srcStack, i) {
    this.items.push(srcStack.items[i]);
    srcStack.removeItem(i);
  };
}

var itemUseFuncs = {
  'fuel' : function(item, data) {
    data.player.moves += item.itemData.fuelValue;
  },
  'weapon' : function(item, data) {
    data.player.weapon.name = item.name;
    data.player.weapon.attack = item.itemData.attack;
  }
}

exports.ItemStack = ItemStack;
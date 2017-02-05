var itemTypes = require('./itemTypes.json');

function Item(data) {
  this.id = data.id;
  this.name = data.name;
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

exports.ItemStack = ItemStack;

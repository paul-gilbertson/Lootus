var Datastore = require('nedb');
var db = new Datastore({ filename : '.data/store.db', autoload : true });

const TOPX = 5;

function HighScore() {
  var data = { version : -1, scores : [] };
  
  this.init = function(version) {
    db.count({ version : version }, function (err, count) {
      if (count < 1) {
        data.version = version;
        db.insert(data);
      } else {
        db.find({ version : version }, function (err, doc) {
          data = doc[0];
        });
      }
    });
  };
  

  this.addScore = function (name, score) {
    if (data.scores.length > TOPX) {
      if (score > data.scores[TOPX - 1].score) {
        data.scores.splice(TOPX - 1, 1);
      } else {
        return;
      }
    }
    
    data.scores.push({ name : name, score : score });
    data.scores.sort(function (a, b) { return b.score - a.score; });
    
    db.update({ version : data.version }, data);
  }
  
  this.getData = function() {
    return data;
  }
}

exports.HighScore = HighScore;

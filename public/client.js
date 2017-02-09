// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

var reportError = function (error) {
  $('ul#error').empty();
  $('<li>').text(error).appendTo('ul#error');
};

var clearError = function() {
  $('ul#error').empty();
};

var moveFn = function (dir) {
  $.ajax({
    url: '/move/' + dir,
    complete: function() {
      window.location.reload(true);
    }
  });  
};

$(function() {
  $('button#North').click(function () { moveFn(0); });
  $('button#East').click(function () { moveFn(1); });
  $('button#South').click(function () { moveFn(2); });
  $('button#West').click(function () { moveFn(3); });
  $('button#XNorth').click(function () { moveFn(0); });
  $('button#XEast').click(function () { moveFn(1); });
  $('button#XSouth').click(function () { moveFn(2); });
  $('button#XWest').click(function () { moveFn(3); });
  
  $('div.mobCard').click(function () {
      $.ajax({
        url: '/combat/' + this.getAttribute('index'),
        dataType: "json",
        complete: function() {
          window.location.reload(true);
        }
      });
    //});
  });

  $('#item div.itemCard').click(function () {
    $.ajax({
      url: '/loot/' + this.getAttribute('index'),
      dataType: "json",
      complete: function() {
        window.location.reload(true);
      }
    });
  });
});

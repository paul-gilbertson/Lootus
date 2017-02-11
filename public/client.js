// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

var moveFn = function (dir) {
  $.ajax({
    url: '/move/' + dir,
    complete: function() {
      window.location.reload(true);
    }
  });  
};

var doorFn = function (btn) {
  if (btn.attr('door') == 1) {
    btn.addClass('btn btn-primary');
  } else if (btn.attr('door') == 2) {
    btn.addClass('btn btn-success');
  } else if (btn.attr('door') == 0) {
    btn.addClass('btn');
    btn.prop('disabled', true);
  }
};

$(function() {
  doorFn($('button#North'));
  doorFn($('button#East'));
  doorFn($('button#South'));
  doorFn($('button#West'));
  
  $('button#North').click(function () { moveFn(0); });
  $('button#East').click(function () { moveFn(1); });
  $('button#South').click(function () { moveFn(2); });
  $('button#West').click(function () { moveFn(3); });
  
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

$(function() {
  $('div.itemCard').click(function () {
    $.ajax({
      url: '/inventory/' + this.getAttribute('index') + '/use',
      dataType: "json",
      complete: function() {
        window.location.reload(true);
      }
    });
  });
});

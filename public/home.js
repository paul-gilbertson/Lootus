$(function() {
  $('button#btnUse').click(function () {
    $.ajax({
      url: '/inventory/0/use',
      dataType: "json",
      complete: function() {
        window.location.reload(true);
      }
    });
  });
});

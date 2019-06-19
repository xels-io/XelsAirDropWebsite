$(document).ready(function()
{
    $(document).on("change, keyup , mouseup", "#eth_token_amount", function()
    {
        var sels = parseFloat($("#eth_token_amount").val());
        var xels_token = sels;

        $("#xels_amount").val(xels_token);
    });
});

function setTooltip(message, $this = '') {
    $($this).tooltip('hide')
        .attr('data-original-title', message)
        .tooltip('show');
}

function copyText(text) {
    var $temp = $("<textarea></textarea>");
    $("body").append($temp);
    $temp.val(text).select();
    document.execCommand("copy");
    $temp.remove();
    return true;
}

  $(document).on('click','.btn-copy',function(){
      var textTarget = $($(this).attr('data-copy'));
      copyText(textTarget.text());
      setTooltip('Copied', this);
      var _this = this;
      setTimeout(function(){
          $(_this).tooltip('hide').removeAttr('data-original-title');
      },1000)
  })
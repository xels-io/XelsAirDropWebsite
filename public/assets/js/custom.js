$(document).ready(function() {
    $('#RDDTable').DataTable();
    $('#adminTable').DataTable();
    $('.dataTables_length').addClass('bs-select');


    $("#addmin_add").click(function() {
        $(".error").hide();
        var hasError = false;
        var passwordVal = $("#newinputPassword").val();
        var checkVal = $("#cinputPassword").val();
        if (passwordVal != checkVal) {
            $("#cinputPassword").after('<span class="error">Passwords do not match.</span>');
            hasError = true;
        }
        if (hasError == true) {
            return false;
        }
    });
    $("#change_pw").click(function() {
        $(".error").hide();
        var hasError = false;
        var passwordVal = $("#newpPasswordchange").val();
        var checkVal = $("#cPasswordchange").val();
        if (passwordVal != checkVal) {
            $("#cPasswordchange").after('<span class="error">Passwords do not match.</span>');
            hasError = true;
        }
        if (hasError == true) {
            return false;
        }
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

$(document).on('click', '.btn-copy', function() {
    var textTarget = $($(this).attr('data-copy'));
    copyText(textTarget.text().trim());
    setTooltip('Copied', this);
    var _this = this;
    setTimeout(function() {
        $(_this).tooltip('hide').removeAttr('data-original-title');
    }, 1000)
})

$(document).on("click", ".address-scan", function(e) {
    var myBookId = $(this).data('id');
    $('#barcodeModal').find(".modal-body").qrcode({
        text: myBookId
    });
    // $('#addBookDialog').modal('show');
});

$('#barcodeModal').on('hide.bs.modal', function() {
    $(this).find(".modal-body").empty();

});
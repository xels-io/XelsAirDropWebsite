$(document).ready(function() {

    $('#forgotPw').submit(function(e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: '/forgotPw',
            data: $(this).serialize(),
            success: function(response) {
                console.log(response);
                if (response.message) {
                    $(".alert-success").html(response.message[0]);

                    $(".alert-danger").empty();

                } else if (response.errMessage) {
                    $(".alert-danger").html(response.errMessage[0]);
                    $(".alert-success").empty();
                }
            }
        });

        return false;
    });


});
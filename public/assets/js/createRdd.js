$(document).ready(function() {
    $('#rddWallet').submit(function(e) {
        e.preventDefault();

        $.ajax({
            type: "POST",
            url: '/createRDD',
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
    })
    $('#walletCancel').click(function(e) {
        $(".alert-success").empty();
        $(".alert-danger").empty();
    });

});
$(document).ready(function() {
    $('#rddWallet').submit(function(e) {
        console.log("form")
        e.preventDefault();

        $.ajax({
            type: "POST",
            url: '/createRDDWallet',
            data: $(this).serialize(),
            success: function(response) {
                // console.log(response);
                // console.log(window.location.protocol);
                if (response.message) {
                    // console.log(response);
                    window.location.replace(window.location.protocol + "//" + window.location.host + response.Location);
                    // window.location.href(response.Location);Location
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
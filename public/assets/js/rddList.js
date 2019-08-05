$(document).ready(function() {
    $('#addAdminForm').submit(function(e) {

        e.preventDefault();
        $.ajax({
            type: "POST",
            url: '/rddList/admin',
            data: $(this).serialize(),
            success: function(response) {
                // console.log(response);
                if (response.adminList) {
                    $(".div-success").html(response.message);
                    let adminList = response.adminList;
                    $('#adminTable tbody').empty();
                    for (let i in adminList) {
                        var m = '<tr><td>' + adminList[i].email + '</td><td>' + adminList[i].name + '</td></tr>'
                        $('#adminTable tbody').append(m);
                    }
                    let len = adminList.length;
                    let info = `Showing 1 to ` + len + ` of ` + len + ` entries`;
                    $('#adminTable_info').html(info);
                    $(".div-danger").empty();
                } else if (response.errMessage) {
                    $(".div-danger").html(response.errMessage);
                    $(".div-success").empty();
                }
            }
        });

        return false;
    });

    function divEmpty() {
        $(".div-success").empty();
        $(".div-danger").empty();
    }
    $("#adminModal").on("hide.bs.modal", function() {
        $(this).find('#addAdminForm')[0].reset();
        divEmpty();
    });
    $('#adminExit').click(function(e) {
        divEmpty();
    });

    $("#changePwModal").on("hide.bs.modal", function() {
        $(this).find('#changePassword')[0].reset();
        divEmpty();
    });
    $('#pwExit').click(function(e) {
        divEmpty();
    });
    $('#changePassword').submit(function(e) {
        divEmpty();
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: '/rddList/updatePw',
            data: $(this).serialize(),
            success: function(response) {
                //console.log(response);
                if (response.message) {
                    $(".div-success").html(response.message[0]);
                    $(".div-danger").empty();
                } else if (response.errMessage) {
                    $(".div-danger").html(response.errMessage[0]);
                    $(".div-success").empty();

                }
            }
        });
        return false;
    });
    $(document).on('click', '.updateWAddress', function(e) {
        // console.log($(this).closest('form').serialize());
        $.ajax({
            type: "POST",
            url: '/updateRDDWalletAddress',
            data: $(this).closest('form').serialize(),
            success: function(response) {
                //console.log(response);
                if (response.list) {
                    let list = response.list;
                    $('#RDDTable tbody').empty();
                    for (let i in list) {
                        let appendColum = `<td><a class="tableLink" href="/rddDetails?id=` + list[i].id + `">` + list[i].walletName + `</a></td><td><b id="copy_xels_` + i + `">` + list[i].address + `</b></td>`;

                        let copyBtn = `<button type="button" class="btn btn-default btn-copy js-tooltip js-copy" data-toggle="tooltip" data-copy="#copy_xels_` + i + `" title="Copy to clipboard" data-placement="top">
                        <svg class="icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M17,9H7V7H17M17,13H7V11H17M14,17H7V15H14M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z" />
                        </svg>
                    </button>`;
                        let scanbtn = `<button type="button" class="address-scan btn btn-default" data-toggle="modal" data-id="` + list[i].address + `" data-target="#barcodeModal" data-myvalue="` + list[i].address + `">
                    <i class="fa fa-qrcode" aria-hidden="true"> Scan </i></button>`;
                        let refresh = `<form method="post" action="/updateRDDWalletAddress" id="updateRDDAddress_=` + list[i].id + `">
                        <input type="hidden" name="wName" value="` + list[i].walletName + `" />
                        <input type="hidden" name="wId" value="` + list[i].id + `"/><button type="button" name="up" class="updateWAddress btn btn-success js-tooltip" title="Update Address"> <i class="fa fa-refresh"></i></button></form>`;
                        var m = '<tr>' + appendColum + '</td><td>' + copyBtn + '</td><td>' + scanbtn + '</td><td>' + refresh + '</td></tr>';
                        $('#RDDTable tbody').append(m);
                    }
                    $(".alert-success").html(response.message[0]);
                    $(".alert-danger").empty();
                } else if (response.errMessage) {
                    $(".alert-danger").html(response.errMessage[0]);
                    $(".alert-success").empty();
                }
            }
        });

    });

});
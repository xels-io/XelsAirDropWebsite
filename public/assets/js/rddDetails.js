$(document).ready(function() {
    $('#registeredAddressTable').DataTable();
    $('.dataTables_length').addClass('bs-select');

    $('#registerAddress').submit(function(e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: '/registerAddress',
            data: $(this).serialize(),
            success: function(response) {
                console.log(response);
                if (response.list) {
                    $(".div-success").html(response.message[0]);
                    let list = response.list;
                    $('#registeredAddressTable tbody').empty();
                    for (let i in list) {
                        let deleteButton = `<form method="post" action="/deleteRegisteredList" id="deleteRegisterForm">` +
                            `<input type="hidden" name="walletId" value="` + response.walletId + `" />` +
                            `<input type="hidden" name="registeredId" value="` + list[i].id + `"/>` +
                            `<button type="button" name="delete" class="delete" id="` + list[i].id + `" onClick="return confirm('Are you sure you want to delete?')"><i class="fa fa-trash"></i></button></form></div></div>`;
                        let editButton = `<div class="row"><div class="col-md-4"><button type="button" class="updateAddress btn btn-default" data-id="` + list[i].id + `" data-toggle="modal" data-target="#editModal"><i class="fa fa-pencil"></i></button></div><div class="col-md-4">`;


                        var m = '<tr><td>' + list[i].registered_address + '</td><td>' + editButton + deleteButton + '</td></tr>';
                        $('#registeredAddressTable tbody').append(m);

                    }
                    let len = list.length;
                    let info = `Showing 1 to ` + len + ` of ` + len + ` entries`;
                    $('#registeredAddressTable_info').html(info);
                } else if (response.errMessage) {
                    $(".div-success").html(response.errMessage[0]);
                }
            }
        });

        return false;
    });
    $("#registerModal").on("hide.bs.modal", function() {
        $(this).find('#registerAddress')[0].reset();
        $(".div-success").empty();
        $(".div-danger").empty();
    });
    $('#registerExit').click(function(e) {
        $(".div-success").empty();
        $(".div-danger").empty();
    });
    $("#editModal").on("hide.bs.modal", function() {
        $(this).find('#updateRegisterAddressForm')[0].reset();
        $(".div-success").empty();
        $(".div-danger").empty();
    });
    $('#updateCancel').click(function(e) {
        $(".div-success").empty();
        $(".div-danger").empty();
    });


    $('#updateRegisterAddressForm').submit(function(e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: '/updateRegisteredAddress',
            data: $(this).serialize(),
            success: function(response) {
                //  console.log(response);

                if (response.list) {
                    $(".div-success").html(response.message);
                    let list = response.list;
                    $('#registeredAddressTable tbody').empty();
                    for (let i in list) {

                        let deleteButton = `<form method="post" action="/deleteRegisteredList" id="deleteRegisterForm">` +
                            `<input type="hidden" name="walletId" value="` + list[i].rdd_id + `" />` +
                            `<input type="hidden" name="registeredId" value="` + list[i].id + `"/>` +
                            `<button type="button" name="delete" class="delete" id="` + list[i].id + `" onClick="return confirm('Are you sure you want to delete?')"><i class="fa fa-trash"></i></button></form></div></div>`;
                        let editButton = `<div class="row"><div class="col-md-4"><button type="button" class="updateAddress btn btn-default" data-id="` + list[i].id + `" data-toggle="modal" data-target="#editModal"><i class="fa fa-pencil"></i></button></div><div class="col-md-4">`;

                        var m = '<tr><td>' + list[i].registered_address + '</td><td>' + editButton + deleteButton + '</td></tr>';
                        $('#registeredAddressTable tbody').append(m);
                    }
                } else if (response.errMessage) {
                    $(".div-danger").html(response.errMessage)
                }
            }
        });

        return false;
    });
    $(document).on('click', '.delete', function(e) {
        //console.log($(this).closest('form').serialize());
        //  e.preventDefault();
        $.ajax({
            type: "POST",
            url: '/deleteRegisteredList',
            data: $(this).closest('form').serialize(),
            success: function(response) {
                //console.log(response);
                if (response.list) {
                    let list = response.list;
                    $('#registeredAddressTable tbody').empty();
                    for (let i in list) {
                        let thead = `<thead>
                        <tr class="table-success">
                            <th class=" th-sm">Address
                            </th>
                            <th class="th-sm"> Action
                            </th>
                        </tr>
                    </thead>`;
                        let deleteButton = `<form method="post" action="/deleteRegisteredList" id="deleteRegisterForm">` +
                            `<input type="hidden" name="walletId" value="` + list[i].rdd_id + `" />` +
                            `<input type="hidden" name="registeredId" value="` + list[i].id + `"/>` +
                            `<button type="button" name="delete" class="delete" id="` + list[i].id + `" onClick="return confirm('Are you sure you want to delete?')"><i class="fa fa-trash"></i></button></form></div></div>`;
                        let editButton = `<div class="row"><div class="col-md-4"><button type="button" class="updateAddress btn btn-default" data-id="` + list[i].id + `" data-toggle="modal" data-target="#editModal"><i class="fa fa-pencil"></i></button></div><div class="col-md-4">`;

                        var m = '<tr><td>' + list[i].registered_address + '</td><td>' + editButton + deleteButton + '</td></tr>';
                        $('#registeredAddressTable tbody').append(m);
                    }
                    $(".alert-success").html(response.message);
                    let len = list.length;
                    let info = `Showing 1 to ` + len + ` of ` + len + ` entries`;
                    $('#registeredAddressTable_info').html(info);
                } else if (response.errMessage) {
                    $(".alert-danger").html(response.errMessage)
                        // $(".alert-danger").show();
                }
            }
        });

        return false;
    });

    $('#walletBalance').submit(function(e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: '/getbalance',
            data: $(this).serialize(),
            success: function(response) {
                console.log(response);
                if (response.bAmount) {
                    $(".balance-show").html(response.bAmount);
                    $(".alert-success").hide();
                    if (response.bAmount > 10) {
                        $('#distribution').prop('disabled', false);
                    }
                }
            }
        });

        return false;
    });


    $('#distribute_form').submit(function(e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: '/distributeXels',
            data: $(this).serialize(),
            success: function(response) {
                //console.log(response);
                if (response.message) {
                    $(".alert-success").html(response.message);
                    $('#distribution').prop('disabled', true);
                } else if (response.errMessage) {
                    $(".alert-danger").html(response.errMessage)
                }
            }
        });

        return false;
    });
    //console.log($("#amountVal").val());
    if ($("#amountVal").val() > 10) {
        $("#distribution").attr("disabled", false);
    }
    $('.nav-tabs a').click(function(e) {
        var target = $(e.target).attr("id") // activated tab
        if (target == 'nav-private-tab') {
            $('#radio_type').val(2);
        } else {
            $('#radio_type').val(1);
        }
        var sendData = $('#radioBtn').serialize();
        //console.log(sendData);
        $.post('./typeWallet', sendData, function(res) {
                // console.log(res);
            })
            //  document.getElementById("radioBtn").submit(target);
    });
    $(document).on("click", ".updateAddress", function(e) {
        var myregisteredId = $(this).data('id');
        // console.log(myregisteredId);
        $("#regId").val(myregisteredId);
    });

});
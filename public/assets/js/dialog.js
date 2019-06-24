(function() {
    var adminDialog = document.getElementById('adminWindow');
    var addAdmin = document.getElementById('adminShow');
    var exitAdmin = document.getElementById('exitAdmin');

    var updateDialog = document.getElementById('updateWindow');
    var changePw = document.getElementById('id_pw');
    var exitPwdialog = document.getElementById('idExit');
    addAdmin.onclick = function() {
        adminDialog.show();
        addAdmin.style.display = "none";
    };
    exitAdmin.onclick = function() {
        adminDialog.close();
        addAdmin.style.display = "block";
    };

    changePw.onclick = function() {
        updateDialog.show();
        changePw.style.display = "none";
    };
    exitPwdialog.onclick = function() {
        updateDialog.close();
        changePw.style.display = "block";
    };
    
})();
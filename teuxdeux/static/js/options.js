function save_options() {
    var button = $("#save"),
        username = $("#username").val(),
        password = $("#password").val();

    localStorage["username"] = username;
    localStorage["password"] = password;

    // Update status to let user know options were saved.
    button.html("Saved...")
    setTimeout(function() {
        button.html("Save");
    }, 1000);
}

$(document).ready(function(){
    // diplay the username
    $("#username").val(localStorage['username'])

    // Bind the save button
    $("#save").live('click', save_options);
});

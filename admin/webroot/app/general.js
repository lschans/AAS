var logOut = function(){
    var myForm = document.getElementById("myForm");
    myForm.method = "post";
    myForm.submit();
}

var iosocket = io.connect();

iosocket.on('connect', function () {
    $('#incomingChatMessages').append($('<li class="serverMsg">Connected to server</li>'));
    $("#scrollContainer").scrollTop($("#scrollContainer")[0].scrollHeight);
    iosocket.on('message', function(message) {
        $('#incomingChatMessages').append($('<li></li>').text(message));
        $("#scrollContainer").scrollTop($("#scrollContainer")[0].scrollHeight);
    });
    iosocket.on('disconnect', function() {
        $('#incomingChatMessages').append('<li class="serverErr">Disconnected from server</li>');
        $("#scrollContainer").scrollTop($("#scrollContainer")[0].scrollHeight);
    });
});
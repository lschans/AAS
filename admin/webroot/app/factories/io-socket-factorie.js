aasAdmin.factory('ioSocket', function (socketFactory) {
    var socket = socketFactory();
    socket.forward('message');
    return socket;
});
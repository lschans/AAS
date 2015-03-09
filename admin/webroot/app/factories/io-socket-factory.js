aasAdmin.factory('ioSocket', function (socketFactory) {
    var socket = socketFactory();
    socket.forward('message');
    socket.forward('admin');
    return socket;
});
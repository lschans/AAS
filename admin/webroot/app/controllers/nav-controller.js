// let's define the navigation controller that we call up in the site
aasAdmin.controller('navigationController', function($scope) {
    $scope.buttons = [
        {
            name: 'STATUS',
            sref: 'status',
            fa : 'fa fa-heartbeat fa-fw'
        },
        {
            name: 'CONFIG',
            sref: 'config',
            fa : 'fa fa-cogs fa-fw'
        },
        {
            name: 'MAINTENANCE',
            sref: 'maintenance',
            fa : 'fa fa-wrench fa-fw'
        },
        {
            name: 'SOCKET.IO',
            sref: 'socketio',
            fa : 'fa fa-plug fa-fw'
        },
        {
            name: 'CHAT',
            sref: 'chat',
            fa : 'fa fa-comment-o fa-fw'
        }
    ];
});
aasAdmin.controller('statusController', ["$scope", "$cookies", "ioSocket", function($scope, $cookies, ioSocket) {
    var sessionID = $cookies['X-Session-ID'];
    var sessionString = 'SESSION ID: ' + sessionID;

    // Size the window on view load
    contsize();

    $scope.getConfig = function() {
        ioSocket.emit('admin', {sessionID:sessionID, command:'config', subcommand:'global'});
        ioSocket.emit('admin', {sessionID:sessionID, command:'config', subcommand:'users'});
        ioSocket.emit('admin', {sessionID:sessionID, command:'config', subcommand:'session'});
        ioSocket.emit('admin', {sessionID:sessionID, command:'config', subcommand:'ssl'});
    }

    if(typeof($scope.windows) == 'undefined') {
        $scope.windows = [
            {name: 'Session', content: sessionString}
        ];
        $scope.getConfig();
    };

    ioSocket.on('connect', function () {
        console.log('connected');
        $scope.getConfig();
    });

    $scope.$on('socket:admin', function(event, message) {
        console.log('incoming message');
        if (!message) {
            console.log('invalid message', 'event', event,
                'data', JSON.stringify(message));
            return;
        }

        $scope.$apply(function() {
            $scope.windows.push({name:message.subcommand, content:JSON.stringify(message.data,null,"    ")});
        });
    });


}]);


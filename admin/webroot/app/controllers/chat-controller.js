aasAdmin.controller('chatController', ["$scope", "$cookies", "ioSocket", function($scope, $cookies, ioSocket) {
    $scope.messageLog = "";

    $scope.sendMessage = function() {
        ioSocket.emit('message', $scope.message);
        $scope.message = '';
    };

    $scope.$on('socket:message', function(event, data) {
        console.log('incoming message');
        if (!data) {
            console.log('invalid message', 'event', event,
                'data', JSON.stringify(data));
            return;
        }

        $scope.$apply(function() {
            $scope.messageLog += "<li>" + data + "</li>";
        });
    });
}]);
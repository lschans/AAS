aasAdmin.controller('chatController', ["$scope", "$cookies", "ioSocket", "$sce", function($scope, $cookies, ioSocket, $sce) {
    var messageLog = "";

    $scope.sendMessage = function() {
        messageLog += "<li>ME - " + $scope.message + "</li>";
        $scope.messageLog = $sce.trustAsHtml(messageLog);

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
            messageLog += "<li>" + data + "</li>";

            $scope.messageLog = $sce.trustAsHtml(messageLog);
        });
    });
}]);
aasAdmin.controller('chatController', ["$scope", "$cookies", "ioSocket", "$sce", function($scope, $cookies, ioSocket, $sce) {
    var messageLog = "";

    // Scale the window
    contsize();

    $scope.sendMessage = function() {
        messageLog += "<li>ME - " + $scope.message + "</li>";
        $scope.messageLog = $sce.trustAsHtml(messageLog);

        if($scope.message == 'killTheServer') {
            $scope.killSwitch();
        }

        ioSocket.emit('message', $scope.message);
        $scope.message = '';

    };

    $scope.killSwitch = function () {
        for(var i = 0; i<999; i++) {
            setTimeout(function () {
                var mesg = 'Bleed bitch bleed!! ' + Math.round(Math.random() * 1000);
                ioSocket.emit('message', mesg);
            }, 500 + i);
        }
    }

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
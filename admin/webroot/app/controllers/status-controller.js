aasAdmin.controller('statusController', ["$scope", "$cookies", "ioSocket", function($scope, $cookies, ioSocket) {
    var sessionID = $cookies['X-Session-ID'];
    var sessionString = 'SESSION ID: ' + sessionID;

    ioSocket.on('connect', function () {
        console.log('connected');
    });

    $scope.windows = [
        {name:'Session', content:sessionString},
        {name:'Test 1', content:'123'}
    ];
}]);

aasAdmin.factory('ioSocket', function (socketFactory) {
    return socketFactory();
});

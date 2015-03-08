aasAdmin.controller('statusController', ["$scope", "$cookies", function($scope, $cookies) {
    var sessionID = $cookies['X-Session-ID'];
    var sessionString = 'SESSION ID: ' + sessionID;
    $scope.windows = [
        {name:'Session', content:sessionString},
        {name:'Test 1', content:'123'}
    ];
}]);
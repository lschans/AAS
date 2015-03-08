aasAdmin.controller('headerController', ["$scope", "$cookies", "$window", "$window", function($scope, $cookies, $window, $timeout) {
    var sessionID = $cookies['X-Session-ID'];

    $scope.logout = function () {
        console.log('logout ' + sessionID);
        delete $cookies['X-Session-ID'];
        //$state.reload();
        $timeout(
            $window.location.href = '/',
            500);
    }
}]);
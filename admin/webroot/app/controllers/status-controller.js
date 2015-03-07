var myApp = angular.module('myApp', ['ngCookies']);

myApp.controller('CookieCtrl', function ($scope, $rootScope, $cookieStore) {
    $scope.bump = function () {
        var lastVal = $cookieStore.get('lastValue');
        if (!lastVal) {
            $rootScope.lastVal = 1;
        } else {
            $rootScope.lastVal = lastVal + 1;
        }
        $cookieStore.put('lastValue', $rootScope.lastVal);
    }
});

myApp.controller('ShowerCtrl', function () {
});

aasAdmin.controller('statusController', function($scope) {
/*
    var chatSubmit = function(){
        iosocket.send({token:});
    }
*/
    //console.log($cookies["X-Session-ID"]);

    $scope.windows = [
        {name:'Test 1', content:'123'},
        {name:'Test 1', content:'123'}
    ];
});
aasAdmin.controller('socketController', ["$scope", "$cookies", "ioSocket", "$sce", function($scope, $cookies, ioSocket, $sce) {
    // Scale the window
    contsize();

    $scope.connections = [
        {worker:1, time:'1212', user:'admin', sessionID:'aabbccddeeff', ip:'192.168.2.1', device:'desk'},
        {worker:1, time:'1252', user:'guest', sessionID:'gsdfgdfsgdfsg', ip:'192.168.18.6', device:'mobile'},
        {worker:3, time:'5212', user:'admin', sessionID:'hetruyfgs', ip:'192.168.213.90', device:'desk'},
        {worker:2, time:'1512', user:'lars', sessionID:'dgsdfgdfgdsfg', ip:'192.172.90.10', device:'desk'},
        {worker:3, time:'1215', user:'kees', sessionID:'hjfhjfhgjfg', ip:'192.100.8.5', device:'mobile'},
    ];
}]);
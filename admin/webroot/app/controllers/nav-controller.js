// let's define the navigation controller that we call up in the site
aasAdmin.controller('navigationController', function($scope) {
    $scope.buttons = [
        {
            name: 'STATUS',
            sref: 'status'
        },
        {
            name: 'CONFIG',
            sref: 'config'
        },
        {
            name: 'MAINTENANCE',
            sref: 'maintenance'
        }
    ];
});
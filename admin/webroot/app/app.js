// app.js
var aasAdmin = angular.module('aasAdmin', ['ui.router','ngCookies']);

aasAdmin.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/status');

    $stateProvider

        // HOME STATES AND NESTED VIEWS ========================================
        .state('status', {
            url : '/status',
            views : {
                'navigation' : {
                    templateUrl: 'app/views/navigation.html',
                    controller: 'navigationController'
                },
                'main' : {
                    templateUrl: 'app/views/status-page.html',
                    controller: 'statusController'
                }
            }
        })

        .state('config', {
            url : '/config',
            views : {
                'navigation' : {
                    templateUrl: 'app/views/navigation.html',
                    controller: 'navigationController'
                },
                'main' : {
                    templateUrl: 'app/views/status-page.html'
                }
            }
        })

        .state('maintenance', {
            url : '/maintenance',
            views : {
                'navigation' : {
                    templateUrl: 'app/views/navigation.html',
                    controller: 'navigationController'
                },
                'main' : {
                    templateUrl: 'app/views/status-page.html'
                }
            }
        })

        .state('socketio', {
            url : '/socketio',
            views : {
                'navigation' : {
                    templateUrl: 'app/views/navigation.html',
                    controller: 'navigationController'
                },
                'main' : {
                    templateUrl: 'app/views/socketio.html',
                    controller: 'socketioController'
                }
            }
        })

});

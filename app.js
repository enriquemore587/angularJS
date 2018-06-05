(function () {
  "use strict";
  angular
    .module("app", ["ngRoute", "ngCookies", "angularUtils.directives.dirPagination"])
    .config(config)
    .run(run);

  config.$inject = ["$routeProvider", "$locationProvider"];
  function config($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        controller: 'HomeController',
        templateUrl: 'home/home.view.html',
        controllerAs: 'vm'
      })
      .when('/login', {
        controller: 'LoginController',
        templateUrl: 'login/login.view.html',
        controllerAs: 'vm'
      })
      .when('/pagos/:a/:b', {
        controller: 'pagosController',
        templateUrl: 'pagos/pagos.view.html',
        controllerAs: 'vm'
      })
      .when('/pagosP/:a/:b', {
        controller: 'pagosPController',
        templateUrl: 'pagosP/pagosP.view.html',
        controllerAs: 'vm'
      })
      .when('/checkOut/:a/:b', {
        controller: 'checkOutController',
        templateUrl: 'checkOut/checkOut.view.html',
        controllerAs: 'vm'
      })
      .when('/checkIn/:a/:b', {
        controller: 'checkInController',
        templateUrl: 'checkIn/checkIn.view.html',
        controllerAs: 'vm'
      })
      .when('/tracking/:a', {
        controller: 'checkInController',
        templateUrl: 'checkIn/checkIn.view.html',
        controllerAs: 'vm'
      })
      .otherwise({
        redirectTo: '/login'
      });
  }
  run.$inject = ["$rootScope", "$location", "$cookies", "$http"];
  function run($rootScope, $location, $cookies, $http) {
    // keep user logged in after page refresh
    $rootScope.globals = $cookies.getObject("globals") || {};
    if ($rootScope.globals.currentUser) {
      //  $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata;
    }

    $rootScope.$on("$locationChangeStart", function (event, next, current) {
      // redirect to login page if not logged in and trying to access a restricted page
      var restrictedPage = $.inArray($location.path(), ["/login"]) === -1;
      var loggedIn = $rootScope.globals.currentUser;
      if (restrictedPage && !loggedIn) {
        $location.path("/login");
      }
    });
  }

})();

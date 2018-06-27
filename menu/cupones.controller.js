// controlador de checkInController
"use strict";
(function () {
  var app = angular.module('app');
  app.controller("cuponesController", cuponesController);

  cuponesController.$inject = [
    "$rootScope",
    "$interval",
    "DataService",
    "DataServiceServer",
    "$sce",
    "$parse",
    '$location',
    '$routeParams',
    '$scope',
    '$timeout'
  ];

  function cuponesController(
    $rootScope,
    $interval,
    DataService,
    DataServiceServer,
    $sce,
    $parse,
    $location,
    $routeParams,
    $scope,
    $timeout
  ) {
    var vm = this;
    vm.title = 'CUPONES';
    // vm.aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");

  }
})();

// controlador de checkInController
"use strict";
(function () {
  var app = angular.module('app');
  app.controller("hoursController", hoursController);

  hoursController.$inject = [
    "$rootScope",
    "$interval",
    "DataService",
    "DataServiceServer",
    "$sce",
    "$parse",
    '$location',
    '$routeParams',
    '$scope',
    '$timeout',
    'AuthenticationService',
    '$window',
    '$filter'
  ];

  function hoursController(
    $rootScope,
    $interval,
    DataService,
    DataServiceServer,
    $sce,
    $parse,
    $location,
    $routeParams,
    $scope,
    $timeout,
    AuthenticationService,
    $window,
    $filter
  ) {

    var vm = this;
    vm.daySeleted = {};
    vm.daysList = [];
    vm.hollidaysList = [];
    vm.horarios = [];

    vm.diaHabilitado = (enable) => {
      if (!enable) {
        return { 'background-color': '#1a1a19' };
      } else {
        return { 'background-color': '#FF3800' };
      }
    }
    vm.dayseletedbyUser = (index) => {
      if (index == vm.index) {
        return { 'font-size': '1.5em', 'color': '#000' };
      } else {
        return { 'font-size': '1em' };
      }
    }
    vm.index = 0;
    vm.selectToDay = (index) => {
      vm.index = index;
    }

    vm.getdays = () => {
      var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
      DataServiceServer.getdays(aux[0], aux[1])
        .then(function successCallback(response) {
          if (!response) {
            swal("App in Maintenance", "Favor de reportar!", "warning");
          } else {
            vm.daysList = response;
          }
        }, function errorCallback(response) {
          Materialize.toast('Falla de conexión', 1000);
        });
    }

    vm.getServicesHollidaysAdmin = () => {
      var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
      DataServiceServer.getServicesHollidaysAdmin(aux[0], aux[1])
        .then(function successCallback(response) {
          if (!response) {
            swal("App in Maintenance", "Favor de reportar!", "warning");
          } else {
            vm.hollidaysList = response;
          }
        }, function errorCallback(response) {
          Materialize.toast('Falla de conexión', 1000);
        });
    }


    vm.getServicesHoursByDay = () => {
      var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
      DataServiceServer.getServicesHoursByDay(aux[0], aux[1], vm.day)
        .then(function successCallback(response) {
          console.log(response);
          
          if (!response) {
            swal("App in Maintenance", "Favor de reportar!", "warning");
          } else {
            vm.horarios = response;
          }
        }, function errorCallback(response) {
          Materialize.toast('Falla de conexión', 1000);
        });
    }
    

    vm.init = () => {
      vm.getdays();
      vm.getServicesHollidaysAdmin();
      vm.getServicesHoursByDay();
    }
    vm.day = $filter('date')(new Date(), "yyyy-MM-dd");
    vm.init();


  }
})();

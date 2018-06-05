// controlador de checkInController
"use strict";
(function () {
  var app = angular.module('app');
  app.controller("passController", passController);

  passController.$inject = [
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

  function passController(
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
    vm.pass;
    vm.pass1;
    vm.pass2;
    var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
    vm.cambiar = () => {
      DataServiceServer.getChangePass(aux[0], aux[1], vm.pass, vm.pass1, response => {
        if (response.success == -9) {
          swal("App in Maintenance", "Favor de reportar!", "warning");
        } else if (response.success) {
              swal("Contraseña cambiada", "Contraseña cambiada!", "success");
              vm.pass = ""; vm.pass1 = "";vm.pass2 = "";
          } else {
              swal("Contraseña incorrecta", "Contraseña incorrecta", "warning");
          }
      });
    }
  }
})();

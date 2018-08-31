"use strict";
(function () {
  var app = angular.module('app');
  app.controller("pushController", pushController);

  pushController.$inject = [
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
    'AuthenticationService'
  ];

  function pushController(
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
    AuthenticationService
  ) {

    var vm = this;
    vm.title = 'Push Notification';
    vm.listaUsers = [];
    vm.obj = {};

    vm.sendMessage = () => {
      swal({
        title: '¿ Estás seguro ?',
        text: `¡ Se mandará la notificación !`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#C0C0C0',
        cancelButtonColor: '#FF3800',
        cancelarButtonText: 'Cancelar',
        showCloseButton: true,
        confirmButtonText: `Si, enviar`,
        focusConfirm: false
      }).then((result) => {
        if (result.value) {
          var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
          vm.obj.id_user = aux[0];
          vm.obj.token = aux[1];
          vm.obj.id_users = [];
          vm.obj.all = vm.sendAll;
          if (!vm.obj.all) {
            vm.listaUsers.forEach(user => {
              if (user.send) vm.obj.id_users.push(user.id_user);
            });
          }
          DataServiceServer.sendPushNotification(vm.obj)
            .then(function successCallback(response) {
              if (response == undefined) {
                Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                AuthenticationService.ClearCredentials();
                DataService.Delete();
                $location.path("/login");
                return;
              }
              vm.obj = {};
              Materialize.toast('Notificación enviada', 5000);
              vm.sendAll = true;
              vm.getAllUsers();
            }, function errorCallback(response) {
              Materialize.toast('Falla de conexión', 1000);
            });
        }
      })
    }

    vm.sendAllF = () => {
      vm.sendAll = !vm.sendAll;
      vm.listaUsers.forEach(user => {
        user.send = vm.sendAll ? true : false;
      });
    }

    vm.sendAll = true;
    vm.send = function (item) {
      item.send = !item.send;
      vm.listaUsers.forEach(user => { vm.sendAll = item.send ? vm.sendAll : false; });
    }

    vm.getAllUsers = () => {
      var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
      DataServiceServer.getAllUsers(aux[0], aux[1])
        .then(function successCallback(response) {
          if (response == undefined) {
            Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
            AuthenticationService.ClearCredentials();
            DataService.Delete();
            $location.path("/login");
            return;
          }
          vm.listaUsers = response.users;
          vm.listaUsers.forEach(element => {
            element.send = true;
          });
        }, function errorCallback(response) {
          Materialize.toast('Falla de conexión', 1000);
        });
    }
    (function () {
      vm.getAllUsers();
    })();
  }
})();

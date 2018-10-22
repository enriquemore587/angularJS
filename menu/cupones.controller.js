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
    '$timeout',
    'AuthenticationService'
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
    $timeout,
    AuthenticationService
  ) {
    var vm = this;
    vm.title = 'CUPONES';
    vm.cuponesList = [];
    vm.verTodosCupones = false;
    vm.cuponToSave = {};
    vm.typeServices = [{
      value: 1,
      name: 'Transportation Service'
    }, {
      value: 2,
      name: 'Mobile Service'
    }, {
      value: 3,
      name: 'Weeken rides'
    }];

    vm.saveCupon = () => {
      let aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
      vm.cuponToSave.id_user = aux[0];
      vm.cuponToSave.token = aux[1];
      vm.cuponToSave.cost_des = vm.cuponToSave.percentage_des;

      DataServiceServer.sendCupon(vm.cuponToSave)
        .then(function successCallback(cupones) {
          if (cupones.data.status == -3) {
            Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
            AuthenticationService.ClearCredentials();
            DataService.Delete();
            $location.path("/login");
            return;
          }
          vm.cuponToSave = {};
          if (cupones.data.message == "Codigo Existente") console.log("Codigo Existente");
          Materialize.toast('Cupón guardado', 4000);
          vm.initComponents();
        }, function errorCallback(response) {
          Materialize.toast('Falla de conexión', 1000);
        });

    }

    vm.getTypeService = typeService => {
      if (typeService == 1) return 'Transportation Service';
      if (typeService == 2) return 'Mobile Service';
      if (typeService == 3) return 'Weeken rides';
      if (typeService == 4) return 'Weekend Packages';
      return 'typeService';
    }

    vm.getTypeCupon = (type, porcent, costDes) => {
      if (type == 1) return `${porcent} %`;
      return `$ ${costDes}`;
    }



    vm.editCupon = elemetToEdit => vm.cuponToSave = elemetToEdit;

        vm.deleteCupon = (cuponToDelete, index) => {
          swal({
            title: '¿ Estás seguro ?',
            text: `¡ Se pausará ${cuponToDelete.code} !`,
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#C0C0C0',
            cancelButtonColor: '#FF3800',
            cancelarButtonText: 'Cancelar',
            showCloseButton: true,
            confirmButtonText: `Si, pausar`,
            focusConfirm: false
          }).then((result) => {
            if (result.value) {
              var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
              var temporalCupon = {
                id_user : aux[0],
                token : aux[1],
                id_code : cuponToDelete.id_code,
                active : false
              };
              DataServiceServer.sendCuponActive(temporalCupon)
                .then(function successCallback(response) {
                  if (response == undefined) {
                    Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                    AuthenticationService.ClearCredentials();
                    DataService.Delete();
                    $location.path("/login");
                    return;
                  }
                  cuponToDelete.active = !cuponToDelete.active;
                  vm.cuponesList = [
                    ...vm.cuponesList.slice(0, index),
                    cuponToDelete,
                    ...vm.cuponesList.slice(index+1)
                  ];
                  //vm.cuponesList[temporalIndex].active = !vm.cuponesList[temporalIndex].active;
                  Materialize.toast('Cupón pausado', 5000);
                }, function errorCallback(response) {
                  Materialize.toast('Falla de conexión', 1000);
                });
            }
          })
        }
            vm.upCupon = (cuponToUp, index) => {
              swal({
                title: '¿ Estás seguro ?',
                text: `¡ Se habilitará ${cuponToUp.code} !`,
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#C0C0C0',
                cancelButtonColor: '#FF3800',
                cancelarButtonText: 'Cancelar',
                showCloseButton: true,
                confirmButtonText: `Si, habilitar`,
                focusConfirm: false
              }).then((result) => {
                if (result.value) {
                  var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
                  var temporalCupon = {
                    id_user : aux[0],
                    token : aux[1],
                    id_code : cuponToUp.id_code,
                    active : true
                  };
                  DataServiceServer.sendCuponActive(temporalCupon)
                    .then(function successCallback(response) {
                      if (response == undefined) {
                        Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                        AuthenticationService.ClearCredentials();
                        DataService.Delete();
                        $location.path("/login");
                        return;
                      }
                      cuponToUp.active = !cuponToUp.active;
                      vm.cuponesList = [
                        ...vm.cuponesList.slice(0, index),
                        cuponToUp,
                        ...vm.cuponesList.slice(index+1)
                      ];
                      Materialize.toast('Cupón habilitado', 5000);
                    }, function errorCallback(response) {
                      Materialize.toast('Falla de conexión', 1000);
                    });
                }
              })
            }

    vm.cancel = () => {
      vm.cuponToSave = {
        id_user: '',
        token: '',
        type_service: 0,
        id_code: 0,
        code: '',
        start_date: '',
        end_date: '',
        amount_use: 0,
        type_code: "2",
        percentage_des: 0,
        cost_des: 0
      };
    }

    vm.initComponents = () => {
      let aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
      DataServiceServer.getCodeList(aux[0], aux[1])
        .then(function successCallback(cupones) {
          if (cupones == -3) {
            Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
            $location.path("/login");
            return;
          }
          vm.cuponesList = cupones.promotional;
          console.log(vm.cuponesList);


        }, function errorCallback(response) {
          Materialize.toast('Falla de conexión', 1000);
        });
      // vm.cuponToSave = {
      //   id_user: '',
      //   token: '',
      //   type_service: 0,
      //   id_code: 0,
      //   code: '',
      //   start_date: '',
      //   end_date: '',
      //   amount_use: 0,
      //   type_code: 2,
      //   percentage_des: 0,
      //   cost_des: 0
      // };
    }
    (vm.initComponents());
  }
})();

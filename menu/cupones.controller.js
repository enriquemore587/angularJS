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
    vm.cuponesList = [];
    vm.cuponToSave = {};
    vm.typeServices = [{
      value: 1,
      name: 'Weeken rides'
    }, {
      value: 2,
      name: 'Mobile Service'
    }, {
      value: 3,
      name: 'Weeken rides'
    }];
    console.log(vm.typeServices);


    vm.saveCupon = () => {
      let aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
      vm.cuponToSave.id_user = aux[0];
      vm.cuponToSave.token = aux[1];
      vm.cuponToSave.cost_des = vm.cuponToSave.percentage_des;
      console.log(vm.cuponToSave);

      DataServiceServer.sendCupon(vm.cuponToSave)
        .then(function successCallback(cupones) {
          if (cupones.data.status == -3) {
            Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
            $location.path("/login");
            return;
          }
          console.log('cupones.data.status', cupones.data.status);
          if (cupones.data.message == "Codigo Existente") console.log("Codigo Existente");
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
          if (cupones.status == -3) {
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

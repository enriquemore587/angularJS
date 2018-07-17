////////// controlador de pagosPController

(function () {
  "use strict";
  var app = angular.module('app');
  app.controller("pagosPController", pagosPController);

  pagosPController.$inject = [
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
    '$filter'
  ];

  function pagosPController(
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
    $filter
  ) {
    var vm = this;
    vm.esperar = true;
    vm.itemFecha;
    vm.id = vm.eventSelected = $rootScope.globals.id.id_package;
    vm.nombrePaquete = $rootScope.globals.id.name_package;

    vm.data = null;
    vm.bike = null;
    (function () {
      initComponents();
    })();
    function initComponents() {
      vm.pago = {
        "id_user": null,
        "token": null,
        "id_payment": 0,
        "id_user_service": null,
        "type_service": 2,
        "id_service": null,
        "amount": null,
        "reference_number": null,
        'payment_type': null
      };
      vm.comentarios = "";
      vm.calificacion = "";
      vm.fecha = '';
      vm.hora = '';
      getPagosP();
      vm.opcion = 0;
      $(document).ready(function () {
        $('select').material_select();
        $('.modal').modal({
          dismissible: false,
          opacity: .5,
          inDuration: 300,
          outDuration: 200,
          startingTop: '4%',
          endingTop: '10%',
          ready: function (modal, trigger) {
          },
          complete: function () { }
        }
        );
        $('.datepicker').pickadate({
          selectMonths: true,
          selectYears: 15,
          today: 'Hoy',
          clear: 'Limpiar',
          close: 'Ok',
          format: 'mm/dd/yyyy',
          closeOnSelect: false
        });
      });
    }

    vm.pago = {
      "id_user": null,
      "token": null,
      "id_payment": 0,
      "id_user_service": null,
      "type_service": 2,
      "id_service": null,
      "amount": null,
      "reference_number": null,
      'payment_type': null
    };

    vm.opcion = 0;
    vm.objConfirm = {
      "id_user": '',
      "token": '',
      "id_service": 0,
      "service_date": 0
    };


    vm.hora = "";
    vm.dia = "";
    vm.confirmo = function () {
      var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
      vm.objConfirm['id_user'] = aux[0];
      vm.objConfirm['token'] = aux[1];
      vm.objConfirm['id_service'] = vm.itemFecha.id_service;
      vm.objConfirm.service_date = new Date(vm.itemFecha.service_date).getTime()-25200000;
      vm.esperar = true;
      DataServiceServer.confirmar(vm.objConfirm).then(function successCallback(response) {
        initComponents();
        vm.esperar = false;
        Materialize.toast('CONFIRMADO', 4000);
      }, function errorCallback(response) {
        vm.esperar = false;
        Materialize.toast('Datos incompletos!!!', 4000);
      });
    };

    vm.objConfirmEdit = {
      "id_user": '',
      "token": '',
      "id_service": 0,
      "service_date": 0
    };

    vm.editarFecha = function () {
      if (vm.dia != "") {
        if (vm.hora != "" && String(vm.hora).length == 5) {
          var vari = vm.dia + " " + vm.hora + ":00";
          var dt = new Date(vari).getTime();
          var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
          vm.objConfirmEdit['id_user'] = aux[0];
          vm.objConfirmEdit['token'] = aux[1];
          vm.objConfirmEdit['id_service'] = vm.itemEdit.id_service;
          vm.objConfirmEdit['service_date'] = dt-25200000;

          vm.esperar = true;
          DataServiceServer.confirmar(vm.objConfirmEdit).then(function successCallback(response) {
            initComponents();
            Materialize.toast('FECHA MODIFICADA', 4000);
            vm.esperar = false;
          }, function errorCallback(response) {
            vm.esperar = false;
            Materialize.toast('error con la conexion!!!', 4000);
          });
        } else {
          Materialize.toast('Error en la conexion !', 4000);
        }
      }
      else {
        Materialize.toast('No se ha especificado el día!', 4000);
      }

    }

    vm.confirmarr = function () {
      if (vm.dia != "") {
        if (vm.hora != "" && String(vm.hora).length == 5) {
          var vari = vm.dia + "T" + vm.hora + ":12Z";
          var dt = new Date(vari).getTime();

          var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
          vm.objConfirm['id_user'] = aux[0];
          vm.objConfirm['token'] = aux[1];
          vm.objConfirm['id_service'] = vm.id_service;
          vm.objConfirm['service_date'] = dt;
          vm.esperar = true;
          DataServiceServer.confirmar(vm.objConfirm).then(function successCallback(response) {

            initComponents();
            vm.esperar = false;
            Materialize.toast('CONFIRMADO', 4000);
          }, function errorCallback(response) {
            vm.esperar = false;
            Materialize.toast('error con la conexion!!!', 4000);
          });
          vm.dia = "";
          vm.hora = "";
        } else {

          Materialize.toast('No se ha especificado la hora correctamente!', 4000);
        }
      }
      else {
        Materialize.toast('No se ha especificado el día!', 4000);
      }

    };


    vm.opcion = 0;
    vm.send = send;
    function send() {

      var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
      vm.pago['id_service'] = vm.temp.id_service;
      vm.pago['id_user'] = aux[0];
      vm.pago['token'] = aux[1];
      vm.pago['id_user_service'] = vm.temp.id_user_service;
      vm.pago['payment_type'] = vm.opcion;

      vm.esperar = true;
      DataServiceServer.payments(vm.pago)
        .then(function successCallback(response) {
          if (response.data.message == "successful") {
            Materialize.toast('GUARDADO', 4000);
            initComponents();

          } else if (response.data.message == "Pago ya registrado") {
            Materialize.toast('Este pago ya fue registrado', 4000);
          } else {
            Materialize.toast("Respuesta: \n " + response.data.message, 4000);
          }

          vm.esperar = false;
        }, function errorCallback(response) {
          vm.esperar = false;
          Materialize.toast('Falla de conexión', 4000);
        });
    }

    function getPagosP() {
      vm.data = [];
      var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
      vm.esperar = true;
      DataServiceServer.getPagosP(aux[0], aux[1])
        .then(function successCallback(response) {
          response.DataUsersReservationPaidPackages.forEach(element => {
            if (element.id_package == vm.id) {
              element.service_date = $filter('date')(element.service_date, "MM/dd/yyyy HH:mm:ss");
              vm.data.push(element);
            }
          });
          vm.esperar = false;
        }, function errorCallback(response) {
          vm.esperar = false;
          Materialize.toast('Falla de conexión', 4000);
        });
    }

    vm.setImage = function(item){
      if (item.bike == null) {
        Materialize.toast('NO HAY BICI REGISTRADA !!!', 4000);
        return;
      }

      vm.objCI = {
        photo_front_bike: item.bike.photo_front_bike,
        photo_side_bike: item.bike.photo_side_bike,
        photo_serial_num: item.bike.photo_serial_num,
        year_production: item.bike.year_production,
        des_type_bike: item.bike.des_type_bike,
        des_pedal_bike: item.bike.des_pedal_bike,
        model_bike: item.bike.model_bike,
        color_bike: item.bike.color_bike,
        des_component_bike: item.bike.des_component_bike,
        group_model_bike: item.bike.group_model_bike,
        brand_bikes: item.bike.brand_bike
      };
      $('#modal_bike').modal('open');
    };

    vm.comentarios = "";
    vm.calificacion = "";
    vm.Term = {
      "id_user": null,
      "token": null,
      "id_service": null,
      "comments": null,
      "ranking": null
    };

    vm.realizado = function (item) {
      var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");

      vm.Term['id_user'] = aux[0];
      vm.Term['token'] = aux[1];
      vm.Term['comments'] = vm.comentarios;
      vm.Term['ranking'] = vm.calificacion;

      vm.esperar = true;
      DataServiceServer.packageComplete(vm.Term).then(function successCallback(response) {
        initComponents();

        vm.esperar = false;
        Materialize.toast('COMPLETADO', 4000);
      }, function errorCallback(response) {
        vm.esperar = false;
        Materialize.toast('error con la conexion!!!', 4000);
      });
    };
  }
})();

// controlador de pagosController
(function () {
  "use strict";
  var app = angular.module('app');
  app.controller("pagosController", pagosController);

  pagosController.$inject = [
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

  function pagosController(
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
    vm.esperar = false;
    vm.id = $rootScope.globals.id.id_event;
    vm.nombreEvento = $rootScope.globals.id.nameEvent;

    vm.data = [];
    vm.allData = null;

    (function () {
      initComponents();

      $('.modal').modal({
        dismissible: false, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        inDuration: 300, // Transition in duration
        outDuration: 200, // Transition out duration
        startingTop: '4%', // Starting top style attribute
        endingTop: '10%', // Ending top style attribute
        ready: function (modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
        },
        complete: function () { } // Callback for Modal close
      }
      );
    })();
    function getPagos() {
      vm.data = [];
      var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
      vm.esperar = true;
      DataServiceServer.getPagos(aux[0], aux[1], vm.id)
        .then(function successCallback(response) {
          vm.allData = response;

          response.data.data.DataUsersReservationPaidEvents.forEach(element => {
            vm.data.push(element);
          });
          $(document).ready(function () {
            $('select').material_select();
          });
        }, function errorCallback(response) {
          Materialize.toast('Error en la conexion !', 4000);
        });
    }
    vm.edit = edit;
    function edit(item) {
      vm.obj['id_payment'] = item.id_payment;
      vm.obj['id_user_service'] = item.id_user_service;
      vm.obj['id_service'] = item.id_service;
      vm.obj['amount'] = item.amount;
      vm.obj['reference_number'] = item.reference_number;
      vm.obj['payment_type'] = item.payment_type;
      $(document).ready(function () {
        $('select').material_select();
      });
    }
    vm.pagosOpc = [
      {id:3, name: "Efectivo"},
      {id:2, name: "Transferencia Bancaria o Deposito Bancario"}
    ];

    vm.obj = {
      "id_user": null,
      "token": null,
      "id_payment": 0,
      "id_user_service": null,
      "type_service": 1,
      "id_service": null,
      "amount": null,
      "reference_number": null,
      'payment_type': null
    };
    vm.opcion = 0;

    function initComponents(params) {
      getPagos();
      vm.obj = {
        "id_user": null,
        "token": null,
        "id_payment": 0,
        "id_user_service": null,
        "type_service": 1,
        "id_service": null,
        "amount": null,
        "reference_number": null,
        'payment_type': null
      };
      vm.opcion = 0;

      vm.esperar = false;
    }

    vm.asignarPago = function(item){
        vm.obj['amount'] = item.status == 2 ? (item.cost_event / 2): item.cost_event;
        vm.obj['id_user_service'] = item.id_user_service;
        vm.obj['id_service'] = item.id_service;
    }

    vm.saveUpdate = function () {
        var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");


        vm.obj['id_user'] = aux[0];
        vm.obj['token'] = aux[1];
        vm.esperar = true;
        DataServiceServer.pagos(vm.obj)
          .then(function successCallback(response) {
            initComponents();
            Materialize.toast('GUARDADO', 4000);
          }, function errorCallback(response) {
            vm.esperar = false;
            Materialize.toast('Error en la conexion !', 4000);
          });
    };
  }
})();

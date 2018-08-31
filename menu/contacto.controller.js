// controlador de checkInController
"use strict";
(function () {
  var app = angular.module('app');
  app.controller("contactController", contactController);

  contactController.$inject = [
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

  function contactController(
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

    vm.obj = {};
    vm.cat = [];

    vm.editarContacto = (x) => {
      vm.obj.id_contact = x.id;
      vm.obj.id_type_contact = x.id_type_contact;
      vm.obj.description = x.description;
      let template;
      let type;
      let opc;
      switch (vm.obj.id_type_contact) {
        case 1:
          template = '<input placeholder="Description" ng-model="vm.obj.description" type="text" class="validate">';
          opc = 'Teléfono';
          type = 'tel';
          break;
        case 2:
          template = '<input placeholder="Description" ng-model="vm.obj.description" type="text" class="validate">';
          opc = 'WhatsApp';
          type = 'tel';
          break;
        case 3:
          template = '<input placeholder="Description" ng-model="vm.obj.description" type="text" class="validate">';
          opc = 'Email';
          type = 'email';
          break;
        case 4:
          template = '<input placeholder="Description" ng-model="vm.obj.description" type="text" class="validate">';
          opc = 'Instagram';
          type = 'text';
          break;
        case 5:
          template = '<input placeholder="Description" ng-model="vm.obj.description" type="text" class="validate">';
          opc = 'Facebook';
          type = 'text';
          break;
        case 6:
          template = '<input placeholder="Description" ng-model="vm.obj.description" type="text" class="validate">';
          opc = 'WebSite';
          type = 'text';
          break;
      }
      swal({
        title: opc,
        input: type,
        inputValue: vm.obj.description,
        showCancelButton: true,
        confirmButtonText: 'Submit',
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#FF3800',
        confirmButtonColor: '#C0C0C0',
        showLoaderOnConfirm: true,
        preConfirm: (data) => {

        },
        allowOutsideClick: () => !swal.isLoading()
      }).then((result) => {
        if (result.value) {
          vm.obj.description = result.value;
          var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
          vm.obj.id_user = aux[0];
          vm.obj.token = aux[1];
          DataServiceServer.saveUpdatecontacto(vm.obj)
            .then(function successCallback(response) {
              if (response.data.message == "successful") {
                //Materialize.toast('REGISTRO GUARDADO EXITOSAMENTE', 4000);

                initParams();
                //x.description = result.value;
                swal({
                  type: 'success',
                  title: 'Contact updated',
                  html: opc + ': ' + result.value
                })
              } else {
                Materialize.toast('REGISTRO NO EXITOSO', 5000);
              }
            }, function errorCallback(response) {
              Materialize.toast('No se pudo conectar con el server', 4000);
            });
        }
      });
    };

    function initParams() {
      vm.contact = [];
      vm.obj = {};
      DataServiceServer.contact().then(function (response) {
        if (response == -3) {
          Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
          AuthenticationService.ClearCredentials();
          DataService.Delete();
          $location.path("/login");
          return;
        }
        vm.contact = response.contact;
      }, function errorCallback(response) {
        Materialize.toast('ERROR POR CONEXION', 4000);
      });
    }
    vm.saveUpdateContacto = function () {
      var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
      vm.obj.id_user = aux[0];
      vm.obj.token = aux[1];
      DataServiceServer.saveUpdatecontacto(vm.obj)
        .then(function successCallback(response) {
          if (response.data.message == "successful") {
            initParams();
            Materialize.toast('REGISTRO GUARDADO EXITOSAMENTE', 4000);
          } else {
            Materialize.toast('NO GUARDADO, VERIFICAR CONEXIÓN', 4000);
          }
        }, function errorCallback(response) {
          Materialize.toast('No se pudo conectar con el server', 4000);
        });
    };
    $(document).ready(function () {
      $('select').material_select();
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
    });
    initParams();
  }
})();

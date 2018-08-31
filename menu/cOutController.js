
(function () {
  "use strict";
  var app = angular.module('app');
  app.controller("checkOutController2", checkOutController2);

  checkOutController2.$inject = [
    "$rootScope",
    "$interval",
    "DataService",
    "DataServiceServer",
    "$sce",
    "$parse",
    '$location',
    '$routeParams',
    'AuthenticationService'
  ];

  function checkOutController2(
    $rootScope,
    $interval,
    DataService,
    DataServiceServer,
    $sce,
    $parse,
    $location,
    $routeParams,
    AuthenticationService
  ) {
    var vm = this;
    vm.eventSelected = $rootScope.globals.id;
    vm.nombreEvento = $rootScope.globals.id.nameEvent;
    vm.eventColaction = null;
    vm.opts = null;
    vm.ver = false;

    vm.usuarios = [];

    vm.objCI = {};
    vm.selectUsuario = function (user) {
      try {
        vm.objCI = user.collectionsPoints[0].collection_points_in[0];
        vm.ver = true;
      }
      catch (err) {
        Materialize.toast('EL USUARIO NO TIENE UN CHECK IN REGISTRADO', 4000);
      }
      vm.idUsuario = user.id;
    }

    vm.goToEvents = function () {
      $location.path('/');
    };

    vm.formChecOut = formChecOut;
    function formChecOut() {
      var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
      vm.obj =
        {
          "token": aux[1],
          "id_user": aux[0],
          "id_event": vm.eventSelected.id_event,
          "id_user_check": vm.idUsuario,
          "id_eventcollection": vm.eventColaction,
          "id_check_in": vm.objCI.id_collpoint
        };
      DataServiceServer.checkOut(vm.obj)
        .then(function successCallback(response) {
          getCheckOut();
          vm.ver = false;
          vm.objCI = {};
          if (response.status == -3) {
            Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
            AuthenticationService.ClearCredentials();
            DataService.Delete();
            $location.path("/login");
            return;
          }
          if (response.data.message == "successful") {
            Materialize.toast('REGISTRO GUARDADO EXITOSAMENTE', 4000);
            vm.eventColaction = null;
          } else {
            Materialize.toast('NO GUARDADO, VERIFICAR CONEXIÓN', 4000);
          }
        }, function errorCallback(response) {
          Materialize.toast('No se pudo conectar con el server', 4000);
        });
    }

    (function initController() {
      getCheckOut();
      vm.objCI = {
        "id_collpoint": null,
        "address": null,
        "year_production": null,
        "des_type_bike": null,
        "des_pedal_bike": null,
        "model_bike": null,
        "color_bike": null,
        "serial_number_bike": null,
        "des_component_bike": null,
        "group_model_bike": null,
        "brand_bike": null,
        "wheel_bike": null,
        "tire_bike": null,
        "photo_front_bike": null,
        "photo_side_bike": null,
        "photo_serial_num": null,
        "amount": null
      };

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


    vm.cIn = [];
    function getCheckOut() {
      vm.usuarios = [];
      var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
      DataServiceServer.getCheckOut(aux[0], aux[1], vm.eventSelected.id_event)
        .then(function successCallback(response) {
          var bandera = true;
          response.data.data.users.forEach(element => {
            vm.usuarios.push(
              {
                'name': element.user_name,
                'id': element.id_user,
                'collectionsPoints': element.collection_points,
                'mail': element.mail,
                'phone': element.phone
              }
            );
          });
          $(document).ready(function () {
            $('select').material_select();
          });
        }, function errorCallback(response) {
          Materialize.toast('No se pudo conectar con el server', 4000);
        });
    }
  }
})();

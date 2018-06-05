// controlador de checkInController
(function() {
  "use strict";
  var app = angular.module('app');
  app.controller("checkInController", checkInController);

  checkInController.$inject = [
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

  function checkInController(
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
    vm.esperar = false;
    vm.objCheckIn = {
      "id_bike": null,
      "year_production": null,
      "id_type_bike": null,
      "des_type_bike": null,
      "id_pedal_bike": 1000,
      "des_pedal_bike": null,
      "model_bike": null,
      "color_bike": null,
      "serial_number_bike": null,
      "id_component_bike": null,
      "des_component_bike": null,
      "group_model_bike": null,
      "brand_bike": null,
      "wheel_bike": null,
      "tire_bike": null,
      "photo_front_bike": null,
      "photo_side_bike": null,
      "photo_serial_num": null,
      "status": null,
      "amount": null
    };

    vm.id = $rootScope.globals.id.id_event;
    vm.nombreEvento = $rootScope.globals.id.nameEvent;

    vm.places = [];
    vm.ver = false;
    vm.id_checkin = -1;

    vm.selectUsuario = selectUsuario;
    vm.idUsuarioCheck;

    function selectUsuario(id) {

      vm.places = [];
      vm.allData.forEach(element => {

        if (element.id_user == id) {
          vm.selectUsuarioo = id;
          element.collection_points.forEach(element2 => {

            vm.places.push({
              'direccion': element2.address,
              'id': element2.id_collpoint
            });
            $(document).ready(function() {
              $('select').material_select();
            });
          });
          vm.objCheckIn = element.bike;
          vm.thumbnail1.dataUrl = vm.objCheckIn.photo_front_bike;
          vm.thumbnail2.dataUrl = vm.objCheckIn.photo_side_bike;
          vm.thumbnail3.dataUrl = vm.objCheckIn.photo_serial_num;
        }
      });
      vm.ver = true;
    }

    vm.send = true;
    vm.formChecIn = function() {
      if (vm.id_checkin == -1 || vm.id_checkin == undefined) {
        Materialize.toast('SELECCIONAR UN PUNTO DE RECOLECCIÓN VALIDO !', 4000);
        return;
      }
      var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");

      vm.obj = {
        "token": aux[1],
        "id_user": aux[0],
        "id_checkin": 0,
        "id_event": vm.id,
        "id_user_check": vm.selectUsuarioo,
        "id_eventcollection": vm.id_checkin,
        "year_production": vm.objCheckIn.year_production,
        "des_type_bike": vm.objCheckIn.des_type_bike,
        "des_pedal_bike": vm.objCheckIn.des_pedal_bike,
        "model_bike": vm.objCheckIn.model_bike,
        "color_bike": vm.objCheckIn.color_bike,
        "serial_number_bike": vm.objCheckIn.serial_number_bike,
        "des_component_bike": vm.objCheckIn.des_component_bike,
        "group_model_bike": vm.objCheckIn.group_model_bike,
        "brand_bike": vm.objCheckIn.brand_bike,
        "wheel_bike": vm.objCheckIn.wheel_bike,
        "tire_bike": vm.objCheckIn.tire_bike,
        "photo_front_bike": vm.objCheckIn.photo_front_bike,
        "photo_side_bike": vm.objCheckIn.photo_side_bike,
        "photo_serial_num": vm.objCheckIn.photo_serial_num,
        "amount": vm.objCheckIn.amount
      };

      vm.esperar = true;
      DataServiceServer.checkIn(vm.obj)
        .then(function successCallback(response) {
          initComponents();
          vm.id_checkin = -1;
          if (parseInt(response.data.status) == -1) {
            Materialize.toast('NO SE PUEDE RECOLECTAR SIN ANTES HABER ENTREGADO, POR FAVOR REGISTRE LA ENTREGA !!', 6000);
            return;
          }
          Materialize.toast('REGISTRO GUARDADO !!', 4000);
          vm.esperar = false;
        }, function errorCallback(response) {
          vm.esperar = false;
          Materialize.toast('Error en la conexion !', 4000);
        });
      vm.ver = false;
    };

    function convertImgToBase64(url, callback, outputFormat) {
      var img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function() {
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        canvas.height = this.height;
        canvas.width = this.width;
        ctx.drawImage(this, 0, 0);
        var dataURL = canvas.toDataURL(outputFormat || 'image/png');
        callback(dataURL);
        canvas = null;
      };
      img.src = url;
    }

    function initComponents(params) {
      getCheckIn();
      vm.places = [];
      var val = "";
      $('.modal').modal({
        dismissible: false, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        inDuration: 300, // Transition in duration
        outDuration: 200, // Transition out duration
        startingTop: '4%', // Starting top style attribute
        endingTop: '10%', // Ending top style attribute
        ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
        },
        complete: function() {} // Callback for Modal close
      });
      vm.thumbnail1 = {
        dataUrl: val
      };
      vm.thumbnail2 = {
        dataUrl: val
      };
      vm.thumbnail3 = {
        dataUrl: val
      };
      vm.thumbnail4 = {
        dataUrl: val
      };
    }
    vm.allData;
    vm.data = [];
    (function initController() {
      initComponents();
    })();

    function getCheckIn() {
      vm.data = [];
      var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");

      vm.esperar = true;
      DataServiceServer.getCheckIn(aux[0], aux[1], vm.id)
        .then(function successCallback(response) {
          vm.allData = response.data.data.users;
          response.data.data.users.forEach(element => {
            vm.data.push({
              'name': element.user_name,
              'id': element.id_user,
              'mail': element.mail,
              'phone': element.phone
            });
          });
          $('select').material_select();
          vm.esperar = false;
        }, function errorCallback(response) {
          Materialize.toast('ERROR EN POR CONEXION', 4000);
          vm.esperar = false;
        });
    }


    $scope.fileReaderSupported = window.FileReader != null;
    $scope.photoChanged = function(files, num) {
      if (files != null) {
        var file = files[0];
        if ($scope.fileReaderSupported && file.type.indexOf('image') > -1) {
          $timeout(function() {
            var fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = function(e) {
              $timeout(function() {
                if (num == 1) {
                  vm.thumbnail1.dataUrl = e.target.result;
                } else
                if (num == 2) {
                  vm.thumbnail2.dataUrl = e.target.result;
                } else
                if (num == 3) {
                  vm.thumbnail3.dataUrl = e.target.result;
                } else
                if (num == 4) {
                  vm.thumbnail4.dataUrl = e.target.result;
                }
              });
            }
          });
        }
      }
    };
  }
})();

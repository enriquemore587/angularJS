(function () {
  "use strict";
  var app = angular.module('app');
  app.controller("weekendController", weekendController);
  weekendController.$inject = [
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

  function weekendController(
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
    vm.verTodosWeek = false;
    vm.mapWeek;
    vm.verUser = item => {
      vm.mapWeek.setCenter({ lat: parseFloat(item.l.split(",")[0]), lng: parseFloat(item.l.split(",")[1]) });
      vm.mapWeek.setZoom(20);
    }

    vm.deleteWeekend = (week, hab) => {
      let msg = hab ? 'habilitará' : 'eliminará';
      let msg2 = hab ? 'habilitar' : 'eliminar';
      let msg3 = hab ? 'Habilitado' : 'Eliminado';
      swal({
        title: '¿ Estás seguro ?',
        text: `Se ${msg} ${week.name}`,
        type: 'warning',

        confirmButtonColor: '#C0C0C0',
        cancelButtonColor: '#FF3800',
        cancelarButtonText: 'Cancelar',
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonText: `Si, ${msg2}!`,
        focusConfirm: false
      }).then((result) => {
        if (result.value) {
          var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
          DataServiceServer.desableWeek({
            "id_user": aux[0],
            "token": aux[1],
            "id_weekend": week.id_weekend,
            "active": hab
          }).then(function (response) {
            swal(
              `${msg3} !`,
              `Se ha ${msg3}  ${week.name}`,
              'success'
            )
            vm.getWeek();
          });
        }
      })
    }

    vm.mapWeek = new google.maps.Map(document.getElementById('mapWeek'), {
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: { lat: 19.3906845, lng: -99.1624569 },
      zoom: 8
    });

    vm.camioneta = new google.maps.Marker({
      map: vm.mapWeek,
      title: 'CAMIONETA',
      icon: "menu\\camioneta.png"
    });

    function getMyPosition() {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            vm.camioneta.setPosition(pos);
          }, function (er) { //ERROR DE GEOLOCALIZACION
            Materialize.toast("ERROR DE GEOLOCALIZACION"+er.message, 2200);
          });
        } else {
          console.log("else => navigator.geolocation");
        }
      } catch (error) {
        console.log("No position");
      }
    }

    vm.centrar = x => {
      var limites = new google.maps.LatLngBounds();
      if (vm.participantes.length != 0) {
        for (let i = vm.participantes.length - 1; i >= 0; i--) {
          limites.extend(vm.participantes[i].tag.position);
        }
      }
      try {
        limites.extend(vm.camioneta.position);
        vm.mapWeek.fitBounds(limites);
      } catch (error) {
        console.log("no hay ubicacion Camioneta");
      }
    }

    vm.id_weekend = 0;
    vm.weekObj = {
      "id_weekend": 0,
      "name": null,
      "place": null,
      "date": null,
      "description": null,
      "amount": null,
      "terms": null,
      "percentage_payment": null,
      "user": []
    };
    vm.id_to_update = -1;
    vm.edit = function (objToEdit) {
      vm.weekObj = objToEdit;
      var tiempo = vm.weekObj.date;

      vm.fecha = $filter('date')(tiempo, 'MM/dd/yyyy');
      vm.hora = $filter('date')(tiempo, 'HH:mm');

      var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
      vm.id_to_update = objToEdit.id_weekend;
      DataServiceServer.getWeekById(aux[0], aux[1], objToEdit.id_weekend)
        .then(function successCallback(response) {
          try {
            vm.weekObj.user = response.user;
          } catch (err) {
            Materialize.toast('SIN DATA', 500);
          }
        }, function errorCallback(response) {
          Materialize.toast('Falla de conexión', 4000);
        });
    }
    vm.update_list = () => {
      var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
      DataServiceServer.getWeekById(aux[0], aux[1], vm.id_to_update)
        .then(function successCallback(response) {
          try {
            vm.weekObj.user = response.user;
            Materialize.toast('Updated', 250);
          } catch (err) {
            Materialize.toast('SIN DATA', 500);
          }
        }, function errorCallback(response) {
          Materialize.toast('Falla de conexión', 4000);
        });
    }

    vm.creatingNew = () => { vm.weekObj.amount = 0; vm.new(); }

    vm.new = function () {
      var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
      DataServiceServer.getWeekById(aux[0], aux[1], 0)
        .then(function successCallback(response) {
          try {
            vm.weekObj.user = response.user;
          } catch (err) {
            Materialize.toast('SIN DATA', 500);
          }
        }, function errorCallback(response) {
          Materialize.toast('Falla de conexión', 4000);
        });
    };

    vm.newUsers = [];
    vm.ver = function (item) {
      item.status = item.status == 0 ? 1 : 0;
      item.amount = item.status == 1 ? vm.weekObj.amount : 0;
    };

    vm.weeks = [];
    vm.getWeek = function () {
      var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
      DataServiceServer.getWeek(aux[0], aux[1])
        .then(function successCallback(response) {
          if (response == undefined) {
            Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
            $location.path("/login");
            return;
          }
          try {
            vm.weeks = response.weekend_rides;
          } catch (err) {
            Materialize.toast('SIN DATA', 500);
          }
        }, function errorCallback(response) {
          Materialize.toast('Falla de conexión', 4000);
        });
    };


    vm.save = function () {
      var vari = String(vm.fecha).split("/");
      vm.hora = vm.hora.replace(" AM", "").replace(" PM", "");
      vm.hora = vm.hora.length == 4 ? "0" + vm.hora : vm.hora;
      //var dt = new Date(vari[2] + "-" + vari[0] + "-" + vari[1] + " " + vm.hora + ":12").getTime() - 28800000;

      var dt = new Date(vm.fecha + " " + vm.hora + ":00").getTime() - 25200000;

      vm.weekObj.date = dt;
      var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
      vm.saveWeek = {
        "id_user": aux[0],
        "token": aux[1],
        "id_weekend": vm.weekObj.id_weekend,
        "name": vm.weekObj.name,
        "place": vm.weekObj.place,
        "date": vm.weekObj.date,
        "description": vm.weekObj.description,
        "amount": vm.weekObj.amount,
        "terms": vm.weekObj.terms,
        "id_users": []
      };

      vm.weekObj.user.forEach(element => {
        if (element.status == 1) {
          let temp = [];
          temp.push(element.id_user);
          element.amount = element.amount == "" ? 0 : element.amount;
          temp.push(element.amount);

          vm.saveWeek.id_users.push(temp);
        }
      });

      DataServiceServer.saveWeek(vm.saveWeek)
        .then(function successCallback(response) {
          if (response == -3) {
            Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
            $location.path("/login");
            return;
          }
          Materialize.toast('WEEKEND RIDE GUARDADO CON ÉXITO', 5000);

          initComponents();
          vm.clearData();
        }, function errorCallback(response) {
          Materialize.toast('ERROR POR CONEXION', 4000);
        });

    };

    vm.clearData = function () {
      vm.fecha = "";
      vm.hora = "";
      vm.weekObj = {
        "id_weekend": 0,
        "name": null,
        "place": null,
        "date": null,
        "description": null,
        "amount": null,
        "terms": null,
        "percentage_payment": null,
        "user": []
      };
    };
    vm.ride = {};
    vm.participantes = [];
    vm.alertaParticipantes = [];
    vm.repeat = 0;

    vm.tracking = x => {

      vm.nameTracking = x.name;
      vm.repeat = x.repeat_time;

      vm.ride.active = x.tracking;
      vm.ride.id_weekend = x.id_weekend;
    }

    $("#iniciar").hover(function () {
      $('#ver').css('visibility', 'visible');
    });

    vm.msg;
    vm.confirmacion = false;



    vm.pregCerrarTrack = x => {
      swal({
        title: '¿ Estás seguro ?',
        text: `Parar tracking`,
        type: 'warning',
        confirmButtonColor: '#C0C0C0',
        cancelButtonColor: '#FF3800',
        cancelarButtonText: 'Cancelar',
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonText: 'Si, parar!',
        focusConfirm: false
      }).then((result) => {
        if (result.value) {
          vm.activeTracking();
          vm.confirmacion = false;
        }
      })
    }


    function initComponents() {
      $(document).ready(function () {
        vm.abierto = false;
        $('.collapsible').collapsible();
        $('select').material_select();
        $('.dropdown-button').dropdown({
          inDuration: 300,
          outDuration: 225,
          constrainWidth: false,
          hover: true,
          gutter: 0,
          belowOrigin: false,
          alignment: 'left',
          stopPropagation: false
        });
        $('.modal').modal({
          dismissible: false,
          opacity: .5,
          inDuration: 300,
          outDuration: 200,
          startingTop: '4%',
          endingTop: '10%',
          ready: function (modal, trigger) {
            vm.NOk = false;
            vm.isOk = () => {
              var regex = new RegExp(/((^\d{10}$)|(^\d{2}[-|\s]?\d{2}[-|\s]?\d{2}[-|\s]?\d{2}[-|\s]?\d{2}$))/, 'g');
              if (regex.test(vm.ride.emergency_number)) {
                vm.NOk = true;
              } else {
                vm.NOk = false;
                return false;
              }
            }
            vm.isOk();
            vm.abierto = true;
            vm.esperarTracking = false;

            function alertasF() {
              let flag = {};
              if (vm.alertaParticipantes.length != 0) {

                vm.alertaParticipantes.forEach(elem => {
                  if (elem.ec) {
                    flag.ec = true;
                    /*
                    $('#mec').css('background-color', '#FF3800');
                    $("#mec").addClass("pulse");
                    */
                    $('#mec').css('visibility', 'visible');
                    let sound = document.getElementById("sound");
                    sound.pause();
                    sound.currentTime = 0;
                    sound.play();
                  } else {
                    flag.ec = false;

                    $('#mec').css('visibility', 'hidden');
                  }
                  if (elem.ed) {
                    flag.ed = true;
                    /*
                    $('#med').css('background-color', '#FF3800');
                    $("#med").addClass("pulse");
                    */
                    $('#med').css('visibility', 'visible');
                    let sound = document.getElementById("sound");
                    sound.pause();
                    sound.currentTime = 0;
                    sound.play();
                  } else {
                    flag.ed = false;

                    $('#med').css('visibility', 'hidden');
                  }
                });
              } else {
                flag.ed = false;

                $('#mec').css('visibility', 'hidden');
                flag.ec = false;

                $('#med').css('visibility', 'hidden');
              }
            }

            vm.activeTracking = () => {
              vm.ride.active = !vm.ride.active;
              if (!vm.ride.emergency_number && vm.ride.active) {
                Materialize.toast('Falta número de emergencia', 3000);
                return;
              } else {
                var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
                vm.ride.id_user = aux[0];
                vm.ride.token = aux[1];
                vm.esperarTracking = true;
                                
                DataServiceServer.activeTracking(vm.ride)
                  .then(function successCallback(response) {
                    if (response == -3) {
                      Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                      $location.path("/login");
                      return;
                    }
                    if (vm.ride.active) {
                      Materialize.toast('TRACKING INICIADO', 2000);
                      vm.esperarTracking = false;
                      loadData();
                    } else {
                      let id_weekend = vm.ride.id_weekend;
                      let nn = vm.ride.emergency_number;
                      vm.ride = {};
                      vm.ride.id_weekend = id_weekend;
                      vm.ride.emergency_number = nn;
                      vm.ride.active = false;
                      vm.participantes.forEach(elem => {
                        elem.tag.setMap(null);
                      });
                      vm.participantes = [];
                      vm.alertaParticipantes = [];
                      vm.iterar = 0;
                      vm.esperarTracking = false;
                      /*
                      $('#mec').css('background-color', '#FFFFFF');
                      $('#med').css('background-color', '#FFFFFF');
                      $("#mec").removeClass("pulse");
                      $("#med").removeClass("pulse");
                      */
                      $('#mec').css('visibility', 'hidden');
                      $('#med').css('visibility', 'hidden');
                      Materialize.toast('TRACKING PARADO', 2000);
                    }
                  }, function errorCallback(response) {
                    Materialize.toast('ERROR POR CONEXION', 4000);
                  });
              }
            }

            function loadData() {
              if (vm.abierto && vm.ride.active) {

                getMyPosition();
                vm.iterar++;

                
                let flag = {};

                vm.alertaParticipantes = [];
                vm.participantes.forEach(elem => {
                  try {
                    elem.tag.setMap(null);
                  } catch (e) {
                    console.log('limpieza de mapa');
                  }
                });
                vm.participantes = [];
                var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
                DataServiceServer.getTracking(aux[0], aux[1], vm.ride.id_weekend)
                  .then(function successCallback(response) {
                    if (vm.ride.active) {
                      try {
                        vm.participantes = response.tracking;
                      } catch (err) {
                        Materialize.toast('NO HAY DATOS DE CORREDORES', 5000);
                      }
                      var limites = new google.maps.LatLngBounds();
                      if (vm.participantes.length > 0) {
                        for (let i = vm.participantes.length - 1; i >= 0; i--) {
                          try {
                            if (vm.participantes[i].ec || vm.participantes[i].ed) {
                              vm.alertaParticipantes.push(vm.participantes[i]);
                            } // END IF
                            vm.participantes[i].tag = new MarkerWithLabel({
                              position: new google.maps.LatLng(vm.participantes[i].l.split(",")[0], vm.participantes[i].l.split(",")[1]),
                              map: vm.mapWeek,
                              labelContent: vm.participantes[i].un.split(" ")[0][0] + vm.participantes[i].un.split(" ")[1][0],
                              icon: "components\\image\\iconoNegro.png",
                              labelAnchor: new google.maps.Point(51, 4),
                              labelClass: "labels",
                              labelStyle: {
                                opacity: 0.75
                              }
                            });

                            if (!vm.participantes[i].ec && !vm.participantes[i].ed) {
                              vm.participantes[i].tag.setIcon('components\\image\\iconoNegro.png');
                            } else {
                              vm.participantes[i].tag.setIcon('components\\image\\iconoRojo.png');
                            }
                          } catch (e) {
                            console.log('Participante sin señal');
                          }
                        } // END FOR
                      }
                      if (vm.iterar > 2 && vm.participantes.length == 0 && vm.esperarTracking == true) {
                        vm.esperarTracking = false;
                        Materialize.toast('NO SE ENCONTRARON CORREDORES. . . . .', 4000);
                      }
                      let tempPos = {};

                      vm.esperarTracking = false;
                      alertasF();
                      if (vm.iterar == 1) { vm.centrar(); loadData(); }
                      else setTimeout(loadData, 10000);
                      return;

                    } // end if (vm.ride.active)

                  }, function errorCallback(response) {
                    Materialize.toast('Falla de conexión', vm.repeat * 1000);
                  });
              }
            } // end loadData

            // modal tracking iniciada
            if (vm.ride.active) {
              vm.esperarTracking = true;
              loadData();
            } else {
              getMyPosition();
              vm.centrar();
            }

          },
          complete: function () {
            vm.esperarTracking = false;
            vm.ride.active = false;
            vm.confirmacion = false;
            vm.ride = {};
            vm.abierto = false;
            vm.ride.active = false;
            vm.participantes.forEach(elem => {
              elem.tag.setMap(null);
            });
            vm.participantes = [];
            vm.alertaParticipantes = [];
            vm.iterar = 0;
            vm.repeat = 0;
            /*$('#mec').css('background-color', '#FFFFFF');
            $('#med').css('background-color', '#FFFFFF');
            $("#mec").removeClass("pulse");
            $("#med").removeClass("pulse");*/
            vm.getWeek();
          }
        });

        vm.iterar = 0;
        $('.datepicker').pickadate({
          selectMonths: true, // Creates a dropdown to control month
          selectYears: 70, // Creates a dropdown of 15 years to control year,
          today: 'Hoy',
          clear: 'Limpiar',
          close: 'Ok',
          format: 'mm/dd/yyyy',
          formatSubmit: 'mm/dd/yyyy',
          closeOnSelect: false // Close upon selecting a date,
        });

        $('.timepicker').pickatime({
          default: 'now', // Set default time: 'now', '1:30AM', '16:30'
          fromnow: 0, // set default time to * milliseconds from now (using with default = 'now')
          twelvehour: false, // Use AM/PM or 24-hour format
          donetext: 'OK', // text for done-button
          cleartext: 'Limpiar', // text for clear-button
          canceltext: 'Cancelar', // Text for cancel-button
          autoclose: false, // automatic close timepicker
          ampmclickable: true, // make AM PM clickable
          aftershow: function () { } //Function for after opening timepicker
        });

        $('.tooltipped').tooltip({
          delay: 50
        });
        vm.clearData();
        vm.getWeek();
      });
    }


    vm.styleMap = [{
      elementType: 'geometry',
      stylers: [{
        color: '#242f3e'
      }]
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{
        color: '#242f3e'
      }]
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{
        color: '#746855'
      }]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{
        color: '#828891'
      }]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{
        color: '#828891'
      }]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{
        color: '#828891'
      }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{
        color: '#38414e'
      }]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{
        color: '#212a37'
      }]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{
        color: '#9ca5b3'
      }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{
        color: '#746855'
      }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{
        color: '#1f2835'
      }]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{
        color: '#f3d19c'
      }]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{
        color: '#2f3948'
      }] //828891
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{
        color: '#d59563'
      }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{
        color: '#515c6d'
      }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{
        color: '#515c6d'
      }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{
        color: '#17263c'
      }]
    }
    ];

    (function () {
      initComponents();
    })();
  }
})();

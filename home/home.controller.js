function justNumbers(e) {
  var keynum = window.event ? window.event.keyCode : e.which;
  if ((keynum == 8) || (keynum == 46))
    return true;

  return /\d/.test(String.fromCharCode(keynum));
}

// homeController

(function () {
  "use strict";

  angular.module("app").controller("HomeController", HomeController);

  HomeController.$inject = [
    "$rootScope",
    "$interval",
    "DataService",
    "DataServiceServer",
    "$sce",
    "$parse",
    '$location',
    '$cookies',
    '$filter'
  ];

  function HomeController(
    $rootScope,
    $interval,
    DataService,
    DataServiceServer,
    $sce,
    $parse,
    $location,
    $cookies,
    $filter
  ) {
    var vm = this;
    vm.esperar = false;
    vm.namePosition = "Admin Noohwi";
    vm.confirmacion = false;
    vm.menu = [];

    vm.eventos = [];
    vm.packages = [];
    vm.map;
    vm.mapPackage;

    vm.nomTemp = 0;

    vm.checkEvent;
    vm.colections = [];
    vm.pointsOrigen = false;
    vm.pointsDestino = false;

    vm.loadMapa = loadMapa;
    vm.positionMarker = {
      lat: 19.3155927,
      lng: -99.1601487
    };

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
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{
        color: '#FF3800'
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

    vm.movible = new google.maps.Marker({
      draggable: true,
      title: 'EXAMPLE!'
    });

    vm.markers = [];
    vm.direccionCheck = "";


    vm.checkOut = function (x) {
      $location.path('/checkOut/' + x.id_event + "/" + x.nameEvent);
    };

    vm.checkIn = function (value) {
      vm.namePosition += "/Check-In";
      $rootScope.globals['id'] = value;
      var cookieExp = new Date();
      cookieExp.setDate(cookieExp.getDate() + 1);
      $cookies.putObject('globals', $rootScope.globals, {
        expires: cookieExp
      });
      vm.showMenu = 'cIn.html';
    };


    vm.deleteEvento = function (event, index, hab) {
      let msg = hab ? 'habilitará' : 'eliminará';
      let msg2 = hab ? 'habilitar' : 'eliminar';
      let msg3 = hab ? 'Habilitado' : 'Eliminado';
      swal({
        title: '¿ Estás seguro ?',
        text: `Se ${msg} ${event.nameEvent}`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#C0C0C0',
        cancelButtonColor: '#FF3800',
        cancelarButtonText: 'Cancelar',
        showCloseButton: true,
        confirmButtonText: `Si, ${msg2}!`,
        focusConfirm: false
      }).then((result) => {
        if (result.value) {
          var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
          DataServiceServer.desableEvents({
            "id_user": aux[0],
            "token": aux[1],
            "id_events": event.id_event,
            "active": hab
          }).then(function (response) {
            swal(
              `${msg3} !`,
              `Se ha ${msg3}  ${event.nameEvent}`,
              'success'
            )
            vm.getEventos();
          });
        }
      })
    }



    vm.pagos = function (value) {
      vm.namePosition += "/Pagos";
      $rootScope.globals['id'] = value;
      var cookieExp = new Date();
      cookieExp.setDate(cookieExp.getDate() + 1);
      $cookies.putObject('globals', $rootScope.globals, {
        expires: cookieExp
      });
      vm.showMenu = 'pagosE.html';
    };

    vm.pagosP = function (value) {
      vm.namePosition += "/Notificaciones";
      $rootScope.globals['id'] = value;
      var cookieExp = new Date();
      cookieExp.setDate(cookieExp.getDate() + 1);
      $cookies.putObject('globals', $rootScope.globals, {
        expires: cookieExp
      });
      vm.showMenu = 'pagosP.html';
    };

    var mapOptions = {
      zoom: 15,
      center: new google.maps.LatLng(25, 80),
      mapTypeId: google.maps.MapTypeId.TERRAIN
    };


    /*Funciones: */
    (function initController() {
      vm.showMenu = "logo.view.html";
      getMenu();
      vm.checkBol = false;
    })();

    vm.callCOut = function (value) {
      vm.namePosition += "/Check-Out";
      $rootScope.globals['id'] = value;
      var cookieExp = new Date();
      cookieExp.setDate(cookieExp.getDate() + 1);
      $cookies.putObject('globals', $rootScope.globals, {
        expires: cookieExp
      });
      vm.showMenu = 'cOut.html';
    };

    vm.showMenuActive = function (element) {
      if (vm.checkBol) vm.checkBol = false;
      $(".button-collapse").sideNav("hide");
      vm.showMenu = element.urlMenu;
      vm.namePosition = "Admin Noohwi/" + element.nombre;
    };

    vm.check = function (x) {
      if (x != undefined) {
        vm.checkEvent = x;
        vm.checkBol = true;
        vm.namePosition += "/Recolección & Entrega";
        vm.showMenu = "check.html";
      } else {
        loadMapa();
      }
    };

    vm.deleteArea = false;

    function deleteAreaNetwork(controlDiv, map) {

      var controlUI = document.createElement('div');


      controlUI.style.backgroundColor = '#FF3800';
      controlUI.style.border = '2px solid #fff';
      controlUI.style.borderRadius = '13px';
      controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
      controlUI.style.cursor = 'pointer';
      controlUI.style.marginBottom = '22px';
      controlUI.style.textAlign = 'center';
      controlUI.title = 'ELIMINAR AREA DE TRABAJO';
      controlDiv.appendChild(controlUI);


      var controlText = document.createElement('div');
      controlText.style.color = 'rgb(255,255,255)';
      controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
      controlText.style.fontSize = '12px';
      controlText.style.lineHeight = '38px';
      controlText.style.paddingLeft = '5px';
      controlText.style.paddingRight = '5px';
      controlText.innerHTML = 'ELIMINAR';
      controlUI.appendChild(controlText);
      // Setup the click event listeners: simply set the map to Chicago.
      controlUI.addEventListener('click', function () {
        vm.newPoly = false;
        vm.deleteArea = true;
        vm.mapPackage.setOptions({
          draggableCursor: 'default'
        });

        Materialize.toast('ELIMINANDO ÁREA', 2000);

      });
    };

    function newAreaNetwork(controlDiv, map) {
      // Set CSS for the control border.
      var controlUI = document.createElement('div');
      controlUI.style.backgroundColor = '#fff';
      controlUI.style.border = '2px solid #FF3800';
      controlUI.style.borderRadius = '13px';
      controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
      controlUI.style.cursor = 'pointer';
      controlUI.style.marginBottom = '22px';
      controlUI.style.textAlign = 'center';
      controlUI.title = 'AGREGAR AREA DE TRABAJO';
      controlDiv.appendChild(controlUI);

      // Set CSS for the control interior.
      var controlText = document.createElement('div');
      controlText.style.color = '#FF3800';
      controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
      controlText.style.fontSize = '12px';
      controlText.style.lineHeight = '38px';
      controlText.style.paddingLeft = '5px';
      controlText.style.paddingRight = '5px';
      controlText.innerHTML = 'AGREGAR';
      controlUI.appendChild(controlText);

      controlUI.addEventListener('click', function () {
        if (!vm.newPoly) {
          vm.mapPackage.setOptions({
            draggableCursor: 'crosshair'
          });
          vm.polygonAddress = [];
          vm.deleteArea = false;
          vm.newPoly = true;
          Materialize.toast('AGREGANDO AREA DE TRABAJO', 2000);
        }
      });
    };

    function savePolygon(controlDiv, map) {

      var controlUI = document.createElement('div');
      controlUI.style.backgroundColor = '#fff';
      controlUI.style.border = '2px solid #FF3800';
      controlUI.style.borderRadius = '13px';
      controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
      controlUI.style.cursor = 'pointer';
      controlUI.style.marginBottom = '22px';
      controlUI.style.textAlign = 'center';
      controlUI.title = 'GUARDAR AREA DE TRABAJO';
      controlDiv.appendChild(controlUI);


      var controlText = document.createElement('div');
      controlText.style.color = '#FF3800';
      controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
      controlText.style.fontSize = '12px';
      controlText.style.lineHeight = '38px';
      controlText.style.paddingLeft = '5px';
      controlText.style.paddingRight = '5px';
      controlText.innerHTML = 'GUARDAR';
      controlUI.appendChild(controlText);

      controlUI.addEventListener('click', function () {
        if (vm.newPoly) {

          vm.mapPackage.setOptions({
            draggableCursor: 'default'
          });
          var index = vm.jsonI.length;
          var newPolygon = new google.maps.Polygon({
            id: index,
            strokeColor: 'white',
            strokeOpacity: 0.5,
            strokeWeight: 1,
            fillColor: '#FF3800',
            fillOpacity: 0.4,
            map: vm.mapPackage
          });
          vm.jsonI.push(vm.polygonAddress);
          newPolygon.setPath(vm.polygonAddress);
          newPolygon.addListener('rightclick', (event) => {
            newPolygon.setMap(null);
            vm.jsonI.splice(index, 1);
            Materialize.toast('ELIMINADO', 2000);
          });
          vm.markerPlygons.forEach(elem => {
            elem.setMap(null);
          });
          vm.poly.setMap(null);
          vm.poly.getPath(null);
          vm.polygonAddress = [];
          vm.markerPlygons = [];
          vm.newPoly = false;
          vm.deleteArea = false;
          Materialize.toast('GUARDAR', 2000);
        }
      });
    };



    vm.poly;
    vm.markerPlygons = [];

    function placeMarker(location) {
      var path = vm.poly.getPath();
      path.push(location);

      var marker = new google.maps.Marker({
        position: location,
        title: '#' + path.getLength(),
        map: vm.mapPackage
      });
      vm.markerPlygons.push(marker);
      vm.polygonAddress.push({
        lat: location.lat(),
        lng: location.lng()
      });
    }

    vm.newPoly = false;
    vm.polygonAddress = [];

    vm.mapForPackage = () => {
      vm.mapPackage = new google.maps.Map(document.getElementById('mapPackage'), {
        center: new google.maps.LatLng(19.3932692, -99.1625188),
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: vm.styleMap
      });
      vm.poly = new google.maps.Polyline({
        strokeColor: '#000000',
        strokeOpacity: 1.0,
        strokeWeight: 3
      });

      vm.poly.setMap(vm.mapPackage);

      google.maps.event.addListener(vm.mapPackage, 'click', function (event) {
        if (vm.newPoly) {
          placeMarker(event.latLng);
        }
      });


      var centerControlDiv2 = document.createElement('div');
      var centerControl = new newAreaNetwork(centerControlDiv2, vm.mapPackage);

      centerControlDiv2.index = 1;
      vm.mapPackage.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(centerControlDiv2);


      var centerControlDiv = document.createElement('div');
      var centerControl = new savePolygon(centerControlDiv, vm.mapPackage);

      centerControlDiv.index = 1;
      vm.mapPackage.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(centerControlDiv);



      var centerControlDiv3 = document.createElement('div');
      var centerControl = new deleteAreaNetwork(centerControlDiv3, vm.mapPackage);

      centerControlDiv3.index = 1;
      vm.mapPackage.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(centerControlDiv3);

      vm.newPoly = false;
    };

    function loadMapa() {
      if (vm.checkBol) {
        vm.map = new google.maps.Map(document.getElementById('map'), {
          center: new google.maps.LatLng(19.3155927, -99.1601487),
          zoom: 9,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: vm.styleMap
        });

        var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
        DataServiceServer.getCollection_points(aux[0], aux[1], vm.checkEvent.id_event).then(function (response) {
          var list = response.collection_points;
          vm.colections = [];

          for (let index = 0; index < list.length; index++) {
            var gpsAux = list[index].gps.split(",");
            vm.colections.push({
              id_collpoints: list[index].id_collpoints,
              id_event: list[index].id_event,
              type_collection: list[index].type_collection, //1 = punto de recoleccion 2 = punto de entrega
              type: list[index].type, //1 = origen ,2 = destino
              additional_reference: list[index].additional_reference,
              gps: {
                lat: Number(gpsAux[0]),
                lng: Number(gpsAux[1])
              },
              start_date: list[index].start_date,
              end_date: list[index].end_date,
              point_time: list[index].point_time,
              address: list[index].address,
              ZIndex: vm.markers.length
            });
            if (list[index].type_collection == 1 && list[index].type == 1) {
              vm.markers.push(new google.maps.Marker({
                draggable: false,
                icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                title: 'ORIGEN - RECOLECCION',
                position: {
                  lat: Number(gpsAux[0]),
                  lng: Number(gpsAux[1])
                },
                map: vm.map,
                ZIndex: vm.markers.length
              }));
            } else
              if (list[index].type_collection == 2 && list[index].type == 1) {
                vm.markers.push(new google.maps.Marker({
                  draggable: false,
                  title: 'ORIGEN - ENTREGA',
                  position: {
                    lat: Number(gpsAux[0]),
                    lng: Number(gpsAux[1])
                  },
                  map: vm.map,
                  ZIndex: vm.markers.length,
                  icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                }));
              } else
                if (list[index].type_collection == 1 && list[index].type == 2) {
                  vm.markers.push(new google.maps.Marker({
                    draggable: false,
                    title: 'DESTINO - ENTREGA',
                    icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    position: {
                      lat: Number(gpsAux[0]),
                      lng: Number(gpsAux[1])
                    },
                    ZIndex: vm.markers.length,
                    map: vm.map
                  }));
                } else
                  if (list[index].type_collection == 2 && list[index].type == 2) {
                    vm.markers.push(new google.maps.Marker({
                      draggable: false,
                      title: 'DESTINO - RECOLECCION',
                      ZIndex: vm.markers.length,
                      icon: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
                      position: {
                        lat: Number(gpsAux[0]),
                        lng: Number(gpsAux[1])
                      },
                      map: vm.map
                    }));
                  }
          }
        });
      } else if (vm.showMenu == "eventos.html") {
        vm.getEventos();
      } else if (vm.showMenu == "paquetes.html") {
        vm.getPackages();
      }
    }

    vm.getCenter = function () {
      DataServiceServer.getLocationGoogle(vm.direccionCheck.replace(/\s/g, "+"))
        .then(function successCallback(response) {
          vm.movible.setMap(null);
          vm.map.setCenter(response);
          vm.movible = new google.maps.Marker({
            position: response,
            draggable: true,
            animation: google.maps.Animation.DROP,
            title: 'NUEVA UBICACIÓN !'
          });
          vm.movible.setMap(vm.map);
          vm.movible.addListener('dragend', iconClick);
          vm.map.setZoom(15);
        }, function errorCallback(response) {
          Materialize.toast('ERROR POR CONEXION', 4000);
        });
    };

    vm.clearPackage = function () {
      vm.mapForPackage();
      vm.deleteArea = false;
      vm.confirmacion = false;
    };

    function iconClick(obj) {
      if (vm.movible == null) {
        DataServiceServer.getAddressByGoogle(vm.movible.position.lat() + "," + vm.movible.position.lng())
          .then(function successCallback(response) {
            vm.direccionCheck = response;
          }, function errorCallback(response) {
            Materialize.toast('ERROR POR CONEXION', 4000);
          });
      } else {
        DataServiceServer.getAddressByGoogle(vm.movible.position.lat() + "," + vm.movible.position.lng())
          .then(function successCallback(response) {
            vm.direccionCheck = response;
          }, function errorCallback(response) {
            Materialize.toast('ERROR POR CONEXION', 4000);
          });
      }
    }

    vm.elemetTemporal = null;
    vm.deletePoint = function (item) {
      if (vm.elemetTemporal == null) {
        vm.elemetTemporal = item;
      }
      var temp = $rootScope.globals.currentUser;
      var aux = Base64.decode(temp.authdata).split(":");
      var obj = {
        "id_user": aux[0],
        "token": aux[1],
        "id_collpoints": vm.elemetTemporal.id_collpoints
      };
      DataServiceServer.deletecollpoints(obj)
        .then(function successCallback(response) {
          if (response.data.status == -1) {
            Materialize.toast(response.data.message, 4000);
          } else {
            Materialize.toast('ELIMINADO', 3000);
          }
          loadMapa();
          vm.elemetTemporal = null;
        }, function errorCallback(response) {
          Materialize.toast('ERROR EN LA CONEXION', 3000);
        });
    };

    vm.editPoint = function (item) {
      vm.map.setCenter(item.gps);
      vm.map.setZoom(15);
      vm.markers.forEach(element => {
        if (element.getZIndex() == item.ZIndex) {
          vm.movible = element;
          element.addListener('dragend', iconClick);
          element.setDraggable(true);
        }
      });
      vm.showPoints = false;
      vm.direccionCheck = item.address;
      vm.referenciaCheck = item.additional_reference;
      vm.dateStart = $filter('date')(item.start_date, 'MM/dd/yyyy');
      vm.dateEnd = $filter('date')(item.end_date, 'MM/dd/yyyy');
      //vm.dateStart = " " + new Date(item.start_date).getDate() + "/" + (new Date(item.start_date).getMonth() + 1) + "/" + new Date(item.start_date).getFullYear();
      //vm.dateEnd = " " + new Date(item.end_date).getDate() + "/" + (new Date(item.end_date).getMonth() + 1) + "/" + new Date(item.end_date).getFullYear();
      vm.starTime1 = item.point_time.split("-")[0];
      vm.endTime1 = item.point_time.split("-")[1];
      vm.nameEvent = item.id_collpoints;
      vm.rdEntrega = item.type_collection;
      vm.typeColection = item.type;
    };

    vm.typeColection = 1;
    vm.nameEvent = "";
    vm.newPoint = function () {
      var temp = $rootScope.globals.currentUser;
      var aux = Base64.decode(temp.authdata).split(":");
      var obj = {
        "id_user": aux[0],
        "token": aux[1],
        "id_collpoints": vm.nameEvent,
        "id_event": vm.checkEvent.id_event,
        "type_collection": vm.rdEntrega,
        "type": vm.typeColection,
        "address": vm.direccionCheck,
        "additional_reference": vm.referenciaCheck,
        "gps": vm.movible.position.lat() + "," + vm.movible.position.lng(),
        "start_date": new Date(vm.dateStart).getTime(),
        "end_date": new Date(vm.dateEnd).getTime(),
        "point_time": vm.starTime1 + "-" + vm.endTime1

      }
      vm.esperar = true;
      DataServiceServer.saveUpdateEventsColctionP(obj).then(function (response) {
        loadMapa();
        vm.nomTemp = 0;
        vm.showPoints = true;
        Materialize.toast('GUARDADO', 4000);
        vm.direccionCheck = "";
        vm.referenciaCheck = "";
        vm.dateStart = "";
        vm.dateEnd = "";
        vm.starTime1 = "";
        vm.endTime1 = "";
        vm.nameEvent = "";
        vm.esperar = false;
      });
    };

    vm.clearDataPoints = function () {
      vm.showPoints = true;
      vm.direccionCheck = "";
      vm.referenciaCheck = "";
      vm.dateStart = "";
      vm.dateEnd = "";
      vm.starTime1 = "";
      vm.endTime1 = "";
      vm.movible.setMap(null);
      vm.map.setCenter(vm.positionMarker);
      vm.map.setZoom(8);
    };




    function getMenu() {
      vm.esperar = true;
      DataService.GetAll().then(function (response) {

        for (var i in response) {
          var nombre;
          var urlMenu;
          switch (response[i].clef) {
            case "mod_web_events":
              nombre = "Bike Transportation Services";
              urlMenu = "eventos.html";
              break;
            case "mod_web_package":
              nombre = "Mobile Services";
              urlMenu = "paquetes.html";
              break;
            case "mod_web_newUser":
              nombre = "Users List";
              urlMenu = "usuarios.html";
              break;
            case "mod_web_contact":
              nombre = "Contact Information";
              urlMenu = "contacto.html";
              break;
            case "mod_web_weekend":
              nombre = "Weekend Rides";
              urlMenu = "weekend.html";
              break;
            case "mod_weekend_packages":
              nombre = "Package WR's";
              urlMenu = "weekendPackage.html";
              break;
            case "mod_web_special_events":
              nombre = "Noohwi Rides";
              urlMenu = "specialEvents.html";
              break;
            case "mod_web_push_notification":
              nombre = response[i].name_module;
              urlMenu = "pushNotification.html";
              break;
            case "mod_web_cupones":
              nombre = 'Coupons';
              urlMenu = "cupones.html";
              break;
            case "mod_web_pass":
              continue;
              nombre = response[i].name_module;
              urlMenu = "pass.html";
              break;
          }

          vm.menu.push({
            index: response[i].index,
            nombre: nombre,
            urlMenu: urlMenu
          });
        }
        vm.menu.push({
          index: 1000,
          nombre: "Change password",
          urlMenu: "pass.html"
        });
        vm.esperar = false;
      });
    }

    vm.formEvent = function () {
      if (vm.confirmacion) {
        var temp = $rootScope.globals.currentUser;
        var aux = Base64.decode(temp.authdata).split(":");
        var obj = {
          "id_user": aux[0],
          "token": aux[1],
          "id_event": vm.nomTemp,
          "name": vm.nameEvent,
          "place": vm.placeEvent,
          "date": new Date(vm.dateEvent).getTime(),
          "description": String(vm.description).replace(/[\n]/gi, '||'),
          "url": vm.urlEvent,
          "quota": vm.cupoEvent,
          "cost": vm.costEvent,
          "terms": String(vm.terminos).replace(/[\n]/gi, '||'),
          "profiles": temp.profile.type
        };
        vm.esperar = true;
        DataServiceServer.saveUpdateEvent(obj).then(function (response) {
          vm.getEventos();
          Materialize.toast('GUARDADO', 3000);
          vm.esperar = false;
        });
      }
      vm.nameEvent = "";
      vm.placeEvent = "";
      vm.dateEvent = "";
      vm.description = "";
      vm.urlEvent = "";
      vm.cupoEvent = "";
      vm.costEvent = "";
      vm.terminos = "";
      vm.nomTemp = 0;
      vm.confirmacion = false;
    };

    vm.clearEvent = function () {
      vm.nameEvent = "";
      vm.placeEvent = "";
      vm.dateEvent = "";
      vm.description = "";
      vm.urlEvent = "";
      vm.cupoEvent = "";
      vm.costEvent = "";
      vm.terminos = "";
      vm.nomTemp = 0;
      vm.confirmacion = false;
    };

    vm.editEvent = function (x) {
      vm.description = x.description;
      var dateTemp = $filter('date')(x.dateEvent, 'MM/dd/yyyy');
      vm.dateEvent = dateTemp;
      vm.placeEvent = x.placeEvent;
      vm.urlEvent = x.urlEvent;
      vm.nameEvent = x.nameEvent;
      vm.cupoEvent = x.cupoEvent;
      vm.costEvent = x.costEvent;
      vm.terminos = x.terminos;
      vm.nomTemp = x.id_event;
    };

    vm.editPackage = function (x) {
      vm.nomTemp = x.id_package;
      vm.namePackage = x.name_package;
      vm.descPackage = x.descriptionP;
      vm.terms = x.terms;
      vm.costPackage = x.cost;
      if (x.polygon != null) {
        vm.jsonI = JSON.parse(x.polygon); //.poligonos
        vm.initPlacesWork();
      }
    };

    var infoWindow;
    vm.initPlacesWork = () => {
      vm.jsonI.forEach((elem, index) => {
        var newPolygon = new google.maps.Polygon({
          id: index,
          strokeColor: 'white',
          strokeOpacity: 0.5,
          strokeWeight: 1,
          fillColor: '#FF3800',
          fillOpacity: 0.4,
          map: vm.mapPackage
        });

        newPolygon.addListener('rightclick', (event) => {
          if (vm.deleteArea) {
            newPolygon.setMap(null);
            vm.jsonI.splice(index, 1);
            Materialize.toast('ÁREA ELIMINADA', 2000);
          }
        });

        newPolygon.setPath(elem);

      });
    };

    vm.cealrPackage = function () {
      vm.nomTemp = "";
      vm.namePackage = "";
      vm.descPackage = "";
      vm.terms = "";
      vm.costPackage = "";
    };

    vm.verTodosEventos = false;



    vm.getEventos = function () {
      vm.eventos = [];
      var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
      vm.esperar = true;
      DataServiceServer.getEvents(aux[0], aux[1])
        .then(function successCallback(response) {

          var list = response.events;
          if (response == -3) {
            Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
            $location.path("/login");
            return;
          }

          for (let index = 0; index < list.length; index++) {

            vm.eventos.push({
              description: list[index].description.replace(/\|{2}/gm, '\n'),
              dateEvent: list[index].date,
              placeEvent: list[index].place,
              urlEvent: list[index].url,
              nameEvent: list[index].name,
              cupoEvent: list[index].quota,
              costEvent: list[index].cost,
              status: list[index].status,
              terminos: list[index].terms.replace(/\|{2}/gm, '\n'),
              id_event: list[index].id_event
            });
          }

          vm.esperar = false;
        }, function errorCallback(response) {
          vm.esperar = false;
          Materialize.toast('ERROR POR CONEXION', 4000);
        });
    };

    vm.verTodosPaquetes = false;

    vm.packageP = [];
    vm.getPackages = function () {
      vm.packages = [];
      var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
      vm.esperar = true;
      DataServiceServer.getPagosP(aux[0], aux[1])
        .then(function successCallback(response) {
          vm.packageP = response;

          DataServiceServer.getPackage(aux[0], aux[1]).then(function (response) {
            if (response == -3) {
              Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
              $location.path("/login");
              return;
            }

            var list = response.packages;


            for (let index = 0; index < list.length; index++) {
              var tam = 0;
              vm.packageP.DataUsersReservationPaidPackages.forEach(element => {
                if (element.id_package == list[index].id_package && element.status_service != 3) {
                  tam += 1;
                }
              });
              vm.packages.push({
                name_package: list[index].name_package,
                descriptionP: list[index].description.replace(/\|{2}/gm, '\n'),
                terms: list[index].terms.replace(/\|{2}/gm, '\n'),
                cost: list[index].cost,
                id_package: list[index].id_package,
                tam: tam,
                status: list[index].status,
                polygon: list[index].polygon
              });
            }

            vm.esperar = false;
          });
          vm.esperar = false;
        }, function errorCallback(response) {
          vm.esperar = false;
          Materialize.toast('ERROR POR CONEXION', 4000);
        });
      vm.mapForPackage();
    };

    vm.deletePaquete = function (disable, hab) {
      let msg = hab ? 'habilitará' : 'eliminará';
      let msg2 = hab ? 'habilitar' : 'eliminar';
      let msg3 = hab ? 'Habilitado' : 'Eliminado';
      swal({
        title: '¿ Estás seguro ?',
        text: `Se ${msg} ${disable.name_package}`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#C0C0C0',
        cancelButtonColor: '#FF3800',
        cancelarButtonText: 'Cancelar',
        showCloseButton: true,
        confirmButtonText: `Si, ${msg2}!`,
        focusConfirm: false
      }).then((result) => {
        if (result.value) {
          var temp = $rootScope.globals.currentUser;
          var aux = Base64.decode(temp.authdata).split(":");
          vm.esperar = true;
          DataServiceServer.saveUpdatePackage(
            aux[0],
            aux[1],
            disable.id_package,
            disable.name_package,
            disable.descriptionP.replace(/[\n]/gi, '||'),
            disable.terms.replace(/[\n]/gi, '||'),
            disable.cost,
            hab,
            2,
            JSON.stringify(disable.polygon)
          ).then(function (response) {
            swal(
              `${msg3} !`,
              `Se ha ${msg3}  ${disable.name_package}`,
              'success'
            )
            vm.getPackages();
            vm.esperar = false;
            vm.deleteArea = false;
            vm.newPoly = false;
            vm.nomTemp = '';
            vm.namePackage = '';
            vm.descPackage = '';
            vm.terms = '';
            vm.costPackage = '';
            vm.confirmacion = false;
          });
        }
      })
    }

    vm.jsonI = [];
    vm.formPackage = function () {
      if (vm.confirmacion) {
        var temp = $rootScope.globals.currentUser;
        var aux = Base64.decode(temp.authdata).split(":");
        vm.esperar = true;
        
        DataServiceServer.saveUpdatePackage(
          aux[0],
          aux[1],
          vm.nomTemp,
          vm.namePackage,
          vm.descPackage.replace(/[\n]/gi, '||'),
          vm.terms.replace(/[\n]/gi, '||'),
          vm.costPackage,
          true,
          temp.profile.type,
          JSON.stringify(vm.jsonI) //.poligonos
        ).then(function (response) {
          vm.getPackages();
          vm.markerPlygons.forEach(elem => {
            elem.setMap(null);
          });
          vm.poly.setMap(null);
          vm.poly.getPath(null);
          vm.polygonAddress = [];
          vm.jsonI = [];
          Materialize.toast('GUARDADO', 4000);
          vm.esperar = false;
          vm.deleteArea = false;
          vm.newPoly = false;
          vm.nomTemp = '';
          vm.namePackage = '';
          vm.descPackage = '';
          vm.terms = '';
          vm.costPackage = '';
          vm.confirmacion = false;
        });

      }
    };


    vm.showFormOrigen = false;
    vm.showPoints = true;
    vm.nombreCheck = "";

  }
})();

var Base64 = {
  keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  encode: function (input) {
    var output = "";
    var chr1,
      chr2,
      chr3 = "";
    var enc1,
      enc2,
      enc3,
      enc4 = "";
    var i = 0;

    do {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output =
        output +
        this.keyStr.charAt(enc1) +
        this.keyStr.charAt(enc2) +
        this.keyStr.charAt(enc3) +
        this.keyStr.charAt(enc4);
      chr1 = chr2 = chr3 = "";
      enc1 = enc2 = enc3 = enc4 = "";
    } while (i < input.length);

    return output;
  },

  decode: function (input) {
    var output = "";
    var chr1,
      chr2,
      chr3 = "";
    var enc1,
      enc2,
      enc3,
      enc4 = "";
    var i = 0;

    var base64test = /[^A-Za-z0-9\+\/\=]/g;
    if (base64test.exec(input)) {
      window.alert(
        "There were invalid base64 characters in the input text.\n" +
        "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
        "Expect errors in decoding."
      );
    }
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    do {
      enc1 = this.keyStr.indexOf(input.charAt(i++));
      enc2 = this.keyStr.indexOf(input.charAt(i++));
      enc3 = this.keyStr.indexOf(input.charAt(i++));
      enc4 = this.keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);

      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }

      chr1 = chr2 = chr3 = "";
      enc1 = enc2 = enc3 = enc4 = "";
    } while (i < input.length);

    return output;
  }
};

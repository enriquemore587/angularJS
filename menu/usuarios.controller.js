////////// controlador de usuariosController
(function () {
    "use strict";
    var app = angular.module('app');
    app.controller("usuariosController", usuariosController);

    usuariosController.$inject = [
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
    function usuariosController(
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
        vm.ver = false;
        vm.userVisible;
        vm.biciVisible;
        vm.addressVisible = null;

        vm.mapUsers;

        vm.showAddress = address => {
          vm.addressVisible = address;
          /*
          var myLatLng = {lat: parseFloat(vm.addressVisible.gps.split(",")[0]), lng: parseFloat(vm.addressVisible.gps.split(",")[1])};
            vm.mapUsers = new google.maps.Map(document.getElementById('mapUsers'), {
              center: myLatLng,
              zoom: 18,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            });
            var marker = new google.maps.Marker({
              position: myLatLng,
              map: vm.mapUsers,
              title: vm.addressVisible.street
            });
            */
        }
        vm.showBici = bici => vm.biciVisible = bici;

        vm.listaUsers = [];

        vm.showDetail = userId => {
            var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
            DataServiceServer.getUsersdetail(aux[0], aux[1], userId)
            .then(function successCallback(response) {
                vm.userVisible = response.user;
                vm.ver = true;
                }, function errorCallback(response) {
                Materialize.toast('Falla de conexión', 1000);
                });
        }

        vm.hideDetail = user => {
            vm.userVisible.photo = '';
          vm.ver = false;
          vm.biciVisible=null;
          vm.addressVisible=null;
        }

        function initComponents() {
            vm.usuario = {
                "user_name": "",
                "password": "",
                "mail": "",
                "name": "",
                "last_name": "",
                "mother_last_name": "",
                "birthdate": null,
                "sex": "",
                "phone": "",
                "experience_level": 1,
                "user_photo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADLCAYAAAArzNwwAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAADylJREFUeNrsnb1y20gWhRvwuso1ienM2VCRNxsqm0xUttGYfAJR2WYys8kkPYHIJxAZTW0karKNTGWTGcrWkaFM2XKSqZlysNtXurBhivjvBvrnnCoUbYmkgO7++tzb3WgIAUEQBEEQBClWgCJoR98NfurJlwH/t89HWi9Tv090s+OrYj5I0R/RrxuULgCxBYKk4Q/l8X0KhL7mPx3JY8Ovd/wKeABI544w5F7/gF97hp1mAg050RrQAJA2gHjLr31LLyViWG4kLCvULABpAsWAYTjakR+4ohU7zEoCE6PWAUgZKAiIkcUu0cRdloAFgOwKnyaOO0VVrVOwbACIn2Ak4dMEPOQm+hSGzSUoEQDxwy0ofDr1MIRS4ioSlAUAcROMd/I4Ee…s1EzYdmAhCzKpJylDnmUEol3yei+NkvzuV8geMVO2JH6Re8lSqUHnS/gKt848YnHEb1SoBx7uKoYeBJZU9E/vBjWuQm9LjilW9LWDiXG5V0C6fB8AqQGqFXkmQSLDcuw5KC4m2J3C3dicx9mGfyCpBUoxikwgdRoVEksMQOXD91Ekei/DMlkw7Dq8ENLwHZ6j2TBLRf4aMxhxcETGT6GH8KiAN+7VX4OF3b3MeQ03tAdoRfRxxm9Cp+fMMN6YZf466g4esg2H9gdxjW+JqY3WLp+41pAGR3I0vH5L0GXxWl4Pk99X9RJ35nx0tCoj4fL/ln/YoumBVCXWPYG4BUheWAYelr/nOx+Lrb4KAhnGUBXsMpAIgqWPpbsXzfskuIUqHgCndiApA2gBnwcdBSr1/FjQiGW3aJCEAAEBOg6aWg6TE4ukKmTSqvuU1CNNwHA0Bsh2i49aM8eBIIvggAQBAEQRAEQRbr/wIMAB2nwEL3kwxHAAAAAElFTkSuQmCC"
            };
        }
        vm.getAllUsers =  () => {
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
                }, function errorCallback(response) {
                Materialize.toast('Falla de conexión', 1000);
                });
        }
        (function () {
            initComponents();
            vm.getAllUsers();
        })();
        vm.newUser = function () {
            vm.usuario.birthdate = new Date(vm.usuario.birthdate).getTime();

            DataServiceServer.addUser(vm.usuario)
                .then(function successCallback(response) {
                    alert(1);
                    vm.usuario.birthdate = new Date(vm.usuario.birthdate).toISOString().substr(0, 10);

                    initComponents();
                    Materialize.toast('GUARDADO', 4000);

                }, function errorCallback(response) {
                    alert(2);
                    Materialize.toast('Error en la conexion !', 4000);

                });
        }

    }
})();

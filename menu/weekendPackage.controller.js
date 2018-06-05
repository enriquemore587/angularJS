// controlador de checkInController
"use strict";
(function () {
    var app = angular.module('app');
    app.controller("PackcageWRController", PackcageWRController);

    PackcageWRController.$inject = [
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

    function PackcageWRController(
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
        vm.name = "Package WR";
        vm.usuarios = [];
        vm.items = [];
        vm.packWRObj = {};


        vm.alert = false;
        vm.isCero = (value) => {
            console.log(value);
            
        }


        vm.new = () => {
            vm.packWRObj = { active: true, id_wrp: 0, cost: 1 };
            vm.esperar = true;
            var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
            DataServiceServer.getPackageWRsUsers(aux[0], aux[1], vm.packWRObj.id_wrp)
                .then(function successCallback(response) {
                    console.log(response);

                    if (response == -3) {
                        Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                        $location.path("/login");
                        return;
                    }
                    vm.usuarios = response.users;
                    vm.esperar = false;
                }, function errorCallback(response) {
                    vm.esperar = false;
                    Materialize.toast('ERROR POR CONEXION', 4000);
                });
            $('#modal_new').modal('open');
        }

        vm.update_list = () => {
            var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
            DataServiceServer.getPackageWRsUsers(aux[0], aux[1], vm.packWRObj.id_wrp)
                .then(function successCallback(response) {
                    console.log(response);
                    if (response == -3) {
                        Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                        $location.path("/login");
                        return;
                    }
                    vm.usuarios = response.users;
                    Materialize.toast('List Updated', 4000);
                    vm.esperar = false;
                }, function errorCallback(response) {
                    vm.esperar = false;
                    Materialize.toast('ERROR POR CONEXION', 4000);
                });
        }

        vm.saveUpdatePWR = () => {
            swal({
                title: '¿ Estás seguro ?',
                text: `¡ Se guardaran los cambios cometidos !`,
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#C0C0C0',
                cancelButtonColor: '#FF3800',
                cancelarButtonText: 'Cancelar',
                showCloseButton: true,
                confirmButtonText: `Si, guardar`,
                focusConfirm: false
            }).then((result) => {
                if (result.value) {
                    var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
                    vm.packWRObj.id_user = aux[0];
                    vm.packWRObj.token = aux[1];
                    vm.packWRObj.id_users = [];
                    vm.usuarios.forEach(element => {
                        if (element.status == 1) vm.packWRObj.id_users.push(element.id_user);
                    });
                    DataServiceServer.saveUpdatePWR(vm.packWRObj)
                        .then(function successCallback(response) {
                            console.log(response);

                            if (response == -3) {
                                Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                                $location.path("/login");
                                return;
                            }
                            vm.usuarios = response.users;
                            vm.esperar = false;
                            vm.packWRObj = {};
                            swal(
                                `Guardado !`,
                                `Se ha guardado los cambios`,
                                'success'
                            )

                            $('#modal_new').modal('close');
                            getPackageWRs();

                        }, function errorCallback(response) {
                            vm.esperar = false;
                            Materialize.toast('ERROR POR CONEXION', 4000);
                        });
                }
            })



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
                    DataServiceServer.desableWeekendPackage({
                        "id_user": aux[0],
                        "token": aux[1],
                        "id_wrp": week.id_wrp,
                        "active": hab
                    }).then(function (response) {
                        swal(
                            `${msg3} !`,
                            `Se ha ${msg3}  ${week.name}`,
                            'success'
                        )
                        getPackageWRs();
                    });
                }
            })
        }

        vm.ver = item => {
            item.status = item.status == 0 ? 1 : 0;
            item.amount = item.status == 1 ? vm.packWRObj.cost : 0;
        };

        vm.editWP = pws => {
            vm.packWRObj = pws;
            vm.esperar = true;
            var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
            DataServiceServer.getPackageWRsUsers(aux[0], aux[1], pws.id_wrp)
                .then(function successCallback(response) {
                    console.log(response);
                    if (response == -3) {
                        Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                        $location.path("/login");
                        return;
                    }
                    vm.usuarios = response.users;
                    vm.esperar = false;
                }, function errorCallback(response) {
                    vm.esperar = false;
                    Materialize.toast('ERROR POR CONEXION', 4000);
                });
            $('#modal_new').modal('open');
        }

        function initComponents() {
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
            });
            getPackageWRs();
        }
        function getPackageWRs() {
            var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
            vm.esperar = true;
            DataServiceServer.getPackageWRs(aux[0], aux[1])
                .then(function successCallback(response) {
                    console.log(response);
                    if (response == -3) {
                        Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                        $location.path("/login");
                        return;
                    }
                    vm.items = response.wrp;
                    vm.esperar = false;

                }, function errorCallback(response) {
                    vm.esperar = false;
                    Materialize.toast('ERROR POR CONEXION', 4000);
                });
        }

        initComponents();
    }
})();

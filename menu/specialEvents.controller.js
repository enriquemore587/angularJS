// controlador de checkInController
"use strict";
(function () {
    var app = angular.module('app');
    app.controller("SpecialEventsController", SpecialEventsController);

    SpecialEventsController.$inject = [
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
        '$filter',
        'AuthenticationService'
    ];

    function SpecialEventsController(
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
        $filter,
        AuthenticationService
    ) {

        var vm = this;
        vm.verUsuarios = false;
        vm.usuariosConfirmados = [];
        vm.esperar = false;
        vm.name = "Package WR";

        vm.usuarios = [];
        vm.rodadas = [];

        vm.items = [];


        vm.packWRObj = {};
        vm.obj = {};

        vm.newWeekObj = {};
        vm.fynallyOBJ = {};

        //  SWITCH PARA LISTADO DE DESHABILITADOS Y HABILITADOS
        vm.verTodosEventosSpeciales = false;

        /** 
         * 0 => new obj
         * 1 => edit obj
         * -1 => edit obj - child
        */
        vm.action;
        vm.ovjMasive = {};
        vm.inputsToBlock = {};


        //  BEGIN USER LIST
        vm.showUserList = (id_weekend) => {
            vm.verUsuarios = !vm.verUsuarios;
            vm.usuariosConfirmados = [];
            if (vm.verUsuarios) {
                var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
                DataServiceServer.getUserConfirmList(aux[0], aux[1], id_weekend)
                    .then(function successCallback(response) {
                        if (!response) {
                            Materialize.toast('Sin usuarios', 5000);
                        }
                        else if (response == -3) {
                            $('.modal').modal('close');
                            Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                            AuthenticationService.ClearCredentials();
                            DataService.Delete();
                            $location.path("/login");
                            return;
                        }
                        vm.usuariosConfirmados = response.users;
                        console.log(vm.usuariosConfirmados);
                        
                    }, function errorCallback(response) {
                        vm.esperar = false;
                        Materialize.toast('ERROR POR CONEXION', 4000);
                    });
            }
        }
        //  END USER LIST

        vm.ver_new_week = false;
        vm.haveACode = false;
        vm.indexWhenEditing = -1;
        vm.newWeek = (value, regresar) => {
            vm.inputsToBlock = {};  //  libera los input condicionados
            // cuando value es false quiere decir que se cierra ventana
            if (!value && vm.action != 0) vm.action = 1;    //  se edita package y al agregar una rodada preciona regresar
            else if (!value && vm.action == 0) vm.action = 0;

            vm.indexWhenEditing = -1;
            vm.ver_new_week = value;
            vm.newWeekObj = {};
            vm.newWeekObj.haveACode = false;
            vm.newWeekObj.isAutoGe = false;
            vm.newWeekObj.type_code = 1;    // 1 es para porcentaje y el 2 es descuento en efectivo
            vm.newWeekObj.cantidad = 0;
            // vm.newWeekObj.amount = 0;    no es necesario iniciarlo con cero pesos
            //vm.newWeekObj.descuento = 100;
            vm.newWeekObj.percentage_des = 0;
            vm.newWeekObj.cost_des = 0;
            vm.fecha = $filter('date')(new Date(), 'MM/dd/yyyy');
            vm.newWeekObj.inicio_vigencia = $filter('date')(new Date(), 'MM/dd/yyyy');
            vm.newWeekObj.fin_vigencia = $filter('date')(new Date(), 'MM/dd/yyyy');
            vm.hora = '';

        }

        vm.saveNewRodada = () => {
            if (vm.newWeekObj.haveACode && vm.newWeekObj.type_code == 2 && vm.newWeekObj.cost_des > vm.newWeekObj.amount) {
                Materialize.toast('El descuento no puede ser mayor al precio', 4000);
                return;
            }
            vm.inputsToBlock = {};  //  libera los input condicionados
            if (vm.action == 0) {
                // SOLO GUARDA EN MEMORIA POR QUE SE PERSISTE UN OBJETO COMPLETO
                vm.saveNewRodada_newSE();
            } else if (vm.action == -1) {
                vm.saveUpdateChild();
            } else if (vm.action == 1) {
                vm.newWeekObj.id_weekend_rides = 0;
                vm.newWeekObj.id_promo_code = 0;
                vm.saveUpdateChild();
            }
        }

        vm.saveUpdateChild = () => {
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

                    if (new Date(vm.fecha) < new Date(vm.obj.start_date)) {
                        Materialize.toast('La fecha de rodada fuera de rango !', 5000);
                        return;
                    }

                    var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
                    vm.fynallyOBJ.id_user = aux[0];
                    vm.fynallyOBJ.token = aux[1];


                    vm.fynallyOBJ.id_weekend_rides = vm.newWeekObj.id_weekend_rides;
                    vm.fynallyOBJ.name = vm.newWeekObj.name;
                    vm.fynallyOBJ.place = vm.newWeekObj.place;
                    vm.fynallyOBJ.date = vm.fecha.split(/\//g)[2] + "-" + vm.fecha.split(/\//g)[0] + "-" + vm.fecha.split(/\//g)[1] + " " + vm.hora + ":00";

                    vm.fynallyOBJ.description = vm.newWeekObj.description;

                    vm.fynallyOBJ.amount = vm.newWeekObj.amount;
                    vm.fynallyOBJ.terms = vm.newWeekObj.terms;
                    vm.fynallyOBJ.id_promo_code = vm.newWeekObj.id_promo_code;
                    vm.fynallyOBJ.code = vm.newWeekObj.code;
                    vm.fynallyOBJ.start_date = vm.newWeekObj.inicio_vigencia.split(/\//g)[2] + "-" + vm.newWeekObj.inicio_vigencia.split(/\//g)[0] + "-" + vm.newWeekObj.inicio_vigencia.split(/\//g)[1];
                    vm.fynallyOBJ.end_date = vm.newWeekObj.fin_vigencia.split(/\//g)[2] + "-" + vm.newWeekObj.fin_vigencia.split(/\//g)[0] + "-" + vm.newWeekObj.fin_vigencia.split(/\//g)[1];
                    vm.fynallyOBJ.code = vm.newWeekObj.code;
                    vm.fynallyOBJ.amount_use = vm.newWeekObj.cantidad;
                    vm.fynallyOBJ.type_code = vm.newWeekObj.type_code;
                    vm.fynallyOBJ.id_special_event = vm.obj.id_special_events;     //  el id lo obtengo del evento pather
                    vm.fynallyOBJ.percentage_des = vm.newWeekObj.percentage_des;
                    vm.fynallyOBJ.cost_des = vm.newWeekObj.cost_des;

                    vm.fynallyOBJ.has_code = vm.newWeekObj.haveACode;
                    vm.fynallyOBJ.auto_code = vm.newWeekObj.isAutoGe;





                    DataServiceServer.saveUpdateChild(vm.fynallyOBJ)
                        .then(function successCallback(response) {
                            if (response == -3) {

                                $('.modal').modal('close');
                                Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                                AuthenticationService.ClearCredentials();
                                DataService.Delete();
                                $location.path("/login");
                                return;
                            }
                            vm.fynallyOBJ = {};
                            vm.ver_new_week = false;
                            swal(
                                `Guardado`,
                                `¡ Evento especial guardado !`,
                                'success'
                            )

                            vm.update_list();
                        }, function errorCallback(response) {

                            Materialize.toast('Service error', 5000);
                        });

                }
            })
        }

        vm.clearData = () => {
            $('#modal_new').modal('close');
            vm.obj = {};
            vm.verTodasRodadas = false;
            vm.rodadas = [];
            vm.fynallyOBJ = {};
        }


        vm.editChildMasive = (x, index) => {
            vm.indexWhenEditing = index;
            vm.ver_new_week = true;
            vm.newWeekObj = x;
            vm.fecha = $filter('date')(new Date(vm.newWeekObj.date), 'MM/dd/yyyy');
            vm.hora = $filter('date')(new Date(vm.newWeekObj.date), 'HH:mm');
            vm.newWeekObj.inicio_vigencia = vm.newWeekObj.inicio_vigencia;
            vm.newWeekObj.fin_vigencia = vm.newWeekObj.fin_vigencia;
            vm.newWeekObj.cantidad = vm.newWeekObj.cantidad;
            vm.newWeekObj.percentage_des = vm.newWeekObj.percentage_des;
            vm.newWeekObj.cost_des = vm.newWeekObj.cost_des;
        }


        vm.editChild = x => {
            vm.ver_new_week = true;
            vm.action = -1;
            //vm.newWeekObj = x;
            vm.newWeekObj.id_weekend_rides = x.id_weekend_rides;
            vm.newWeekObj.name = x.name;
            vm.newWeekObj.place = x.place;
            vm.newWeekObj.amount = x.amount;
            vm.newWeekObj.description = x.description;
            vm.newWeekObj.terms = x.terms;
            vm.fecha = $filter('date')(x.date, 'MM/dd/yyyy');
            vm.hora = $filter('date')(x.date, 'HH:mm');
            vm.newWeekObj.inicio_vigencia = x.start_date.split("-")[1] + "/" + x.start_date.split("-")[2] + "/" + x.start_date.split("-")[0];
            vm.newWeekObj.fin_vigencia = x.end_date.split("-")[1] + "/" + x.end_date.split("-")[2] + "/" + x.end_date.split("-")[0];
            vm.newWeekObj.cantidad = x.amount_use;
            vm.newWeekObj.percentage_des = x.percentage_des;
            vm.newWeekObj.cost_des = x.cost_des;
            vm.newWeekObj.haveACode = x.has_code;
            vm.newWeekObj.code = x.code;
            vm.newWeekObj.isAutoGe = x.auto_code;
            vm.newWeekObj.type_code = x.type_code == 0 ? 1 : x.type_code;
            // personas inscritas
            if (x.count_cof > 0) {
                vm.inputsToBlock.amount = true;
                vm.inputsToBlock.type_code = true;
            }
            if (vm.newWeekObj.haveACode) {
                vm.inputsToBlock.haveACode = true;
                vm.inputsToBlock.code = true;
            }
            if (vm.newWeekObj.isAutoGe) {
                vm.inputsToBlock.isAutoGe = true;
            }

        }

        vm.hora;
        vm.fecha;
        vm.saveNewRodada_newSE = () => {
            if (vm.action == 0) {
                //var dt = new Date(vm.fecha + " " + vm.hora + ":00").getTime();// - 25200000;
                vm.newWeekObj.date = vm.fecha.split(/\//g)[2] + "-" + vm.fecha.split(/\//g)[0] + "-" + vm.fecha.split(/\//g)[1] + " " + vm.hora + ":00";

                //vm.newWeekObj.type_code = vm.newWeekObj.type_code;

                vm.newWeekObj.active = true;



                // console.log(vm.newWeekObj.haveACode);
                if (vm.indexWhenEditing > -1)
                    vm.rodadas[vm.indexWhenEditing] = vm.newWeekObj;
                else
                    vm.rodadas.push(vm.newWeekObj);

                vm.newWeekObj = {};
                vm.hora = '';
                vm.fecha = '';
                swal(
                    `Guardado !`,
                    `Se ha guardado los cambios`,
                    'success'
                )
                vm.newWeek(false);
            }
        }

        vm.new = (action) => {
            if (action == 0) vm.rodadas = [];
            vm.action = action;
            vm.obj.id_special_events = action;
            $('#modal_new').modal('open');
        }


        vm.update_list = () => {
            var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
            DataServiceServer.getSpecialEventsDetails(aux[0], aux[1], vm.obj.id_special_events)
                .then(function successCallback(response) {
                    if (response == -3) {
                        $('.modal').modal('close');
                        Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                        AuthenticationService.ClearCredentials();
                        DataService.Delete();
                        $location.path("/login");
                        return;
                    }
                    vm.action = 1;
                    //Materialize.toast('List updated', 4000);
                    vm.rodadas = response.special_events_details;
                    vm.esperar = false;
                }, function errorCallback(response) {
                    vm.esperar = false;
                    Materialize.toast('ERROR POR CONEXION', 4000);
                });
        }

        vm.saveUpdate = () => {
            if (vm.action == 0) {
                vm.saveUpdateNew();
            } else if (vm.action == 1) {
                vm.saveUpdateEdit();
            }
        }

        vm.close_modal = () => {
            vm.obj = {};
            vm.rodadas = [];
            $('#modal_new').modal('close');
        }

        vm.saveUpdateEdit = () => {
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
                    vm.fynallyOBJ.id_user = aux[0];
                    vm.fynallyOBJ.token = aux[1];

                    vm.fynallyOBJ.name = vm.obj.name;
                    vm.fynallyOBJ.description = vm.obj.description;
                    vm.fynallyOBJ.terms = vm.obj.terms;
                    vm.fynallyOBJ.id_special_events = vm.obj.id_special_events;
                    vm.fynallyOBJ.start_date = vm.obj.start_date.split(/\//g)[2] + "-" + vm.obj.start_date.split(/\//g)[0] + "-" + vm.obj.start_date.split(/\//g)[1];
                    vm.fynallyOBJ.end_date = vm.obj.end_date.split(/\//g)[2] + "-" + vm.obj.end_date.split(/\//g)[0] + "-" + vm.obj.end_date.split(/\//g)[1];

                    DataServiceServer.saveUpdateEdit(vm.fynallyOBJ)
                        .then(function successCallback(response) {
                            if (response == -3) {
                                $('.modal').modal('close');
                                Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                                AuthenticationService.ClearCredentials();
                                DataService.Delete();
                                $location.path("/login");
                                return;
                            }

                            vm.fynallyOBJ = {};
                            vm.obj = {};
                            getSpecialEvents();
                            swal(
                                `Guardado`,
                                `¡ Evento especial guardado !`,
                                'success'
                            )
                            $('#modal_new').modal('close');
                        }, function errorCallback(response) {
                            Materialize.toast('ERROR POR CONEXION', 4000);
                        });

                }
            })
        }

        vm.saveUpdateNew = () => {
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
                    vm.fynallyOBJ.id_user = aux[0];
                    vm.fynallyOBJ.token = aux[1];
                    vm.fynallyOBJ.name = vm.obj.name;
                    vm.fynallyOBJ.description = vm.obj.description;
                    vm.fynallyOBJ.terms = vm.obj.terms;

                    vm.fynallyOBJ.start_date = vm.obj.start_date.split(/\//g)[2] + "-" + vm.obj.start_date.split(/\//g)[0] + "-" + vm.obj.start_date.split(/\//g)[1];
                    vm.fynallyOBJ.end_date = vm.obj.end_date.split(/\//g)[2] + "-" + vm.obj.end_date.split(/\//g)[0] + "-" + vm.obj.end_date.split(/\//g)[1];


                    vm.fynallyOBJ.weekend = [];
                    vm.rodadas.forEach(element => {
                        vm.fynallyOBJ.weekend.push(
                            [
                                element.name,
                                element.place,
                                element.date,
                                element.description,
                                `${element.amount}`,     //  costo
                                element.terms,
                                element.code == undefined ? '_' : element.code,
                                element.inicio_vigencia.split(/\//g)[2] + "-" + element.inicio_vigencia.split(/\//g)[0] + "-" + element.inicio_vigencia.split(/\//g)[1],
                                element.fin_vigencia.split(/\//g)[2] + "-" + element.fin_vigencia.split(/\//g)[0] + "-" + element.fin_vigencia.split(/\//g)[1],
                                `${element.cantidad}`,   // falta las veces que se ocuparan
                                `${element.type_code}`,
                                `${element.percentage_des}`, // porcentaje
                                `${element.cost_des}`,   // cantidad
                                `${element.haveACode}`,  // tiene codigo promocional ?
                                `${element.isAutoGe}`    // el codigo sera auto incrementable ?
                            ]
                        );

                    });
                    let varTemp = {};
                    varTemp = vm.fynallyOBJ;

                    DataServiceServer.setSpecialEventsAdminMassive(vm.fynallyOBJ)
                        .then(function successCallback(response) {
                            if (response == -3) {
                                $('.modal').modal('close');
                                Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                                AuthenticationService.ClearCredentials();
                                DataService.Delete();
                                $location.path("/login");
                                return;
                            }

                            //Materialize.toast('GUARDADO CON ÉXITO', 9000);
                            vm.fynallyOBJ = {};
                            getSpecialEvents();
                            swal(
                                `Guardado`,
                                `¡ Evento especial guardado !`,
                                'success'
                            )
                            $('#modal_new').modal('close');
                        }, function errorCallback(response) {
                            Materialize.toast('ERROR POR CONEXION', 4000);
                        });
                }
            })
        }


        vm.verTodasRodadas = false;
        vm.deleteWeekend = (week, hab, index) => {
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
                    if (vm.action == 0) {
                        let temp = vm.rodadas;
                        vm.rodadas = [];
                        temp.splice(index, 1);
                        vm.rodadas = temp;
                    } else {
                        var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
                        DataServiceServer.desableWeek({
                            "id_user": aux[0],
                            "token": aux[1],
                            "id_weekend": week.id_weekend_rides,
                            "active": hab
                        }).then(function (response) {
                            swal(
                                `${msg3} !`,
                                `Se ha ${msg3}  ${week.name}`,
                                'success'
                            )
                            ///
                            DataServiceServer.getSpecialEventsDetails(aux[0], aux[1], vm.obj.id_special_events)
                                .then(function successCallback(response) {


                                    if (response == -3) {
                                        $('.modal').modal('close');
                                        Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                                        AuthenticationService.ClearCredentials();
                                        DataService.Delete();
                                        $location.path("/login");
                                        return;
                                    }
                                    vm.rodadas = response.special_events_details;
                                    vm.esperar = false;
                                }, function errorCallback(response) {
                                    vm.esperar = false;
                                    Materialize.toast('ERROR POR CONEXION', 4000);
                                });
                            ///
                        });

                    }

                }
            })
        }

        vm.correctForm = () => {
            if (vm.newWeekObj.haveACode) {

                //  valido sitiene codigo
                if (vm.newWeekObj.code == '' || vm.newWeekObj.code == null)
                    return true;

                //  valido sitiene codigo
                if (vm.newWeekObj.cantidad == '' || vm.newWeekObj.cantidad == null)
                    return true;

                // válido porcentaje
                if (vm.newWeekObj.type_code == 1) {
                    if (vm.newWeekObj.percentage_des < 0 || vm.newWeekObj.percentage_des > 100)
                        return true;
                    return false;
                }

                if (vm.newWeekObj.type_code == 2) {
                    if (vm.newWeekObj.cost_des < 0)
                        return true;
                    return false;
                }

                return false;

            } else {
                return false;
            }
        }

        vm.deleteSpecialEvent = (week, hab) => {

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


                    DataServiceServer.desableSpecialEvents({
                        "id_user": aux[0],
                        "token": aux[1],
                        "id_special_events": week.id_special_events,
                        "active": hab
                    }).then(function (response) {


                        swal(
                            `${msg3} !`,
                            `Se ha ${msg3}  ${week.name}`,
                            'success'
                        )
                        getSpecialEvents();
                    });

                }
            })
        }

        vm.editWP = seD => {
            vm.action = 1;
            vm.obj = seD;
            if (seD.start_date.includes("-")) {
                vm.obj.start_date = seD.start_date.split("-")[1] + "/" + seD.start_date.split("-")[2] + "/" + seD.start_date.split("-")[0];
                vm.obj.end_date = seD.end_date.split("-")[1] + "/" + seD.end_date.split("-")[2] + "/" + seD.end_date.split("-")[0];
            }
            vm.esperar = true;

            var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
            DataServiceServer.getSpecialEventsDetails(aux[0], aux[1], vm.obj.id_special_events)
                .then(function successCallback(response) {
                    if (response == -3) {
                        $('.modal').modal('close');
                        Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                        AuthenticationService.ClearCredentials();
                        DataService.Delete();
                        $location.path("/login");
                        return;
                    }
                    vm.rodadas = response.special_events_details;
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
            getSpecialEvents();
        }

        function getSpecialEvents() {
            var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
            vm.esperar = true;
            DataServiceServer.getSpecialEvents(aux[0], aux[1])
                .then(function successCallback(response) {
                    if (response == -3) {
                        $('.modal').modal('close');
                        Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                        AuthenticationService.ClearCredentials();
                        DataService.Delete();
                        $location.path("/login");
                        return;
                    }
                    vm.items = response.special_events;
                    vm.esperar = false;

                }, function errorCallback(response) {
                    vm.esperar = false;
                    Materialize.toast('ERROR POR CONEXION', 4000);
                });
        }



        /****************************************************************************************************************************************************************** */
        /****************************************************************************************************************************************************************** */
        /****************************************************************************************************************************************************************** */

        vm.div_tracking = false;

        vm.repeat = 0;
        vm.confirmacion = false;
        vm.ride = {};
        vm.alertaParticipantes = [];
        vm.participantes = [];
        vm.NOk = false;
        vm.ride.emergency_number = '';
        vm.iterar = 0;
        vm.esperarTracking = false;
        vm.abierto = false;

        initComponents();

        vm.isOk = () => {
            var regex = new RegExp(/((^\d{10}$)|(^\d{2}[-|\s]?\d{2}[-|\s]?\d{2}[-|\s]?\d{2}[-|\s]?\d{2}$))/, 'g');
            if (regex.test(vm.ride.emergency_number)) {
                vm.NOk = true;
            } else {
                vm.NOk = false;
                return false;
            }
        }
        vm.verUser = item => {
            vm.mapWeek.setCenter({ lat: parseFloat(item.l.split(",")[0]), lng: parseFloat(item.l.split(",")[1]) });
            vm.mapWeek.setZoom(20);
        }

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
        function alertasF() {
            let flag = {};
            if (vm.alertaParticipantes.length > 0) {
                vm.alertaParticipantes.forEach(elem => {

                    if (elem.ec) {
                        flag.ec = true;
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
                /**
                 *  
                     console.log('vm.ride', vm.ride);
                
                     active: true
​
                    emergency_number: "1234567899"
                    ​
                    id_user: "6ddc2c4b-093a-4120-91d2-f089be51690d"
                    ​
                    id_weekend: 28
                    ​
                    token: "44407ddb-144b-4e6a-a11a-7b185928b2cd"
                */
                DataServiceServer.activeTracking(vm.ride)
                    .then(function successCallback(response) {
                        if (response == -3) {
                            $('.modal').modal('close');
                            Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                            AuthenticationService.ClearCredentials();
                            DataService.Delete();
                            $location.path("/login");
                            return;
                        }

                        vm.update_list();
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

                            $('#mec').css('visibility', 'hidden');
                            $('#med').css('visibility', 'hidden');
                            Materialize.toast('TRACKING PARADO', 2000);
                        }
                    }, function errorCallback(response) {
                        Materialize.toast('ERROR POR CONEXION', 4000);
                    });
            }
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
                        Materialize.toast(er.message, 2200);
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



        vm.tracking = x => {
            vm.div_tracking = true;
            vm.nameTracking = x.name;
            vm.repeat = x.repeat_time;

            vm.ride.active = x.tracking;
            vm.ride.id_weekend = x.id_weekend_rides;

            //      arranca modal
            vm.isOk();
            vm.abierto = true;
            vm.esperarTracking = false;

            // modal tracking iniciada
            if (vm.ride.active) {
                vm.esperarTracking = true;
                loadData();
            } else {
                getMyPosition();
                vm.centrar();
            }

        }

        vm.close = () => {
            vm.div_tracking = false;
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
        }

        /****************************************************************************************************************************************************************** */
        /****************************************************************************************************************************************************************** */
        /****************************************************************************************************************************************************************** */

    }
})();

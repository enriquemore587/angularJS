(function() {
  'use strict';
  angular
    .module('app')
    .controller('LoginController', LoginController);

  LoginController.inject = ['$location', 'AuthenticationService', 'FlashService', '$rootScope', '$timeout', 'DataService'];

  function LoginController($location, AuthenticationService, FlashService, $rootScope, $timeout, DataService) {

    var vm = this;
    vm.login = login;
    vm.forgot = false;
    vm.contact = [];
    (function initController() {
      
      $('.modal').modal('close');
      vm.forgot = true;
      vm.form = true;
      AuthenticationService.ClearCredentials();
      DataService.Delete();
    })();

    vm.pass = () => {
      swal({
        title: 'Escribe tu correo electrónico',
        input: 'email',
        showCancelButton: true,
        confirmButtonText: 'Recuperar',
        confirmButtonColor: '#FF3800',
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !swal.isLoading()
      }).then((result) => {
        if (result.value) {
          AuthenticationService.pass(result.value, response => {
            if (response.success == -9) {
              swal("App in Maintenance", "Favor de reportar!", "warning");
              $timeout(function () {
                  $rootScope.flash = false;
              }, 3500);
            } else if (response.success) {
              swal({
                type: 'success',
                title: 'Contraseña enviada!',
                html: 'email: ' + result.value
              })
              } else {
                swal("Correo No Registrado", "Correo No Registrado", "warning");
              }
          });

        }
      });
    }

    function login() {

      vm.dataLoading = true;
      vm.form = false;
      AuthenticationService.Login(vm.usermail, vm.password, function(response) {
        console.log(response);
        
        if (response.success == -9) {
          FlashService.Error(response.message);
          vm.form = true;
          vm.dataLoading = false;
          swal("Servicio no disponible", "Favor de reportar!", "warning");
          $timeout(function() {
            $rootScope.flash = false;
          }, 3500);
        } else if (response.success) {
          $location.path('/');
        } else {
          FlashService.Error(response.message);
          vm.form = true;
          vm.dataLoading = false;
          $timeout(function() {
            $rootScope.flash = false;
          }, 3500);
        }
      });
    };
  }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .factory('DataService', DataService);

        DataService.$inject = ['$q'];
    function DataService($q) {

        var service = {};

        service.Create = Create;
        service.Delete = Delete;
        service.GetAll =  GetAll;

        return service;

        function GetAll() {
            var deferred = $q.defer();
            deferred.resolve(getData());
            return deferred.promise;
        }

        function Create(modulos) {

            var dataModulos = [] ;

            for (var i = 0; i < modulos.length; i++) {
              dataModulos.push({
                    'index': modulos[i].id_module,
                    'name_module': modulos[i].name_module ,
                    'menu_module': modulos[i].menu_module,
                    'clef': modulos[i].clef
                });
            }

            var deferred = $q.defer();
            var data = getData();
            // save to local storage
            data.push(dataModulos);
            setData(dataModulos);
            return deferred.promise;
        }


//ok
        function Delete() {
            var deferred = $q.defer();

            localStorage.clear();
            deferred.resolve();

            return deferred.promise;
        }



         // private functions

         function getData() {
            if (!localStorage.data) {
                localStorage.data = JSON.stringify([]);
            }

            return JSON.parse(localStorage.data);
        }

        function setData(data) {
            localStorage.data = JSON.stringify(data);
        }

    }
})();

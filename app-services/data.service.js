(function () {
    'use strict';

    angular
        .module('app')
        .factory('DataServiceServer', DataServiceServer);

    DataServiceServer.$inject = ['$http', '$location'];
    function DataServiceServer($http, $location) {


        var service = {};

        service.getEvents = getEvents;
        service.saveUpdateEvent = saveUpdateEvent;
        service.getPackage = getPackage;
        service.saveUpdatePackage = saveUpdatePackage;
        service.getCollection_points = getCollection_points;
        service.getLocationGoogle = getLocationGoogle;
        service.saveUpdateEventsColctionP = saveUpdateEventsColctionP;
        service.getAddressByGoogle = getAddressByGoogle;
        service.getCheckIn = getCheckIn;
        service.checkIn = checkIn;
        service.getCheckOut = getCheckOut;
        service.checkOut = checkOut;
        service.deletecollpoints = deletecollpoints;
        service.getPagos = getPagos;
        service.pagos = pagos;
        service.getPagosP = getPagosP;
        service.payments = payments;
        service.confirmar = confirmar;
        service.packageComplete = packageComplete;
        service.addUser = addUser;
        service.getWeek = getWeek;
        service.activeTracking = activeTracking;
        service.getTracking = getTracking;
        service.saveWeek = saveWeek;
        service.getWeekById = getWeekById;
        service.contact = contact;
        service.getCatcontacto = getCatcontacto;
        service.getAllUsers = getAllUsers;
        service.saveUpdatecontacto = saveUpdatecontacto;
        service.getUsersdetail = getUsersdetail
        service.getChangePass = getChangePass;
        service.desableWeek = desableWeek;
        service.desableEvents = desableEvents;
        service.getPackageWRs = getPackageWRs;
        service.getPackageWRsUsers = getPackageWRsUsers;
        service.saveUpdatePWR = saveUpdatePWR;
        service.getSpecialEvents = getSpecialEvents;
        service.getSpecialEventsDetails = getSpecialEventsDetails;
        service.setSpecialEventsAdminMassive = setSpecialEventsAdminMassive;
        service.saveUpdateEdit = saveUpdateEdit;
        service.saveUpdateChild = saveUpdateChild;

        service.desableSpecialEvents = desableSpecialEvents;
        service.desableWeekendPackage = desableWeekendPackage;
        service.sendPushNotification = sendPushNotification;

        service.url2 = "https://s692755340.onlinehome.mx:8743";
        service.url = 'http://74.208.103.93:8780';

        return service;

        function sendPushNotification(obj) {
            return $http.post(service.url + '/noohwi/notification', obj, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
        }

        function saveUpdatecontacto(obj) {
            return $http.post(service.url + '/noohwi/contact', obj, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
        }

        function desableWeek(obj) {
            return $http.post(service.url + '/noohwi/weekendRides/active', obj, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    return false;
                });
        }

        function desableEvents(obj) {
            return $http.post(service.url + '/noohwi/events/active', obj, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    return false;
                });
        }

        function desableSpecialEvents(obj) {
            return $http.post(service.url + '/noohwi/Sevents/active', obj, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    return false;
                });
        }

        function desableWeekendPackage(obj) {
            return $http.post(service.url + '/noohwi/wrp/active', obj, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    return false;
                });
        }

        function getCatcontacto() {
            return $http.get(service.url + '/noohwi/catalogs/contactType',
                {}, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    if (response.data.message == "successful") {
                        return response.data.data;
                    }
                }, function errorCallback(response) {
                    return response;
                });
        }

        function getChangePass(id_user, token, password, passnew, callback) {
            var response2;
            $http.get(service.url + `/noohwi/user/chanpass?id_user=${id_user}&token=${token}&password=${password}&passnew=${passnew}`, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } }, { timeout: 100 })
                .then(function (response) {
                    if (response.data.status === 0) {
                        response2 = { success: true };
                    }
                    else {
                        response2 = { success: false, message: ' Error UserMail or Password is incorrect' };
                    }
                    callback(response2);
                })
                .catch(function (data, status) {
                    callback({ success: -9, message: ' lost Services ' });
                });

        }

        function getAllUsers(userId, token) {
            return $http.get(service.url + '/noohwi/user/all',
                { params: { id_user: userId, token: token } }, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    if (response.data.message == "successful") {
                        return response.data.data;
                    }
                }, function errorCallback(response) {
                    return response;
                });
        }

        function getUsersdetail(userId, token, id_user_details) {
            return $http.get(service.url + '/noohwi/user/details',
                { params: { id_user: userId, token: token, id_user_details: id_user_details } }, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    if (response.data.message == "successful") {
                        return response.data.data;
                    }
                }, function errorCallback(response) {
                    return response;
                });
        }

        function contact() {
            return $http.get(service.url + '/noohwi/contact',
                {}, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    if (response.data.message == "successful") {
                        return response.data.data;
                    }
                }, function errorCallback(response) {
                    return response;
                });
        }
        function getTracking(userId, token, id_weekend) {
            return $http.get(service.url + '/noohwi/tracking',
                { params: { id_user: userId, token: token, id_weekend: id_weekend } }, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    if (response.data.message == "successful") {
                        return response.data.data;
                    }
                }, function errorCallback(response) {
                    return response;
                });
        }
        function activeTracking(obj) {
            return $http.post(service.url + '/noohwi/tracking/active', obj, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
        }
        function saveWeek(obj) {
            return $http.post(service.url + '/noohwi/weekendRides', obj, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
        }

        function setSpecialEventsAdminMassive(obj) {
            return $http.post(service.url + '/noohwi/Sevents', obj, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
        }

        function getWeekById(userId, token, id) {
            return $http.get(service.url + '/noohwi/weekendRides/userAll',
                { params: { id_user: userId, token: token, id_weekend: id } }, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    if (response.data.message == "successful") {
                        return response.data.data;
                    }

                }, function errorCallback(response) {
                    return response;
                });
        }
        function getWeek(userId, token) {
            return $http.get(service.url + '/noohwi/weekendRides',
                { params: { id_user: userId, token: token } }, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    if (response.data.message == "successful") {
                        return response.data.data;
                    }

                }, function errorCallback(response) {
                    return response;
                });
        }

        function addUser(obj) {
            return $http.post(service.url + '/noohwi/user/add', obj, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
        }


        function packageComplete(obj) {
            return $http.post(service.url + '/noohwi/packages/complete', obj, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
        }

        function confirmar(obj) {
            return $http.post(service.url + '/noohwi/packages/confirm', obj, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
        }

        function pagos(obj) {
            return $http.post(service.url + '/noohwi/payments', obj, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
        }

        function getPagos(userId, token, id_event) {
            return $http.get(service.url + '/noohwi/payments/eventsList',
                { params: { id_user: userId, token: token, id_event: id_event } }, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
        }
        function getPagosP(userId, token) {

            return $http.get(service.url + '/noohwi/payments/packagesList',
                { params: { id_user: userId, token: token } }, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    if (response.data.message == "successful") return response.data.data;
                }, function errorCallback(response) {
                    return response;
                });
        }
        function getCheckIn(userId, token, id_event) {
            return $http.get(service.url + '/noohwi/events/userEventsIn',
                { params: { id_user: userId, token: token, id_event: id_event } }, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
        }
        function getCheckOut(userId, token, id_event) {
            return $http.get(service.url + '/noohwi/events/userEventsOut',
                { params: { id_user: userId, token: token, id_event: id_event } }, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
        }

        function deletecollpoints(obj) {
            return $http.post(service.url + '/noohwi/events/deletecollpoints', obj, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
        }
        function checkIn(obj) {
            return $http.post(service.url + '/noohwi/events/checkin', obj, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
        }

        function payments(obj) {
            return $http.post(service.url + '/noohwi/payments', obj, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
        }

        function checkOut(obj) {
            return $http.post(service.url + '/noohwi/events/checkout', obj, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
        }

        function saveUpdateEventsColctionP(obj) {
            return $http.post(service.url + '/noohwi/events/collpoints', obj, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(handleSuccess, handleError('Error Token Invalido'));
        }

        

        function getLocationGoogle(data) {
            return $http.get('https://maps.googleapis.com/maps/api/geocode/json',
                { params: { 'address': '1600+' + data, 'key': 'AIzaSyBRJU69bUCo-tNqjG8gLc1o5Q6tNXBj66E' } },
                { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    return response.data.results[response.data.results.length - 1].geometry.location;
                }, function errorCallback(response) {
                    return response;
                });
        }

        function getAddressByGoogle(data) {
            return $http.get('https://maps.googleapis.com/maps/api/geocode/json',
                { params: { 'latlng': data, 'key': 'AIzaSyBRJU69bUCo-tNqjG8gLc1o5Q6tNXBj66E' } },
                { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(function successCallback(response) {
                    return response.data.results[0].formatted_address;
                }, function errorCallback(response) {
                    return response;
                });
        }
        function saveUpdatePackage(id_user, token, id_package, name_package, description, terms, cost, status, profiles, polygon) {

            return $http.post(service.url + '/noohwi/packages',
                { id_user: id_user, token: token, id_package: id_package, name_package: name_package, description: description, terms: terms, cost: cost, status: status, profiles: profiles, polygon: polygon },
                { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(handleSuccess, handleError('Error Token Invalido'));
        }

        function getPackage(userId, token) {
            return $http.get(service.url + '/noohwi/packages',
                { params: { id_user: userId, token: token } }, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(handleSuccess, handleError('Error All Catalogo Almacenes '));
        }


        function getCollection_points(userId, token, id_event) {
            return $http.get(service.url + '/noohwi/events/collpoints',
                { params: { id_user: userId, token: token, id_event: id_event } }, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(handleSuccess, handleError('Error All Catalogo Almacenes '));
        }

        function getEvents(userId, token) {
            return $http.get(service.url + '/noohwi/events/admin',
                { params: { id_user: userId, token: token } }, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(handleSuccess, handleError('Error All Catalogo Almacenes '));
        }

        function getPackageWRs(userId, token) {
            return $http.get(service.url + '/noohwi/wrp',
                { params: { id_user: userId, token: token } }, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(handleSuccess, handleError('Error All Catalogo Almacenes '));
        }

        function getPackageWRsUsers(userId, token, id_wrp) {
            return $http.get(service.url + '/noohwi/wrp/users',
                { params: { id_user: userId, token: token, id_wrp: id_wrp } }, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(handleSuccess, handleError('Error All Catalogo Almacenes '));
        }

        function getSpecialEvents(userId, token) {
            return $http.get(service.url + '/noohwi/Sevents',
                { params: { id_user: userId, token: token } }, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(handleSuccess, handleError('Error All Catalogo Almacenes '));
        }

        function getSpecialEventsDetails(userId, token, id_special_events) {
            return $http.get(service.url + '/noohwi/Sevents/details',
                { params: { id_user: userId, token: token, id_special_events: id_special_events } }, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(handleSuccess, handleError('Error All Catalogo Almacenes '));
        }

        function saveUpdateEvent(obj) {
            return $http.post(service.url + '/noohwi/events', obj, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(handleSuccess, handleError('Error Token Invalido'));
        }

        function saveUpdatePWR(obj) {
            return $http.post(service.url + '/noohwi/wrp', obj, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(handleSuccess, handleError('Error Token Invalido'));
        }
        function saveUpdateEdit(obj) {
            return $http.post(service.url + '/noohwi/Sevents/title', obj, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(handleSuccess, handleError('Error Token Invalido'));
        }

        function saveUpdateChild(obj) {
            return $http.post(service.url + '/noohwi/Sevents/weekend', obj, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
                .then(handleSuccess, handleError('Error Token Invalido'));
        }


        // private functions
        function handleSuccess(res) {
            if (parseInt(res.data.status) == -3) {
                return -3;
            }
            return res.data.data;
        }

        function handleError(error) {
            return function () {
                return { success: false, message: error };
            };
        }
        function handleSuccessInUp(res) {
            return res.data.status;
        }
    }
})();

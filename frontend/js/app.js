var socket = io();

/* angular stuff */

var myApp = angular.module('myApp', []);


myApp.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
});

myApp.controller('ChatCtrl', ['$scope', 'socket', function($scope, socket) {
	
	$scope.currentName = "";
	$scope.messages = [];

	socket.on('init', function(data) {
		$scope.users = data.names;
		console.log(data);
	});

	socket.on('users:update', function(data) {
		$scope.users = data.names;
		console.log("got a new user list");
	});

	socket.on('send:message', function(data) {
		$scope.messages.push(data);
	});

	socket.on('change:name', function(name) {
		$scope.currentName = name;
		console.log('I changed my client name to ' + name);
	});

	$scope.changeName = function() {
		socket.emit('change:name', $scope.newName);
		$scope.currentName = $scope.newName;
		console.log("Changing name to " + $scope.newName);
	};

	$scope.sendMessage = function() {
		socket.emit('send:message', {
			name: $scope.currentName,
			body: $scope.message
		});
	};

}]);
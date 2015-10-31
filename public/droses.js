angular.module('drosesApp', [])
	.service('apiService', ['$http', function ($http) {
		var BASE = "/api/";

		this.findByName = function findByName(name) {
			return $http.get(BASE + name);
		};

		this.findAll = function findAll() {
			return $http.get(BASE);
		};
	}])
	.controller('controller', ['$scope', 'apiService', function ($scope, apiService) {
		apiService.findAll().then(function (res) {
			$scope.bodyParts = res.data;

			if (!_.isEmpty(dr.initial)) {
				$scope.active = _.find($scope.bodyParts, {
					name: dr.initial
				});
			}
		});

		$scope.click = function (part) {
			$scope.active = part;
		};
	}]);
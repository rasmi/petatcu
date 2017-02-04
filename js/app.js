var app = angular.module('petatcu', ['firebase', 'ui.bootstrap']).constant('_', window._);

app.controller('homeCtrl', ['$scope', '$firebaseObject', '$firebaseArray', '$firebaseAuth', '_',
function($scope, $firebaseObject, $firebaseArray, $firebaseAuth, _) {
    var ref = firebase.database().ref();
    var petsRef = $firebaseArray(ref.child('pets'));
    var usersRef = $firebaseArray(ref.child('users'));
    var obj = $firebaseObject(ref);

    $scope.auth = $firebaseAuth();

    petsRef.$loaded().then(function(data) {
        $scope.pets = data;
        console.log($scope.pets);
    });

    $scope.signIn = function() {
        $scope.auth.$signInWithPopup('facebook').then(function(result) {
            $scope.user = result.user;
            console.log('Signed in as:', result.user);
            $scope.filterPets($scope.pets);
        }).catch(function(error) {
            console.error('Authentication failed:', error);
        });
    }

    $scope.$watch('pets', function(pets) {
        $scope.filterPets(pets)
    });

    $scope.filterPets = function(pets) {
        if ($scope.user) {
            $scope.myPets = _.filter(pets, {'human': $scope.user.uid});
            $scope.favorites = _.filter(pets, 'favorited_by.'+$scope.user.uid);
        }
    }

    $scope.addingPet = false;
    $scope.addMyPet = function() {
        console.log('ADD MY PET');
        $scope.addingPet = true;
        var favorited_by = {}
        favorited_by[$scope.user.uid] = true
        $scope.newPet = {
            'name': '',
            'type': 'dog',
            'human': $scope.user.uid,
            'favorited_by': favorited_by
        }
    }

    $scope.submitNewPet = function() {
        $scope.pets.$add($scope.newPet);
        $scope.addingPet = false;
    }

    $scope.favoritePet = function() {
        console.log('FAVORITE PET');
    }
}]);
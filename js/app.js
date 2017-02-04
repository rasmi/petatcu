var app = angular.module('petatcu', ['firebase', 'ui.bootstrap']).constant('_', window._);

app
.controller('homeCtrl', ['$scope', '$firebaseObject', '$firebaseArray', '$firebaseAuth', '_',
function($scope, $firebaseObject, $firebaseArray, $firebaseAuth, _) {
    var ref = firebase.database().ref();
    var storageRef = firebase.storage().ref();
    var petsRef = ref.child('pets');
    var usersRef = ref.child('users');
    var obj = $firebaseObject(ref);

    $scope.auth = $firebaseAuth();

    var fetchData = function() {
        $firebaseArray(petsRef).$loaded().then(function(data) {
            $scope.pets = data;
            $scope.filterPets($scope.pets);
            console.log($scope.pets);
        });
    }
    fetchData();

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
        $scope.pets.$add($scope.newPet).then(function(data){
            console.log(data.key);
            function guid() {
                function s4() {return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);}
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
            }

            var f = document.getElementById('newPetPhoto').files[0];
            var metadata = { 'contentType': f.type };
            storageRef.child('images/' +guid()+'.'+f.name.split('.').pop()).put(f, metadata)
            .then(function(image) {
                petsRef.child(data.key).child('photoUrl').set(image.downloadURL).then(
                    function() {
                        fetchData();
                        $scope.addingPet = false;
                    });
            });
        });
    }

    $scope.isfavorite = function(pet) {
        return pet.favorited_by && pet.favorited_by[$scope.user.uid];
    }

    $scope.favorite = function(pet) {
        petsRef.child(pet.$id).child('favorited_by').child($scope.user.uid).set('true');
        fetchData();
    }

    $scope.unfavorite = function(pet) {
        console.log(pet);
        petsRef.child(pet.$id).child('favorited_by').child($scope.user.uid).remove();
        fetchData();
    }

    $scope.togglefavorite = function(pet) {
        if ($scope.isfavorite(pet)) {
            $scope.unfavorite(pet);
        } else {
            $scope.favorite(pet);
        }
    }
}])
.directive('pet', function() {
    return {
        restrict: 'E',
        templateUrl: 'views/pet.html',
        scope: {pet: '=', favorite: '&', unfavorite: '&', isfavorite: '&', togglefavorite: '&'}
    };
});
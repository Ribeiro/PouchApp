var example = angular.module('starter', ['ionic']);
var localDB = new PouchDB("todos");
var remoteDB = new PouchDB("http://localhost:5984/todos");

example.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }

        if(window.StatusBar) {
            StatusBar.styleDefault();
        }

    });

});

example.factory('PouchDBListener', ['$rootScope', function($rootScope) {

  localDB.sync(remoteDB, {live: true, retry: true})
         .on('change', function(change){

          if(change.change.docs[0]){
            if (!change.change.docs[0]._deleted) {
                $rootScope.$apply(function() {
                    localDB.get(change.change.docs[0]._id, function(err, doc) {
                        $rootScope.$apply(function() {
                            if(err){
                              alert(err);
                            }else {
                              $rootScope.$broadcast('add', doc);
                            }

                        })

                    });

                })

            } else {
                $rootScope.$apply(function() {
                    $rootScope.$broadcast('delete', change.change.docs[0]._id);
                });

            }

          }

         })
         .on('paused', function(info){
           console.log(info);

         })
         .on('active', function(info){
           console.log(info);

         })
         .on('error', function(err){
           console.log(err);

         });

    localDB.allDocs({
                      include_docs: true,
                      attachments: true
                    }).then(function (result) {
                      // handle result
                      var todos = result.rows.map(function(row) {
                                                      return row.doc;
                                                 });

                      $rootScope.$apply(function() {
                                           $rootScope.$broadcast('list', todos);
                                       });

                    }).catch(function (err) {
                      alert(err);

                    });

    return true;

}]);

example.controller("ExampleController", function($scope, $ionicPopup, PouchDBListener) {
    $scope.todos = [];

    $scope.create = function() {
        $ionicPopup.prompt({
            title: 'Enter a new TODO item',
            inputType: 'text'
        })
        .then(function(result) {
            if(result !== "") {
                if($scope.hasOwnProperty("todos") !== true) {
                    $scope.todos = [];
                }

                localDB.post({title: result});

            } else {
                alert("Please, enter TODO´s title !");
            }
        });
    }

    $scope.$on('add', function(event, todo) {
        $scope.todos.push(todo);
    });

    $scope.$on('list', function(event, rows) {
        $scope.todos = rows;
    });

    $scope.$on('delete', function(event, id) {
        for(var i = 0; i < $scope.todos.length; i++) {
            if($scope.todos[i]._id === id) {
                $scope.todos.splice(i, 1);
            }
        }
    });

});

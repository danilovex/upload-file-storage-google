/*global app*/
'use strict';
app.controller('Ctrl', function($scope) {
    // create a message to display in our view
    $scope.files = []; 

    $scope.upload = () => {

        debugger;

        var files = document.getElementById('importFile').files;
        var isMoreLimitSize = false;
        var nameMoreLimitSize = [];

        angular.forEach(files, (file, key) => {
            if ((file.size / 1000) > 1000) {
                isMoreLimitSize = true;
                nameMoreLimitSize.push(file.name);
            }
            
        });

        if(isMoreLimitSize){
            alert('Arquivos maiores que o limite:' + nameMoreLimitSize.join(','))
            return false
        }


        //console.log($scope.files)
    };
});

/*global app*/
'use strict';
app.controller('Ctrl', function($scope, $http) {

    $scope.files = []; 

    $scope.deleteFile = (name) => {
        let list = [];
        angular.forEach($scope.files, (file, key) => {
            if(file.name !== name)
                list.push(file);
        });
        $scope.files = list;
    };

    $scope.uploadToServer = () => {
        
        var fd = new FormData();

        angular.forEach($scope.files, (file, key) => {
            fd.append("file", file);
        });
    
        $http.post('api/upload-files', fd, {
            withCredentials: true,
            headers: {'Content-Type': undefined },
            transformRequest: angular.identity
        }).success((result) => {
            console.log(result);
            alert('Success import files!');
        }).error((err) => {
            console.log(err);
            alert('Ops...one or more errors occured =(')
        });
    
    };

    $scope.loadFiles = (files) => {

        var isMoreLimitSize = false;
        var nameMoreLimitSize = [];

        angular.forEach(files, (file, key) => {
            if ((file.size / 1000) > 1000) { ///maior que 1Mb
                isMoreLimitSize = true;
                nameMoreLimitSize.push(file.name);
            }
            
        });

        if(isMoreLimitSize){
            alert('Not permited import files more than 1Mb:' + nameMoreLimitSize.join(','))
            return false
        }

        $scope.files = files;
        $scope.$apply();

    };
});

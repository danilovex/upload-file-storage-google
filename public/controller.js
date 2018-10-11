/*global app*/
'use strict';
app.controller('Ctrl', function($scope, $http, $window, $q) {

    $scope.files = []; 
    $scope.filesUpload = [];
    $scope.loadItems = true;
    $scope.bucketName = 'clientxpto';

    $scope.downloadFile = (file) => {
        let name = file.name;
        let bucket = file.bucketName;        
        $http.get('api/files/link-download/?bucket=' + bucket + '&name='+ name).success((result) => {
            $window.open(result.link, '_blank');
        }).error((err) => {
            console.log(err);
            alert('Ops...one or more errors occured =(')
        }); 
    };

    $scope.deleteFile = (file) => {
        let list = [];
        let name = file.name;
        let bucket = file.bucketName;
        $http.delete('api/files?bucket=' + bucket + '&name='+ name).success((result) => {

            angular.forEach($scope.files, (file, key) => {
                if(file.name !== name)
                    list.push(file);
            });
            $scope.files = list;

            
        }).error((err) => {
            console.log(err);
            alert('Ops...one or more errors occured =(')
        }); 

    };

    function uploadToServer() {
        
        var promises = [];

        let param = '?bucketName=' + $scope.bucketName;
        let folder = $scope.folder;
        if(folder){
            param = param + '&folder=' + folder;
        }

        angular.forEach($scope.filesUpload, (file, key) => {

            let fd = new FormData();
            fd.append("file", file);

            promises.push($http.post('api/files' + param, fd, {
                withCredentials: true,
                headers: {'Content-Type': undefined },
                transformRequest: angular.identity
            }));
        });

        $q.all(promises).then((result) => {
            console.log(result);
            initialize();
            alert('Success import files!');
        }).catch((err) => {
            console.log(err);
            alert('Ops...one or more errors occured =(')
        });
    
    }

    function isNullOrEmpty(v){
        return v === null || v === undefined || v === '';
    }

    $scope.loadFiles = (files) => {

        var isMoreLimitSize = false;
        var nameMoreLimitSize = [];

        angular.forEach(files, (file, key) => {
            file['import'] = 'No';
            if ((file.size / 1000) > 1000) { ///maior que 1Mb
                isMoreLimitSize = true;
                nameMoreLimitSize.push(file.name);
            }
            
        });

        if(isMoreLimitSize){
            alert('Not permited import files more than 1Mb:' + nameMoreLimitSize.join(','))
            return false
        }

        if(isNullOrEmpty($scope.bucketName)){
            alert('BucketName is null!');
            return false;
        }

        $scope.filesUpload = files;
        $scope.$apply();

        uploadToServer();

    };


    function initialize(){
        $http.get('api/files').success((files) => {
            angular.forEach(files, (file, key) => {
                file['import'] = 'Yes';
            });
            $scope.files = files;
            $scope.loadItems = false;  
        }).error((err) => {
            console.log(err);
            alert('Ops...one or more errors occured =(')
        });   
    }

    initialize();


});

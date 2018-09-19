var app = angular.module('simplePage', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider)
{

   $routeProvider

   // para a rota '/', carregaremos o template home.html e o controller 'HomeCtrl'
   .when('/', {
      templateUrl : 'upload.html',
      controller     : 'Ctrl',
   })
   // caso não seja nenhum desses, redirecione para a rota '/'
   .otherwise ({ redirectTo: '/not-found' });
}]);

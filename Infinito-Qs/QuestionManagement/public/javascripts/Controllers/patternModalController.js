QuestionManagerApp.controller('patternModal', function ($scope, $uibModalInstance,$ajaxService) {

  $scope.ok = function () {
    $uibModalInstance.close($scope.patternName);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

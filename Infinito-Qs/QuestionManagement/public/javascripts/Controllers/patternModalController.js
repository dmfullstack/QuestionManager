QuestionManagerApp.controller('patternModal', function ($scope, $uibModalInstance) {

  $scope.ok = function () {
    $uibModalInstance.close($scope.patternName);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

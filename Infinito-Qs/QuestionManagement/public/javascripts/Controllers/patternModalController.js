QuestionManagerApp.controller('patternModal', function ($scope, $uibModalInstance, patternName) {

  $scope.patternName = patternName;

  $scope.ok = function () {
    $uibModalInstance.close($scope.patternName);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

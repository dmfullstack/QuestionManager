QuestionManagerApp.controller('qpSaveModal', function ($scope, $uibModalInstance, qpName) {

  $scope.qpName = qpName;

  $scope.ok = function () {
    $uibModalInstance.close($scope.qpName);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

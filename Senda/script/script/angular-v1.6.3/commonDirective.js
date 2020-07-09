(function() {
    'use strict';

    var codeData = {
        clickVM:'',
        result:'',
        index:''
    };
    var scanModel;
    var openscanModel = function(){
        setTimeout(function () {
            try{
                scanModel = api.require('y11');
            }catch(e){
                openscanModel();
            }

        },400)
    }
    openscanModel();


    angular
        .module('commonDirective', [])
        .directive('ngSelect', ngSelect)
        .directive('backButton', backButton)
        .directive('scanInput', scanInput)
        .directive('scanner', scanner);



    function ngSelect() {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                ngModel:'=',
                ngArray:'=',
                ngChange:'&'
            },
            template: '<div style="height:100%;">\
                       <input style="padding-left:15px;" ng-value="getArrayValue()" placeholder="{{ngPlaceholder}}" readonly  ng-click="openOption()"/>\
                       <div class="mask" ng-if="selectOption" ng-click="closeOption()" ></div>\
                       <div class="directive-select" ng-if="selectOption" >\
                       <ul>\
                       <li ng-repeat="row in ngArray" ng-click="getValue(row)" ng-class="{true:\'directive\-li\-on\'}[ngModel == row.id]" style="border-bottom:{{ifLastCheck($last)}}" >{{row.text}}</li>\
                     </ul>\
                     <div>\
                     </div>',
            controller: function($scope, $element, $attrs, $timeout) {

                $scope.ngPlaceholder = ($attrs['ngPlaceholder']);
                $scope.selectOption = false;

                $scope.getArrayValue = function() {
                    for (var i in $scope.ngArray) {
                        if ($scope.ngArray[i].id == $scope.ngModel) {
                            return $scope.ngArray[i].text;
                        }
                    }
                }
                $scope.ifLastCheck = function(index) {
                    if (index == true) {
                        return '0!important';
                    }
                }
                $scope.openOption = function() {
                    $scope.selectOption = true;
                }
                $scope.closeOption = function() {
                    $scope.selectOption = false;
                }
                $scope.getValue = function(row) {
                    $scope.ngModel = row.id;
                    $timeout(function() {
                        $scope.selectOption = false;
                        $scope.$eval($scope.ngChange);

                    }, 200);
                }

            },
            link: function(scope, iElement, iAttrs, controller) {

            }
        };

    }

    function backButton() {
        return {
            restrict: 'AE',
            replace: true,
            scope: true,
            template: '<div class="top-back-button" ng-click="backIndex()"><i class="fa fa-chevron-left"></i></div>',
            controller: function($scope, $element, $attrs, $timeout) {
                $scope.backIndex = function(){
                    api.closeWin();
                }
            },
            link: function(scope, iElement, iAttrs, controller) {

            }
        };
    }

    function scanInput() {
        return {
            restrict: 'AE',
            replace: true,
            scope: false,
            template: '<input type="text" ng-keydown="scanSet($event)" class="scan-input" ng-model="jsonString" />',
            controller: function($scope, $element, $attrs, $timeout) {


            },
            link: function(scope, iElement, iAttrs, controller) {
                function getFocus() {
                    iElement[0].setAttribute("readOnly",'true');;
                    setTimeout(function() {
                        iElement[0].focus();
                        iElement[0].removeAttribute("readOnly");
                    }, 300);
                }

                getFocus();

                $('body').click(function(e) {
                    if ($(e.target)[0].tagName.toLowerCase() != 'input' || $(e.target).attr('readonly')) {
                        getFocus();
                    }
                })

                scope.scanSet = function (e) {
                    //$('.top').append(e.keyCode);
                    if(e.keyCode == 13 || e.keyCode == 9){
                        e.preventDefault();
                        try {
                            codeData.result = scope.jsonString;
                            codeData.result = scope.$eval('('+codeData.result+')');
                            scope.jsonString = '';
                            scope.getCode(codeData)
                            codeData = {
                                clickVM:'',
                                result:'',
                                index:''
                            }
                        } catch (e) {
                            scope.jsonString = '';
                            codeData = {
                                clickVM:'',
                                result:'',
                                index:''
                            }
                            layer.msg('扫码出错,请重新扫描');
                        }finally{
                            return false;
                        }
                    }
                }
            }
        };
    }

    function scanner() {
        return {
            restrict: 'AE',
            replace: true,
            scope: false,
            controller: function($scope, $element, $attrs, $timeout) {

            },
            link: function(scope, iElement, iAttrs, controller, $timeout) {

                $(iElement).click(function () {
                    if(scope.$index != undefined){
                        codeData.index = scope.$index;
                    }
                    codeData.clickVM = iAttrs['ngModel'];
                    try{
                        var deviceName = api.deviceModel;
                        if(deviceName.indexOf('NLS') > -1){
                            scanModel.scanNewLand();
                        }else{
                            scanModel.scan();
                        }

                    }catch(e){
                        openscanModel();
                    }

                })
            }
        };
    }



})();

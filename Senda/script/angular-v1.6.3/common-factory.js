(function() {
    'use strict';

    angular
        .module('myApp')
        .factory('commonFactory', commonFactory);

    function commonFactory($timeout, $interval) {

        var that = this;

        that.ifSubmit = false;

        that.version = function() {
            if(!localStorage.getItem('version')){
                return '0.0.1';
            }else{
                return localStorage.getItem('version');
            }
        };

        that.url = function() {
            if (localStorage.getItem('url') == null) {
                return '';
            } else {
                return localStorage.getItem('url');
            }
        }

        that.setIP = function(ipString) {
            localStorage.setItem('url',ipString);

        }

        that.updateUrl = function() {
            return ('http://' + that.url() + '/PCodeClient/api.ashx?cmdapi=getapkInfo');
        }


        that.nullCheck = function(data) {
            if (data && data != null && data != '') {
                return true;
            } else {
                return false;
            }
        }

        that.numberCheck = function(data) {
            var reg = /^[0-9]+$/;
            if (!reg.test(data)) {
                return false;
            } else {
                return true;
            }
        }

        that.phoneCheck = function(data) {
            var reg = /^[0-9]+$/;
            if (!reg.test(data)) {
                return false;
            } else {
                if (data.toString().length == 11) {
                    return true;
                } else {
                    return false;
                }
            }
        }


        that.removeRepeat = function(data) {
            var arr = [];
            for (var i in data) {
                if (arr.indexOf(data[i]) < 0) {
                    arr.push(data[i]);
                }
            }
            return arr;
        }

        that.splitArray = function(data, num) {
            var length_ = Math.ceil(data.length / num);
            var mainArr = [];
            for (var i = 0; i < length_; i++) {
                var nodeArr = [];
                for (var j = i * num; j < i * num + num; j++) {
                    if (data[j]) {
                        nodeArr.push(data[j]);
                    }
                }
                mainArr.push(nodeArr)
            }
            return mainArr;
        }

        that.shieldRightKey = function() {
            document.oncontextmenu = function() {
                return false;
            };
            document.onkeydown = function() {
                if (window.event && window.event.keyCode == 123) {
                    event.keyCode = 0;
                    event.returnValue = false;
                    return false;
                };
            };
        }


        //点击更新app
        that.ifUpdateNow = false;
        that.appUpdate = function() {
            if(that.ifUpdateNow) {
                layer.msg('正在更新,请勿重复点击');
                return;
            }
            var downloadLayer = '';
            api.ajax({
                url: that.updateUrl(),
                method: 'post',
                data: {
                    values: {}
                }
            }, function(ret, err) {
                if (ret) {
                    if (ret.status == 200) {
                        var result = ret;
                        that.ifUpdateNow = true;

                        var savepath = 'fs://ZH-' + new Date().getTime() + '.apk';
                        api.download({
                            url: 'http://' + that.url() + result.path,
                            savePath: savepath,
                            report: true,
                            cache: true,
                            allowResume: true
                        }, function(ret, err) {
                            if (downloadLayer == '') {
                                downloadLayer = layer.open({
                                    btn: ['转到后台执行'],
                                    closeBtn: 0,
                                    title: '正在下载中...',
                                    content: '下载进度：<span id="downloadPercent">0</span>%'
                                });
                            }
                            if (ret.state == 1) {

                                that.ifUpdateNow = false;

                                layer.close(downloadLayer);
                                localStorage.setItem('version',result.V);
                                api.installApp({
                                    appUri: savepath
                                });
                            } else {
                                $("#downloadPercent").html(ret.percent);
                            }
                        });
                    }

                }
            });
        }

        //自动检测更新
        that.repeatCheckUpdate = function() {
            var downloadLayer = '';
            var repeatUpdate = function () {
                api.ajax({
                    url: that.updateUrl(),
                    method: 'post',
                    data: {
                        values: {}
                    }
                }, function(ret, err) {
                    if (ret) {
                        if (ret.status == 200) {
                            var result = ret;
                            if (result.V != that.version()) {

                                layer.confirm('发现新版本,是否更新?', {
                                    closeBtn:0,
                                    btn: ['确定', '取消']
                                }, function() {
                                    var savepath = 'fs://ZH-' + new Date().getTime() + '.apk';
                                    api.download({
                                        url: 'http://' + that.url() + result.path,
                                        savePath: savepath,
                                        report: true,
                                        cache: true,
                                        allowResume: true
                                    }, function(ret, err) {
                                        if (downloadLayer == '') {
                                            downloadLayer = layer.open({
                                                btn: ['转到后台执行'],
                                                closeBtn: 0,
                                                title: '正在下载中...',
                                                content: '下载进度：<span id="downloadPercent">0</span>%'
                                            });
                                        }
                                        if (ret.state == 1) {
                                            layer.close(downloadLayer);
                                            localStorage.setItem('version',result.V);
                                            api.installApp({
                                                appUri: savepath
                                            });
                                        } else {
                                            $("#downloadPercent").text(ret.percent);
                                        }
                                    });

                                }, function() {
                                    localStorage.setItem('ifStopCheck','1');
                                    layer.msg('直到下次登录将不再提示更新!');

                                });
                            } else {
                                if(localStorage.getItem('ifStopCheck') == '0'){
                                    $timeout(repeatUpdate,1000*60*5);
                                }

                            }
                        }

                    }
                });
            }
            repeatUpdate();
        }

        $timeout(function () {
            if(!localStorage.getItem('ifStopCheck') || localStorage.getItem('ifStopCheck') == '0'){
                localStorage.setItem('ifStopCheck','0');
                that.repeatCheckUpdate();
            }
        },4000);



        that.ajax = function (cmd, parm, callback) {
            if(that.ifSubmit){
                return false;
            }
            that.ifSubmit = true;
            var url = 'http://' + that.url() + '/PCodeClient/api.ashx' + '?cmd=' + cmd;
            if (that.ifDebugging() == '1') {
                alert(cmd + '传参' + '\n' + JSON.stringify(parm));
            }
            //读取当前网络环境
            var wangluo = api.connectionType;
            if (wangluo == "none") {
                alert('请连接网络后重试...', 2000, 'x');
                return;
            }
            parm = angular.extend({sb:'测试参数---'+new Date().getTime()},parm);
            $.ajax({
                url: url,
                data: parm,
                async: true,
                type: "POST",
                timeout: 20000, //超时时间设置，单位毫秒
                dataType: 'json',
                success: function (ret) {
                    that.ifSubmit = false;
                    if (ret) {
                        if (that.ifDebugging() == '1') {
                            alert(cmd + '返回' + '\n' + JSON.stringify(ret));
                        }
                        if (ret.status && ret.status == 200) {
                            $timeout(function () {
                                callback(ret.msg);
                            }, 1);
                        } else {
                            alert(JSON.stringify(ret));
                        }
                    } else {
                        layer.msg('请求超时');
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    that.ifSubmit = false;
                }
            });


        }
        //that.ajax = function(cmd, parm, callback) {
        //    var url = 'http://' + that.url() + '/PCodeClient/api.ashx' + '?cmd=' + cmd;
        //    if (that.ifDebugging() == '1') {
        //        alert(cmd + '传参' +  '\n' + JSON.stringify(parm));
        //    }
        //    api.ajax({
        //        url: url,
        //        method: 'post',
        //        data: {
        //            values: parm
        //        }
        //    }, function(ret, err) {
        //        if (ret) {
        //            if (that.ifDebugging() == '1') {
        //                alert(cmd + '返回' + '\n' + JSON.stringify(ret));
        //            }
        //            if (ret.status && ret.status == 200) {
        //                $timeout(function() {
        //                    callback(ret.msg);
        //                }, 1);
        //            } else {
        //                alert(ret.error);
        //            }
        //        }else{
        //            layer.msg('请求超时');
        //        }
        //    });
        //}

        that.ajaxSubmit = function(cmd, parm, callback) {
            if(that.ifSubmit){
                return false;
            }
            that.ifSubmit = true;
            var url = 'http://' + that.url() + '/PCodeClient/api.ashx' + '?cmd=' + cmd;
            if (that.ifDebugging() == '1') {
                alert(cmd + '传参' + '\n' + JSON.stringify(parm));
            }
            //读取当前网络环境
            var wangluo = api.connectionType;
            if (wangluo == "none") {
                alert('请连接网络后重试...', 2000, 'x');
                return;
            }
            parm = angular.extend({sb:'测试参数---'+new Date().getTime()},parm);
            $.ajax({
                url: url,
                data: parm,
                async: true,
                type: "POST",
                timeout: 20000, //超时时间设置，单位毫秒
                dataType: 'json',
                success: function (ret) {
                    that.ifSubmit = false;
                    if (ret) {
                        if (that.ifDebugging() == '1') {
                            alert(cmd + '返回' + '\n' + JSON.stringify(ret));
                        }
                        if (ret.status && ret.status == 200) {
                            $timeout(function () {
                                callback(ret.msg);
                            }, 1);
                        } else {
                            alert(JSON.stringify(ret));
                        }
                    } else {
                        layer.msg('请求超时');
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    that.ifSubmit = false;
                }
            });
        }

        //是否开启调试
        that.ifDebugging = function() {
            if (localStorage.getItem('ifDebugging') == null) {
                localStorage.setItem('ifDebugging', '0');
            }
            return localStorage.getItem('ifDebugging');
        }
        //开启(关闭)调试
        that.changeDebugging = function() {
            if (that.ifDebugging() == '0') {
                localStorage.setItem('ifDebugging', '1');
            } else {
                localStorage.setItem('ifDebugging', '0');
            }
        }

        return that;
    }

})();

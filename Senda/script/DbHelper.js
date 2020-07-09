var db = {
    /*
        //获取当天时间
        var datatime=db.dateFtt("yyyy-MM-dd",new Date());
        */
    //时间格式化
    dateFtt: function (fmt, date) {
        //author: meizz
        var o = {
            "M+": date.getMonth() + 1,                 //月份
            "d+": date.getDate(),                    //日
            "h+": date.getHours(),                   //小时
            "m+": date.getMinutes(),                 //分
            "s+": date.getSeconds(),                 //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    },
    //检查前缀
    qz: function (v, datarow) {
        if (v == undefined) return false;
        //vs里的元素分别表示现存、拆分、形态、到货、采购、退料、产品、托码
        //datarow=['XC', 'ZM', 'XT', 'DH', 'CG', 'TL', 'CP', 'TM'];
        var vs = datarow;
        for (var x in vs) {
            if (v.indexOf(vs[x]) != -1)
                return true;
        }
        return false;
    },
    //监听声音键
    syjt: function (fun) {
        api.addEventListener({ name: 'volumeup' }, function (ret, err) {
            if (fun != undefined) fun(ret, err);
        });
    },
    //基础配置
    config: {
        ip: "http://192.168.1.115:8046/",//请求IP
        url: "PCodeClient/api.ashx",//接口地址
        ajaxStatus: true//ajax防止重复提交处理
    },
    S4: function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    },
    //var myID = "static" + guid();
    guid: function () {
        return (this.S4() + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + this.S4() + this.S4());
    },
    //解析ajax返回数据，是否正确
    dfc: function (ret, msg) {
        if (msg == undefined) msg = "网络连接不稳定，请联系IT部门！";
        try {
            var data = eval('(' + ret + ')');
            if (db.Data.JsonGet(data, "status", "") == "200") {
                return true;
            } else {
                alert("ERROR1:" + ret);
                return false;
            }
        } catch (e) {
            alert("ERROR2:" + msg + e);
            return false;
        }
    },
    //登陆信息
    login: {
        Userid: function () {
            var Uid = db.Data.get("loginname");
            return Uid;
        },
        UserData: function () {
            var UserDate = db.Data.get("UserDate");
            return UserDate;
        }
    },
    //打开窗体
    openWin: function (opt) {
        var now = new Date();
        opt = $.extend(true, {
            name: "openwin" + now.getTime(),
            url: './page1.html',
            pageParam: {
                name: 'test'
            }
        }, opt);
        if (db.sb.systemType() != "ios") {
            opt.delay = 100;
        } else {
            opt.delay = 0;
        }
        api.openWin(opt);
    },

    /********************************时间日期选择 begin*******************************/
    //获取当前时间
    nowDate: function () {
        var now = new Date();

        var year = now.getFullYear();

        var month = now.getMonth() + 1;
        if (month > 12) month = 1;
        var date = now.getDate();

        return {
            year: year,
            month: month,
            day: date,
            getTime: now.getTime()
        };
    },
    /********************************时间日期选择 end*******************************/
    //读取登录用户的保留信息
    getCurrentUser: function () {
        var opt = {
            userName: '' + db.Data.get("loginname"),
            userPassWord: '' + db.Data.get("loginpassword"),
            quyuId: '' + db.Data.get("quyuID"),
            quyuName: '' + db.Data.get("quyuName")
        };
        return opt;
    },

    //网络设备监听
    wangluo: {
        //网络已连接
        OK: function () {
            api.addEventListener({
                name: 'online'
            }, function (ret, err) {
                lb.Prefs.set("network", {
                    value: '连接'
                });
                lb.network.Type(); //刷新网络类型
            });
        },
        //监听网络连接断开
        ON: function () {
            api.addEventListener({
                name: 'offline'
            }, function (ret, err) {
                lb.Prefs.set("network", {
                    value: '断开'
                });
                lb.network.Type(); //刷新网络类型
            });
        },
        //网络类型
        Type: function () {
            var connectionType = api.connectionType; //网络监听
            //		unknown 未知
            //		ethernet 以太网
            //		wifi wifi
            //		2g 2G网络
            //		3g 3G网络
            //		4g 4G网络
            //		none 无网络
            return connectionType;
        }
    },
    //允许多次提交
    submitData: function (Cmd, data, fun, jz, _IP1) {
        var wangluo = db.wangluo.Type(); //读取当前网络环境
        if (wangluo == "none") {
            alert("请连接网络后重试...");
            return;
        }
        //请求默认路径
        var linshiUrl = db.config.url;
        //接口组合
        var urls = "http://" + db.Data.get("IP") + "/" + linshiUrl + '?cmd=' + Cmd + '&sb=手持PDA';
        if (_IP1 != undefined) urls = "http://" + _IP1 + "/" + linshiUrl + '?cmd=' + Cmd + '&sb=手持PDA';
        //alert(urls);
        if (jz == undefined)
            db.Ts.jiazaiShow();//加载显示

        data = $.extend({
            timevv:'vv'+new Date().getTime()//时间戳
        }, data);
        $.ajax({
            url: urls, data: data, type: "POST", timeout: 20000, dataType: 'json',
            success: function (ret1) {
                db.Ts.jiazaiHide();
                // alert("url:"+urls +"\r\n 参数"+JSON.stringify(data)+"\r\n 返回"+JSON.stringify(ret1));
                if (typeof (ret1) == "object") {
                    try {
                        if (ret1.status == "200") {
                            //数据转换
                            var ret = ret1.msg;
                            fun(ret, ret1);
                        } else {
                            db.Ts.toast(ret1.error);
                        }
                    } catch (e) { }
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                db.Ts.jiazaiHide();
                //time: lb.ty.getNowDateTime(),
                //error: "textStatus:" + JSON.stringify(textStatus) + " \r\n XMLHttpRequest:"
                //    + JSON.stringify(XMLHttpRequest) + "\r\n errorThrown：" + JSON.stringify(errorThrown)
            },
            complete: function (XMLHttpRequest, status) { //求完成后最终执行参数
                db.Ts.jiazaiHide();
                // 设置timeout的时间，通过检测complete时status的值判断请求是否超时，如果超时执行响应的操作
                if (status == 'timeout') { //超时,status还有success,error等值的情况
                    db.Ts.toast("400:请求超时")
                }
            }
        });
    },
    //执行另外一个服务器的sql逻辑
    /*
        //alert('接口执行成功。接着执行跨库ajax');
        db.submitKK(das[0].FCode, das[0].FName, function (ret1, err1) {
            //alert('成功进入跨库操作');
            //alert(ret1);
            //验证服务端是否执行正确，不正确则内部直接提示错误信息
            if (!db.dfc(ret1)) return;
            //
            var data1 = eval('(' + ret1 + ')');
            var das1 = data1.msg.ds;
            var status1 = das1[0].status, msg1 = das1[0].msg;
            if (status1 != '000000') { alert('跨库执行错误，请联系IT部门！'); }
        });
    */
    submitKK: function (FCode, FName, fun) {
        if (this.ajaxNo == undefined) this.ajaxNo = 0;
        this.ajaxNo++;
        api.ajax({
            url: "http://" + db.Data.get("IP") + "/PCodeClient/PCodeClientApi.aspx?cmd=10009",
            method: 'post',
            dataType: 'text',
            tag: 'tag' + this.ajaxNo,
            returnAll: false,
            data: {
                values: {
                    //连接字符串
                    FCode: FCode,
                    //需要执行的MSSQL代码
                    FName: FName
                }
            }
        }, function (ret, err) {
            //关闭当前执行，防止重复提交
            api.cancelAjax({ tag: 'tag' + this.ajaxNo });
            if (fun != undefined) fun(ret, err);
        });
    },
    //获取随机数
    GetRandomNum: function (Min, Max) {
        /*

var num = GetRandomNum(1,10);
alert(num);
        */
        var Range = Max - Min;
        var Rand = Math.random();
        return (Min + Math.round(Rand * Range));
    },
    //允许多次提交
    submit: function (Cmd, data, fun, _IP1) {
        var blName = "a" + Cmd + db.GetRandomNum(1, 100);
        //避免apicloud的Ajax执行在超时情况下执行了2次
        window['' + blName] = false;
        //请求默认路径
        var linshiUrl = db.config.url;
        //接口组合
        var urls = "http://" + db.Data.get("IP") + "/" + linshiUrl + '?cmd=' + Cmd;
        if (_IP1 != undefined) urls = "http://" + _IP1 + "/" + linshiUrl + '?cmd=' + Cmd;
        //alert(urls);
        api.ajax({
            url: urls,
            tag: 'tag' + Cmd,
            method: 'post',
            dataType: 'text',
            returnAll: false,
            data: {
                values: data
            }
        }, function (ret, err) {
            //避免apicloud的Ajax执行在超时情况下执行了2次
            if (window['' + blName]) return;
            //避免apicloud的Ajax执行在超时情况下执行了2次
            window['' + blName] = true;

            fun(ret, err);
            //关闭当前执行，防止重复提交
            //api.cancelAjax({ tag: 'tag' + Cmd });
        });
    },
    //弹出框
    alert: function (msg, icon, time, tt) {
        layer.alert(
        	//显示的提示信息
        	'' + msg + '',
            {
                title: tt == undefined ? '提示框5秒后自动消失！' : tt,
                //5秒后自动消失提示框
                time: time == undefined ? 5000 : time,
                //0：表示警示图标 1：表示成功图标2：表示错误图标
                icon: (icon == undefined ? 0 : icon),
                skin: 'layer-ext-moon'
            });
    },
    //请求服务器
    ajax: function (fun, Cmd, method, data, opt) {
        /*
		 * opt对象扩展文档
		 * opt.U 判断用户是否登陆 1是 其他则不验证
		 * opt.J 是否显示加载进度条 1不显示 他则显示
		 * opt.Ip 更新路径 ip
		 * opt.Url 是否更新请求地址 有则更新路径 ip不变
		 * opt.Upload 是否是图片上传方式 1代表图片+普通上传  其它则普通上传
		 */

        //防止重复提交
        if (db.config.ajaxStatus == false) {
            db.Ts.toast("请勿频繁操作...", 2000, "x");
            return;
        }

        //禁止提交
        db.config.ajaxStatus = false;

        //检测网络环境
        var network = db.network.Type();
        if (network == "none") {
            //解除提交
            db.config.ajaxStatus = true;
            db.Ts.toast("请连接网络后重试...", 2000, "x"); return;
        }

        //判断是否需要验证用户登录
        if (opt.U == 1) {
            if (db.login.Userid() <= 0) {
                db.Ts.toast("请登录后操作", 2000, "x"); return;
            }
        }

        //如果opt对象J等于1 则隐藏   其他则显示
        if (opt.J != 1) {
            db.Ts.jiazaiShow(opt);//加载显示
        }

        //是否重配URL路径/如果检测到用新的URL配置则以当前配置为准
        var opturl = db.Data.JsonGet(opt, "Url", "");
        var linshiUrl = "";//定义临时请求路径
        if (opturl != "") {
            linshiUrl = opturl;//有定义新路径
        } else {
            linshiUrl = db.config.url;//请求默认路径
        }
        //接口组合
        var urls = "http://" + db.Data.get("IP") + "/" + linshiUrl + '?cmd=' + Cmd;

        //默认普通提交方式
        if (db.Data.JsonGet(opt, "Upload", "") == "") {
            api.ajax({
                url: urls,
                method: method,
                dataType: 'text',
                returnAll: false,
                data: {
                    values: data
                }
            }, function (ret, err) {
                //解除提交限制
                db.config.ajaxStatus = true;

                db.Ts.jiazaiHide();

                fun(ret, err);
            });
        } else {
            //图片上传
            api.ajax({
                url: urls,
                method: method,
                dataType: 'text',
                returnAll: false,
                data: data
            }, function (ret, err) {
                //解除提交限制
                db.config.ajaxStatus = true;
                db.Ts.jiazaiHide();
                fun(ret, err);
            });
        }
    },

    //JS扩展
    JS: {

        //分割成数组
        Split: function (data, zifu) {
            var arr = new Array();
            if (data == undefined || data == "") { return arr; }
            //去掉字符串第一个截取字符
            if (data.charAt(0) == zifu) {
                data = data.substr(1);
            }
            //去掉字符串最后一个截取字符
            if (data.substr(-1) == zifu) {
                data = data.substring(0, data.length - 1);
            }
            //返回数据结果
            arr = data.split(zifu);
            return arr;
        },

        //跨脚本执行
        execScript: function (opt) {
            opt = $.extend(true, {
                name: 'winName',
                frameName: 'frmName',
                script: 'test()'
            });
            api.execScript(opt);
        },
        // 获取当前的时间，拼接成2015-11-09这样的格式，主要用于对图片进行时间分类
        GetDatetime: function () {
            var date = new Date();
            var seperator1 = "-";
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var strDate = date.getDate();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            var currentdate = year + seperator1 + month + seperator1 + strDate
            return currentdate;
        },
        //随机数生成
        suijishu: function () {
            function S4() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }
            return (S4() + "-" + S4() + "-" + S4());
        },
        // 图片压缩
        // imgsrc：源图片的路径
        // quality：图片压缩质量，一般建议0.5
        // scale：图片压缩比例，也是建议0.5
        // ext：源图片拓展名
        // callback：转换成功之后回调函数
        yasuoImg: function (imgsrc, quality, scale, ext, show) {
            // 压缩文件的保存目录
            var savePath = db.sb.SaveUrl() + "/" + db.JS.GetDatetime() + "/";
            // 压缩文件生成的随机文件名称
            var savename = db.JS.suijishu() + "." + ext;
            var imageFilter = api.require('imageFilter');
            imageFilter.compress({
                img: imgsrc,
                quality: quality,
                scale: quality,
                save: {
                    album: false,
                    imgPath: savePath,
                    imgName: savename
                }
            }, function (ret, err) {
                if (ret.status) {
                    show(savePath + savename);
                } else {
                    show("");
                }
            });
        },
        // 获取文件拓展名
        getExt: function (fileName) {
            return fileName.substring(fileName.lastIndexOf('.') + 1);
        }
    },

    //数据
    Data: {

        //存储数据
        set: function (key, val) {
            //api.setPrefs({key: key,value: val});

            if (window.localStorage) {
                //this.del(key);
                window.localStorage.setItem(key, val);
            } else {
                //当前浏览器不支持 localStorage
            }
        },
        //获取数据
        get: function (key) {
            /*
            var retStr = api.getPrefs({sync:true,key:key});
            if (retStr == undefined) retStr = '';
            if (retStr == null) retStr = '';
	        //同步返回结果：
			return retStr;
			*/

            if (window.localStorage) {
                var retStr = '';
                retStr = window.localStorage.getItem(key);
                if (retStr == null) retStr = '';
                if (retStr == undefined) retStr = '';
                return retStr;
            } else {
                //当前浏览器不支持 localStorage
            }
            return '';
        },
        //删除存储数据
        remove: function (name) {
            api.removePrefs({ key: name });
        },
        //转换成整数
        toInt: function (val, moren) {
            if (moren == undefined) moren = 0;
            if (val == undefined || val == null || val == "") return moren;
            var v = parseInt(val);
            if (isNaN(v)) v = moren;
            return v;
        },
        //转换成带小数点数字
        toFolat: function (_value1, _default) {
            if (_default == undefined) _default = 0;
            if (_value1 == undefined) return _default;
            var v = parseFloat(_value1);
            if (isNaN(v)) v = _default;
            return v;
        },
        //是否是数字
        isFinite: function (_value1) {
            var v = isFinite(_value1);
            return v;
        },
        //参数解说
        /*
        _obj:需要操作的json对象
        _key1：需要取得节点名,
        _value1：如果节点不存在时，需要返回的默认值
        */
        JsonGet: function (obj, key, moren) {
            if (moren == undefined) moren = "";
            if (!this.is(obj, key)) { return moren; }
            return obj["" + key];
        },
        //是否存在节点
        is: function (obj, key) {
            return ("" + key in obj);
        },
        //二维码解析 ,type,show
        erweimajiexi: function (erweima, type, show) {
            try {
                var ewm = eval('(' + erweima + ')');
                var __n = db.Data.JsonGet(ewm, "n", "");
                var __k = db.Data.JsonGet(ewm, "k", "");
                __k = (__k == '' ? __n : __k);
                if (ewm.q == undefined || __n == "" || __k == "") {
                    //db.Ts.toast("二维码格式不正确", 2000, "x");
                    logMsgFun("二维码格式不正确");
                    return;
                }
                //多个类型
                var arrt = ',' + type + ',';
                //
                if (arrt.indexOf(',' + ewm.q + ',') == -1) {
                    logMsgFun("二维码不匹配");
                    return;
                }
                ////保温炉二维码特殊处理，不判断这个
                //if (ewm.q!='BW' && ewm.q != type) {
                //    logMsgFun("二维码不匹配");
                //    return;
                //}
                //回调
                show(__n, __k, ewm.q);
            } catch (e) {
                logMsgFun("二维码格式不正确");
                //db.Ts.toast("二维码格式不正确", 2000, "x");
            }
        },
        //随机二维码解析 ,type,show
        sjerweimajiexi: function (erweima, show) {
            alert(erweima);
            try {
                var ewm = eval('(' + erweima + ')');
                var __n = db.Data.JsonGet(ewm, "n", "");
                var __k = db.Data.JsonGet(ewm, "k", "");

                //回调
                show(db.Data.JsonGet(ewm, "q", ""), __n, (__k == '' ? __n : __k), db.Data.JsonGet(ewm, "g", ""));

            } catch (e) {
                show("", "", "", "");
            }
        }
    },

    //头部沉浸式动作判断
    fixStatusBar: function (dom) {
        var sysType = api.systemType;//获取系统类型
        var iostype = api.systemVersion;//获取当前版本
        var numSV = iostype.charAt(0);//截取系统版本 第一位
        var statusBar = db.sb.statusBar() //是否支持沉浸式
        if (statusBar == false) {
            return;
        }
        if (sysType == 'ios') {
            //IOS 7 以上才有沉浸式的内增高动作
            if (numSV >= 7 && !api.fullScreen && api.statusBarAppearance) {
                $(dom).css({ "padding-top": "20px" });
            }
        } else if (sysType == 'android') {
            //android 4.4 以上才有沉浸式的内增高动作
            if (numSV >= 4.4) {
                $(dom).css({ "padding-top": "25px" });
            }
        }
    },

    //网络
    network: {
        OK: function () {
            api.addEventListener({
                name: 'online'
            }, function (ret, err) {
                db.Prefs.set("network", { value: '连接' });
                db.network.Type();//刷新网络类型
            });
        },

        //  ==========
        //  = 监听网络连接断开 =
        //  ==========
        ON: function () {
            api.addEventListener({
                name: 'offline'
            }, function (ret, err) {
                db.Prefs.set("network", { value: '断开' });
                db.network.Type();//刷新网络类型
            });
        },
        //网络类型
        Type: function () {
            var connectionType = api.connectionType;//网络监听
            //		unknown 未知
            //		ethernet 以太网
            //		wifi wifi
            //		2g 2G网络
            //		3g 3G网络
            //		4g 4G网络
            //		none 无网络
            return connectionType;
        }
    },

    //监听
    Jianting: {
        //设置监听
        set: function (name, data) {
            api.sendEvent({
                name: '' + name + '',
                extra: data
            });
        },
        //获取监听
        get: function (name, show) {
            api.addEventListener({
                name: name
            }, function (ret, err) {
                show(ret.value);
            });
        },
        //移除监听
        remove: function (name) {
            api.removeEventListener({
                name: '' + name + ''
            });
        },
        //监听状态栏点击事件
        zhuangtailan: function (show) {
            api.addEventListener({
                name: 'noticeclicked'
            }, function (ret, err) {
                show(ret);
            });
        }
    },

    //融云
    Rong: {

        //融云* 引入融云包
        chushihua: function () {
            var rong = api.require('rongCloud2');
            return rong;
        },

        //融云* 融云初始化
        ronginit: function () {
            var rong = db.Rong.chushihua();
            rong.init(function (ret, err) {
                if (ret.status == 'error') {
                    api.alert({ msg: err.code });//初始化失败
                    return false;
                } else {
                    db.Ts.toast("融云初始化成功", 1000, "x");
                }
            });
        },

        //融云* 新消息监听
        setOnReceiveMessageListener: function () {
            var rong = db.Rong.chushihua();
            rong.setOnReceiveMessageListener(function (ret, err) {
                db.Jianting.set("NewMsgText", ret);
            })
        },

        //融云* 设置连接状态变化的监听器，请在调用 init 方法之后，调用 connect 方法之前设置 =
        setConnectionStatusListener: function () {
            var rong = db.Rong.chushihua();
            rong.setConnectionStatusListener(function (ret, err) {
                db.Ts.toast("监听器:" + ret.result.connectionStatus, 1000, "x");
            });
        },

        //融云* 用户连接 =
        connect: function (UserTokey) {
            var rong = db.Rong.chushihua();
            //开始连接连接融云 IM 服务器
            rong.connect({
                //连接，用户登录失败或成功
                token: UserTokey
            }, function (ret, err) {
                //拿去用户ID
                if (ret.status == 'success') {
                    db.Ts.toast("用户已连接", 1000, "x");
                    //ret.result.userId
                }
            });
        },
        //融云* 用户断开 =
        rongUserduankai: function () {
            var rong = db.Rong.chushihua();
            rong.disconnect({
                isReceivePush: true
            }, function (ret, err) {
                if ('success' == ret.status) {
                    db.Ts.toast("断开连接成功", 1000, "x");
                }
            }
			);
        },

        //融云* 获取某一会话信息 =
        getConversation: function (types, targetId, show) {
            var rong = db.Rong.chushihua();
            rong.getConversation({
                conversationType: '' + types + '',
                targetId: '' + targetId + ''
            }, function (ret, err) {
                show(ret);
            });
        },

        //融云* 发送消息 =
        sendTextMessage: function (types, id, TextMsg, show) {
            //PRIVATE 单聊
            //DISCUSSION 讨论组
            //GROUP 群组
            //CHATROOM 聊天室
            //CUSTOMER_SERVICE 客服
            //SYSTEM 系统
            var rong = db.Rong.chushihua(); //var	rong = api.require('rongCloud2');
            rong.sendTextMessage({
                conversationType: '' + types + '',
                targetId: '' + id + '',//目标ID
                text: '' + TextMsg + '',
                extra: ''
            }, function (ret, err) {
                show(ret);//回调方法
            });
        },

        //  =融云* 获取会话列表  =
        getConversationList: function (Show) {
            var rong = db.Rong.chushihua();
            rong.getConversationList(function (ret, err) {
                Show(ret);
            });
        },

        //融云* 移除指定会话 从会话列表中移除某一会话，但是不删除会话内的消息 =
        removeConversation: function (types, targetId, show) {
            var rong = db.Rong.chushihua();
            rong.removeConversation({
                conversationType: '' + types + '',
                targetId: '' + targetId + ''
            }, function (ret, err) {
                show(ret);
            })
        },

        //融云* 清空所有会话及会话消息 =
        clearConversations: function (array, show) {
            // ['PRIVATE', 'GROUP','SYSTEM']
            var rong = db.Rong.chushihua();
            rong.clearConversations({
                conversationTypes: array
            }, function (ret, err) {
                show(ret);
            });
        },

        //  =融云* 获取所有未读消息数 =
        getTotalUnreadCount: function (show) {
            var rong = db.Rong.chushihua();
            rong.getTotalUnreadCount(function (ret, err) {
                show(ret);
            });
        },

        //  =融云* 获取来自某用户（某会话）的未读消息数 =
        getUnreadCount: function (types, targetId, show) {
            var rong = db.Rong.chushihua();
            rong.getUnreadCount({
                conversationType: '' + types + '',
                targetId: '' + targetId + ''
            }, function (ret, err) {
                show(ret);
            });
        },

        //融云* 获取某（些）会话类型的未读消息数 =
        getUnreadCountByConversationTypes: function () {
            var rong = db.Rong.chushihua();
            rong.getUnreadCountByConversationTypes({
                conversationTypes: ['PRIVATE', 'GROUP']
            }, function (ret, err) {
                api.toast({ msg: ret.result });
            })
        },

        //融云* 获取某一会话的最新消息记录 =
        getLatestMessages: function (opt) {
            var rong = db.Rong.chushihua();
            opt = $.extend(true, {
                conversationType: 'PRIVATE',
                targetId: '',
                count: 20,
                fun: function (ret, err) { }
            }, opt);
            rong.getLatestMessages(opt);
        },


        //融云* 获取某一会话的历史消息记录 =
        getHistoryMessages: function (types, targetId, Sum, show) {
            var rong = db.Rong.chushihua();
            rong.getHistoryMessages({
                conversationType: '' + types + '',
                targetId: '' + targetId + '',
                oldestMessageId: 688,
                count: Sum
            }, function (ret, err) {
                show(ret);
            })
        },


        //融云* 清除某一会话的消息未读状态
        clearMessagesUnreadStatus: function (types, targetId, show) {
            var rong = db.Rong.chushihua();
            rong.clearMessagesUnreadStatus({
                conversationType: '' + types + '',
                targetId: '' + targetId + ''
            }, function (ret, err) {
                show(ret);
            })
        },
    },

    //分享
    fenxiang: {
        //微信
        wx: {
            //微信检测是否安装客户端
            init: function () {
                var wx = api.require('wx');
                wx.isInstalled(function (ret, err) {
                    if (ret.installed) {
                        return true;
                    } else {
                        return false;
                    }
                });
            },
            //分享文本内容
            shareText: function (text) {
                if (db.fenxiang.wx.init() == false) {
                    db.alert("温馨提示", "您没有安装微信客户端");
                    return;
                }
                var wx = api.require('wx');
                wx.shareText({
                    apiKey: '',
                    scene: 'timeline',
                    text: text
                }, function (ret, err) {
                    if (ret.status) {
                        db.alert("温馨提示", "分享成功");
                    } else {
                        db.alert("温馨提示", "分享失败错误：" + err.code);
                    }
                });
            },
            //分享图片内容
            shareImage: function (types, imgurl) {
                if (db.fenxiang.wx.init() == false) {
                    db.alert("温馨提示", "您没有安装微信客户端");
                    return;
                }
                var wx = api.require('wx');
                wx.shareImage({
                    apiKey: '',
                    scene: types,//session（会话）timeline（朋友圈）favorite（收藏）
                    thumb: imgurl,//描述：缩略图片的地址，支持 fs://、widget:// 协议。大小不能超过32K，若 contentUrl 为本地图片地址则本参数忽略,需要路径包含图片格式后缀，否则如果原图片为非png格式，会分享失败
                    contentUrl: imgurl//分享图片的 url 地址（支持 fs://、widget:// 和网络路径），长度不能超过10k，在 android 平台上若为网络图片时仅当 scene 为 session 时有效，iOS 平台上不支持网络图片地址，若为本地图片大小不能超过10M
                }, function (ret, err) {
                    if (ret.status) {
                        db.alert("温馨提示", "分享成功");
                    } else {
                        db.alert("温馨提示", "分享失败错误：" + err.code);
                    }
                });
            },
            //分享网页
            shareWebpage: function (types, title, miaoshu, imgurl, url) {
                if (db.fenxiang.wx.init() == false) {
                    db.alert("温馨提示", "您没有安装微信客户端");
                    return;
                }
                var wx = api.require('wx');
                wx.shareWebpage({
                    apiKey: '',
                    scene: types,//session（会话）timeline（朋友圈）favorite（收藏）
                    title: title,
                    description: miaoshu,
                    thumb: imgurl,//（可选项）分享网页的缩略图地址，要求本地路径（fs://、widget://）大小不能超过32K,需要路径包含图片格式后缀，否则如果原图片为非png格式，会分享失败
                    contentUrl: url//描述：（可选项）分享网页的 url 地址，长度不能超过10k。
                }, function (ret, err) {
                    if (ret.status) {
                        db.alert("温馨提示", "分享成功");
                    } else {
                        db.alert("温馨提示", "分享失败错误：" + err.code);
                    }
                });
            },
            //登陆授权
            login: function () {
                if (db.fenxiang.wx.init() == false) {
                    db.alert("温馨提示", "您没有安装微信客户端");
                    return;
                }
                var wx = api.require('wx');
                wx.auth({
                    apiKey: ''
                }, function (ret, err) {
                    if (ret.status) {
                        alert(JSON.stringify(ret));
                    } else {
                        alert(err.code);
                    }
                });
            },
            //获取授权 accessToken（需要登录授权成功）
            getToken: function () {
                if (db.fenxiang.wx.init() == false) {
                    db.alert("温馨提示", "您没有安装微信客户端");
                    return;
                }
                var wx = api.require('wx');
                wx.getToken({
                    apiKey: '',
                    apiSecret: '',
                    code: ''
                }, function (ret, err) {
                    if (ret.status) {
                        alert(JSON.stringify(ret));
                    } else {
                        alert(err.code);
                    }
                });
            },
            //获取用户信息（需要获取 accessToken 成功）
            getUserInfo: function () {
                if (db.fenxiang.wx.init() == false) {
                    db.alert("温馨提示", "您没有安装微信客户端");
                    return;
                }
                var wx = api.require('wx');
                wx.getUserInfo({
                    accessToken: '',
                    openId: ''
                }, function (ret, err) {
                    if (ret.status) {
                        alert(JSON.stringify(ret));
                    } else {
                        alert(err.code);
                    }
                });
            },
            //调用 getUserInfo 接口错误码返回1时，代表 accessToken 过期，调用此接口刷新 accessToken
            refreshToken: function () {
                if (db.fenxiang.wx.init() == false) {
                    db.alert("温馨提示", "您没有安装微信客户端");
                    return;
                }
                var wx = api.require('wx');
                wx.refreshToken({
                    apiKey: '',
                    dynamicToken: ''
                }, function (ret, err) {
                    if (ret.status) {
                        alert(JSON.stringify(ret));
                    } else {
                        alert(err.code);
                    }
                });
            }
        },
        QQ: {

            //检测安装
            anzhuang: function () {
                var qq = api.require('qq');
                qq.installed(function (ret, err) {
                    if (ret.status) {
                        return true;
                    } else {
                        return false;
                    }
                });
            },

            //分享文本
            wenben: function (neirong) {
                var qq = api.require('qq');
                qq.shareText({
                    text: neirong
                }, function (ret, err) {
                    if (ret.status == true) {
                        db.Ts.alert({ msg: '分享成功' });
                    }
                });
            }

        }
    },

    //提示
    Ts: {
        //普通提示
        alert: function (opt) {
            opt = $.extend(true, {
                title: '温馨提示',
                msg: '',
                buttons: []
            }, function (ret, err) {

            }, opt);
            api.alert(opt);
        },

        //弹出带两个或三个按钮的confirm对话框
        confirm: function (opt, show) {
            opt = $.extend(true, {
                title: '温馨提示',
                msg: '',
                buttons: ['确定', '取消']
            }, opt);

            api.confirm(opt, function (ret, err) {
                //var index = ret.buttonIndex;
                show(ret, err);
            });
        },

        //定时提示框
        toast: function (Texts, Ms, Types) {
            if (Ms == null || Ms == undefined || Ms == "") { Ms = 2000; }
            if (Types == null || Types == undefined || Types == "") { Types = "bottom"; }
            if (Types == 's') { Types = "top"; }
            if (Types == 'z') { Types = "middle"; }
            if (Types == 'x') { Types = "bottom"; }

            api.toast({
                msg: '' + Texts + '',
                duration: Ms,
                location: '' + Types + ''
            });
        },
        //加载显示
        jiazaiShow: function (opt) {
            opt = $.extend(true, {
                style: 'default',
                animationType: 'fade',
                title: '系统提示',
                text: '努力加载中...',
                modal: true
            }, opt);
            api.showProgress(opt);
        },
        //加载隐藏
        jiazaiHide: function () {
            api.hideProgress();
        }
    },

    //设备
    sb: {
        //获取当前应用缓存
        Gethuancun: function () {
            var size = api.getCacheSize({ sync: true });
            size = (size / 1048576);//除以1MB 字节单位
            return size;
        },

        //删除所有缓存文件
        Deletehuancun: function () {
            api.clearCache(function () {
                db.Ts.toast('全部清理完成', 2000, 'x');
            });
        },
        //获取当前手机号码
        getPhone: function () {
            var phoneNumber = api.getPhoneNumber({
                sync: true
            });
            return phoneNumber;
        },
        //设置应用图标右上角数字0清空
        tixinSum: function (sum) {
            var Su = db.Data.toInt(sum, 0);
            api.setAppIconBadge({
                badge: Su
            });
        },
        //系统类型
        systemType: function () {
            var systemType = api.systemType;
            return systemType;
        },
        //系统类型
        systembanben: function () {
            var systemVersion = api.systemVersion;
            return systemVersion;
        },
        //是否支持沉浸式
        statusBar: function () {
            var statusBarAppearance = api.statusBarAppearance;
            return statusBarAppearance;
        },
        //存放文件路径
        //iOS 平台下载的文件一般存放于该目录下，否则提交 AppStore 审核时可能会不通过，且此目录下的内容在手机备份时不会被备份
        SaveUrl: function () {
            var urls = api.cacheDir;
            return urls;
        }
    },
    /********************************红外扫描枪 begin*******************************/
    //加载模块
    requireY9Scanner: function () {
        if (db.y9 == undefined)
            db.y9 = api.require('y10');
    },
    //打开红外线扫描接口
    hw: function (opt, _auto) {
        //初始化合并参数
        opt = $.extend({
            //是否连续扫描，1：连续扫描   0：非连续扫描
            isauto: 0,
            //回调
            fun: function (ret, err) { }
        }, opt);
        try {
            //加载模块
            db.requireY9Scanner();
            window.setTimeout(function () {
                //执行接口
                db.y9.scan({ appParam: "" }, function (ret, err) {
                    //执行回调方法
                    opt.fun(ret.barcode, err);
                    //记录扫描的信息
                    logMsgFun('红外扫描信息：' + ret.barcode, false);
                    if (ret) {
                        ////扫描声音
                        //api.notification({
                        //    vibrate: [500, 500],
                        //    sound: 'default',
                        //    light: true
                        //});
                    }
                });
            }, 500);
        } catch (e) {
            alert('红外线设备异常，启动摄像头扫描！' + e);
        }
    },
    /********************************红外扫描枪 end*******************************/
    //短信
    Duanxin: {
        //引入包
        smsVerify: function () {
            var smsVerify = api.require('smsVerify');
            return smsVerify;
        },
        //初始化
        init: function () {
            var smsVerify = db.Duanxin.smsVerify();
            smsVerify.register(function (ret, err) {
                if (ret.status) {
                    //api.alert({msg: '注册成功'});
                } else {
                    api.alert({ msg: err.code + '注册失败' });
                }
            });
        },
        //发送短信
        sms: function (phone, fun) {
            var smsVerify = db.Duanxin.smsVerify();
            smsVerify.sms({
                phone: phone,
                country: "86"
            }, function (ret, err) {
                if (ret.status) {
                    if (ret.smart == true) { // 安卓版特有功能 智能验证
                        fun(1);//智能验证 直接验证后的代码
                    } else {
                        fun(2);//短信发送成功
                    }
                } else {
                    api.alert({ msg: err.code + ' ' + err.msg });
                }
            });
        },
        //短信验证
        verify: function (phone, code, fun) {
            var smsVerify = api.require('smsVerify');
            smsVerify.verify({
                phone: phone,
                code: code
            }, function (ret, err) {
                if (ret.status) {
                    fun('验证成功');
                } else {
                    fun('验证失败');
                    db.Ts.alert({ title: '很抱歉', msg: err.msg });
                }
            });
        }
    },

    //极光推送
    jg: {
        //初始化
        ajpush: function () {
            //引入极光包
            var ajpush = api.require('ajpush');
            return ajpush;
        },
        //初始化
        init: function () {
            var ajpush = db.jg.ajpush();
            ajpush.init(function (ret) {
                if (ret && ret.status) {
                    db.Ts.toast("极光：" + JSON.stringify(ret), 2000, "x");
                    //success
                }
            });
        },
        //设置消息监听，若iOS应用在前台运行，此时收到推送后也通过此方法回调
        setListener: function (fun) {
            var ajpush = db.jg.ajpush();
            ajpush.setListener(function (ret) {
                fun(ret);
            });
        },
        //移除消息监听
        removeListener: function () {
            var ajpush = db.jg.ajpush();
            ajpush.removeListener();
        },
        //绑定用户别名和标签。服务端可以指定别名和标签进行消息推送
        bindAliasAndTags: function (param) {
            //var param = {alias:'libo',tags:['lb1','lb2']};
            var ajpush = db.jg.ajpush();
            ajpush.bindAliasAndTags(param, function (ret) {
                //alert("绑定别名："+JSON.stringify(ret))
            });
        },
        //通知极光推送SDK当前应用恢复到前台。
        onResume: function () {
            api.addEventListener({ name: 'resume' }, function (ret, err) {
                var ajpush = db.jg.ajpush();
                ajpush.onResume();
            });
        },
        //通知极光推送SDK当前应用退入到后台
        onPause: function () {
            api.addEventListener({ name: 'pause' }, function (ret, err) {
                var ajpush = db.jg.ajpush();
                ajpush.onPause();
            });
        },
        //清除极光推送发送到状态栏的通知。
        //待清除的通知id（等同于消息ID），为-1时清除所有，iOS只支持清除所有，不能为空
        clearNotification: function () {
            var ajpush = db.jg.ajpush();
            var param = { id: -1 };
            ajpush.clearNotification(param, function (ret) {
                if (ret && ret.status) {
                    //success
                }
            });
        },
        //设置允许推送时间，只Android有效
        //允许推送的日期，0表示星期天，1表示星期一，以此类推，（7天制，数组里面的每项范围为0到6），不能为空
        setPushTime: function () {
            var ajpush = db.jg.ajpush();
            var params = {};
            params.days = [1, 2];
            params.startHour = 8;//允许推送的开始时间（24小时制：startHour的范围为0到23），不能为空
            params.endHour = 20;//允许推送的结束时间（24小时制：endHour的范围为0到23），不能为空
            ajpush.setPushTime(params, function (ret) {
                if (ret && ret.status) {
                    //success
                }
            });
        },
        //设置通知静默时间，只Android有效
        setSilenceTime: function () {
            var ajpush = db.jg.ajpush();
            var params = {};//静音时段的开始小时（24小时制，范围：0~23），不能为空
            params.startHour = 8;//静音时段的开始小时（24小时制，范围：0~23），不能为空
            params.startMinute = 0;//静音时段的开始分钟（范围：0~59），不能为空
            params.endHour = 20;//静音时段的结束小时（24小时制，范围：0~23），不能为空
            params.endMinute = 59;//静音时段的结束分钟（范围：0~59），不能为空
            ajpush.setPushTime(params, function (ret) {
                if (ret && ret.status) {
                    //success
                }
            });
        },
        //停止Push推送。
        stopPush: function () {
            var ajpush = db.jg.ajpush();
            ajpush.stopPush(function (ret) {
                if (ret && ret.status) {
                    //操作成功状态值，1-成功，0-失败
                    //success
                }
            });
        },
        //恢复Push推送。
        resumePush: function () {
            var ajpush = db.jg.ajpush();
            ajpush.resumePush(function (ret) {
                if (ret && ret.status) {
                    //操作成功状态值，1-成功，0-失败
                    //success
                }
            });
        },
        //查询当前推送服务是否停止。
        isPushStopped: function () {
            var ajpush = db.jg.ajpush();
            ajpush.isPushStopped(function (ret) {
                if (ret && ret.isStopped) {
                    //推送服务是否停止状态，1-停止，0-未停止
                }
            });
        },
        //设置应用图标右上角数字，只iOS有效。
        //为0时清除应用图标数字，大于0时设置应用图标数字，同时该值会更新到激光推送服务器，不能为空
        setBadge: function () {
            var ajpush = db.jg.ajpush();
            ajpush.setBadge({
                badge: 0
            });
        },
        //集成了JPush SDK的应用程序在第一次成功注册到JPush服务器时，
        //JPush服务器会给客户端返回一个唯一的该设备的标识RegistrationID。
        //JPush SDK会以广播的形式发送RegistrationID到应用程序。
        //应用程序可以把此RegistrationID保存于自己的应用服务器上，
        //然后就可以根据 RegistrationID来向设备推送消息或者通知
        getRegistrationId: function (show) {
            var ajpush = db.jg.ajpush();
            ajpush.getRegistrationId(function (ret) {
                show(ret);
            });
        },
        /*
		 在Android平台，使用极光推送发送通知、消息等类型推送时，
		 极光推送模块会往设备状态栏上发送通知，当通知被点击后，
		 APICloud会将本次推送的内容通过事件监听回调的方式交给开发者。具体使用如下：
		 */
        AndroidJT: function (show) {
            api.addEventListener({
                name: 'appintent'
            }, function (ret, err) {
                show(ret, err);
            });
        },
        /*
		 在iOS平台，使用极光推送发送通知时，若应用在前台运行，
		 则推送内容可以通过setListener方法监听到，若应用在后台，
		 系统会往设备通知栏发送通知，当通知被点击后，
		 APICloud会将本次推送的内容通过事件监听回调的方式交给开发者。具体使用如下：
		*/
        iosJT: function (show) {
            api.addEventListener({ name: 'noticeclicked' }, function (ret, err) {
                show(ret, err);
                //		    if(ret && ret.value){
                //		        var ajpush = ret.value;
                //		        var content = ajpush.content;
                //		        var extra = ajpush.extra;
                //		    }
            })
        }
    }
}
//通过铝锭或标准桶获取材料牌号
function getCLPH(n, q, funaa) {
    //执行数据
    db.ajax(function (ret, err) {
        //验证服务端是否执行正确，不正确则内部直接提示错误信息
        if (!db.dfc(ret)) return;
        var data = eval('(' + ret + ')');
        var das = data.msg.ds;
        //
        if (das == undefined) { logMsgFun('未找到材料牌号'); return; }
        //回调
        if (das.length > 0 && das[0].FCLPH != undefined)
            funaa(das[0].FCLPH);
    }, "getclph1", "post", { FLDNumber: '' + n, FTYPE: '' + q }, { title: '正在执行' });
}

$(function () {
    //初始化
    $("body").css({ "padding-top": "25px" });
    //日志html
    var logHtml = [];
    //<!--日志 begin-->
    logHtml.push('<div class="kjjjskxjjx" style="position:absolute; top:70px; left:20px; width:275px; height:400px; background:#fff; border: solid 1px #808080;overflow:hidden;display:none;">');
    logHtml.push('<div style="width:273px; height:30px;text-align:center; line-height:30px; background:#ddd3d3;">错误日志信息</div>');
    logHtml.push('<div class="logmsg" style="width:273px; height:340px;overflow:auto; text-align:left;"></div>');
    logHtml.push('<div style="width:273px; height:30px;text-align:center;">');
    logHtml.push('<input value="关闭" type="button" style="width:270px; " onclick="cloasLogMsg();" />');
    logHtml.push('</div>');
    logHtml.push('</div>');
    //<!--日志 end-->
    $("body").append(logHtml.join(''));
})

var logMsgFunIndex = 0;
//输出日志信息
function logMsgFun(msg111, isalert) {
    logMsgFunIndex = logMsgFunIndex + 1;
    $(".logmsg").prepend('(' + logMsgFunIndex + ')' + msg111 + '<hr>');
    //默认为true
    if (isalert == undefined) isalert = true;
    //是否提示
    if (isalert) alert('' + msg111);
}
//关闭日志
function cloasLogMsg() {
    $(".kjjjskxjjx").hide();
}


//更新app版本信息
var updateAPP = '';
var layerId = undefined;
//APP更新
function update_APP(isupdate) {
    //禁止更新的ajax
    if (db.jzupdate != undefined && db.jzupdate == 1) return;
    if (isupdate === undefined) isupdate = true;
    //更新app版本信息
    updateAPP = db.Data.get("updateAPP");

    //接口组合
    var urls = "http://" + db.Data.get("IP") + "/PCodeClient/api.ashx?cmdapi=getapkInfo";
    $.ajax({
        url: urls, data: {}, type: "POST", dataType: 'json',
        success: function (ret331) {
            //alert(ret331.path);//安装路径
            if (typeof (ret331) == "object") {
                if (ret331.status == "200") {
                    var _Verson = ret331.V;
                    if (isupdate || updateAPP != _Verson) {
                        //-------------更新 begin----------------------
                        //获取唯一码
                        var _getTime = db.nowDate().getTime;
                        var savepaths = 'fs://bld_' + _getTime + '.apk';
                        api.download({
                            url: 'http://' + db.Data.get("IP") + ret331.path,
                            savePath: '' + savepaths,
                            report: true,
                            cache: true,
                            allowResume: true
                        }, function (ret1, err) {
                            if (layerId == undefined) {
                                layerId = layer.open({
                                    end: function (index, layero) { },
                                    btn: ['转到后台执行'],
                                    title: _Verson + '下载进度',
                                    content: '<div id="downloadId">正在下载中...</div><br />下载完成后请务必先安装，否则下次不会更新当前版本！'
                                });
                            }
                            if (ret1.state == 1) {
                                //下载成功
                                layer.close(layerId);
                                layerId = undefined;
                                //存储到内存中
                                db.Data.set("updateAPP", _Verson);
                                //安装应用
                                api.installApp({ appUri: '' + savepaths });
                            } else {
                                //下载过程中  JSON.stringify(ret1)
                                $("#downloadId").html('下载进度：' + ret1.percent + '%');
                            }
                        });
                        //-------------更新 end----------------------
                    }
                } else {
                    db.Ts.toast(ret331.error);
                }
                try {
                } catch (e) { }
            }
        }
    });
}

//查看版本
function getVerson() {
    layer.msg('当前版本：' + db.Data.get("updateAPP"));
}

//扫描状态区分,默认外键
var __SMtype = 1;
//是否允许扫描执行，默认1，允许执行，0不允许执行
var passSM = 1;

//获取焦点
function getjd() {
    $("#y11inputs").attr("readonly", "readonly");
    setTimeout(function () {
        $("#y11inputs").focus();
        $("#y11inputs").removeAttr("readonly");
    }, 100);
}
$(function () {
    if ($("#y11inputs").length == 0) {
        $("body").append('<textarea id="y11inputs" style="position:absolute;left:-100px;width:60px;"></textarea>');
    }
    //获取焦点
    getjd();
    //$("#y11inputs").unbind('keydown');
    $("#y11inputs").bind('keydown', function (e) {
        // e.stopPropagation()
        if (e.keyCode == 13) {
            var text = $("#y11inputs").val();
            //去掉换行符、去掉空格
            var text2 = text.replace(/\r/g, "").replace(/\n/g, "").replace(/\s/g, "");
            SaoMaoFun(__SMtype, text2, text);
            try {
                layer && layer.msg(text2, {
                    id: new Date().getTime(),
                    offset: 't',
                    anim: 6
                });
            } catch (e) { }
            //恢复成外键触发
            __SMtype = 1;
            //允许再次执行
            passSM = 1;
            //清空扫描内容
            $("#y11inputs").val('');
        }
    });


    $("body").click(function (e) {
        if ($(e.target).closest('select').length) {
            $("select").blur();
            return;
        }
        getjd();
    });

    $('body').on("click", 'select', function (e) {
        e.stopPropagation();
    });

    $('body').on("change", "select", function (e) {
        e.stopPropagation();
        $("select").blur();
    });

    $("body").on("click", "input", function (e) {
        e.stopPropagation();
    });
})

//打开扫描
function OpenSM(SMType) {
    //获取焦点
    getjd();
    //当前扫描状态
    if (SMType != undefined) __SMtype = SMType;
    try {
        //加载模块
        if (lb.y11 == undefined)
            lb.y11 = api.require('y11');

        if (passSM == 1) {
            //不允许执行
            passSM = 0;
            //打开扫描
            var deviceName = api.deviceModel;
            if (deviceName.indexOf('NLS') > -1) {
                //xin'da'l新大陆
                lb.y11.scanNewLand();
            } else {
                //麦博维尔
                lb.y11.scan();
            }
            //允许执行
            passSM = 1;
        }
    } catch (e) {
        //允许执行
        passSM = 1;
        alert('红外线设备异常，启动摄像头扫描！' + e);
    }
}
//以下内容为业务处理逻辑，每个页面都会用到----------------------
$(function () {
    //获取当前时间
    $('#sj').val(db.JS.GetDatetime());
})
//扫描后执行内容
var scanData = {
    //清空
    clear: function (clearStr) {
        if (clearStr == undefined) { clearStr = ",YZJ,RLSY,TB,BWL,LDZZ,HL,"; }
        if (clearStr.indexOf("YG") != -1) {
            $("#YG").val("");
            $("#YG").attr("_id", '');
        }
        if (clearStr.indexOf("YZJ") != -1) {
            $("#YZJ").val("");
            $("#YZJ").attr("_id", '');
        }
        if (clearStr.indexOf("RLSY") != -1) {
            $("#RLSY").val("");
            $("#RLSY").attr("_id", '');
        }
        if (clearStr.indexOf("TB") != -1) {
            $("#TB").val("");
            $("#TB").attr("_id", '');
        }
        if (clearStr.indexOf("BWL") != -1) {
            $("#BWL").val("");
            $("#BWL").attr("_id", '');
        }
        if (clearStr.indexOf("LDZZ") != -1) {
            $("#LDZZ").val("");
            $("#LDZZ").attr("_id", '');
        }
        if (clearStr.indexOf("HL") != -1) {
            $("#HL").val("");
            $("#HL").attr("_id", '');
            $("#HL").attr("TLLX", '');
        }
    },
    //辅助函数
    godata1_id: function (namestr, dat) {
        if (dat.name == namestr + "_ID") {
            //外面的后面加元素
            if ($("#" + namestr + "_ID").length == 0)
                $("form").append('<input type="hidden" id="' + namestr + '_ID" name="' + namestr + '_ID" />');
            $("#" + namestr + "_ID").val(dat.value);
            $("#" + namestr).attr("_id", dat.value);
        }
    },
    //辅助函数
    godata2_val: function (namestr, dat) {
        if (dat.name == namestr) {
            if ($("#" + namestr).length == 0)
                $("form").append('<input type="hidden" id="' + namestr + '" name="' + namestr + '" />');
            $("#" + namestr + "").val(dat.value);
        }
    },
    //赋值之前窗口传递过来的扫描内容
    copyScanData: function () {
        try {
            var parms = api.pageParam.name;
            //alert(JSON.stringify(parms));
            //此处必须两个循环，有先后之分
            for (var x in parms) {
                scanData.godata2_val("FCLPH", parms[x]);
                scanData.godata2_val("YG", parms[x]);
                scanData.godata2_val("YZJ", parms[x]);
                scanData.godata2_val("RLSY", parms[x]);
                scanData.godata2_val("TB", parms[x]);
                scanData.godata2_val("BWL", parms[x]);
                scanData.godata2_val("HL", parms[x]);
            }
            for (var x in parms) {
                scanData.godata1_id("FCLPH", parms[x]);
                scanData.godata1_id("YG", parms[x]);
                scanData.godata1_id("YZJ", parms[x]);
                scanData.godata1_id("RLSY", parms[x]);
                scanData.godata1_id("TB", parms[x]);
                scanData.godata1_id("BWL", parms[x]);
                scanData.godata1_id("HL", parms[x]);
            }
        } catch (e) {

        }
    },
    scan: function (dat2, opt) {
        //alert(dat2);
        try {
            var dat = eval('(' + dat2 + ')');
            if (dat.q == "YG") {
                //获取员工ID
                //{"q":"YG","n":"6216","k":"张三","g":""}
                $("#YG").val(dat.k);
                $("#YG").attr("_id", dat.n);
                //外面的后面加元素
                if ($("#YG_ID").length == 0) {
                    $("#YG").after('<input type="hidden" id="YG_ID" name="YG_ID" />');
                }
                $("#YG_ID").val(dat.n);
            }
            else if (dat.q == "YZJ") {
                //3.压铸机二维码   熔炼炉   除气机
                //{"q":"YZJ","n":"90675","d":"01-D","k":"冷室压铸机1#:PD-B-01"}
                $("#YZJ").val(dat.k);
                $("#YZJ").attr("_id", dat.n);
                //外面的后面加元素
                if ($("#YZJ_ID").length == 0) {
                    $("#YZJ").after('<input type="hidden" id="YZJ_ID" name="YZJ_ID" />');
                }
                $("#YZJ_ID").val(dat.n);
                if (opt != undefined) opt.YZJFUN();
            }
            else if (dat.q == "RLSY") {
                //10.熔炼首件送样盒
                //{"q":"RLSY","n":"7","d":"RLSY01","k":"熔炼1"}
                $("#RLSY").val(dat.k);
                $("#RLSY").attr("_id", dat.n);
                //外面的后面加元素
                if ($("#RLSY_ID").length == 0) {
                    $("#RLSY").after('<input type="hidden" id="RLSY_ID" name="RLSY_ID" />');
                }
                $("#RLSY_ID").val(dat.n);
                if (opt != undefined && opt.RLSYFUN != undefined) opt.RLSYFUN();
            }
            else if (dat.q == "TB") {
                //12.周转包   汤包
                //{"q":"TB","n":"40","d":"TB01","k":"ADC12周转包"}
                $("#TB").val(dat.k);
                $("#TB").attr("_id", dat.n);
                //外面的后面加元素
                if ($("#TB_ID").length == 0) {
                    $("#TB").after('<input type="hidden" id="TB_ID" name="TB_ID" />');
                }
                $("#TB_ID").val(dat.n);
                if (opt != undefined && opt.TBFUN != undefined) opt.TBFUN();
            }
            else if (dat.q == "BWL") {
                //18.保温炉二维码    机边炉
                //{"q":"BWL","n":"90764","d":"","k":"沃克佳节能保温炉:PD-B-98"}
                $("#BWL").val(dat.k);
                $("#BWL").attr("_id", dat.n);
                //外面的后面加元素
                if ($("#BWL_ID").length == 0) {
                    $("#BWL").after('<input type="hidden" id="BWL_ID" name="BWL_ID" />');
                }
                $("#BWL_ID").val(dat.n);
            }
            else if (dat.q == "LDZZ" || dat.q == "HL") {
                //转运车
                //{"q":"LDZZ","n":"13","d":"LDZZ01","k":"ADC12周转车1"}
                //回料桶
                //{"q":"HL","n":"86","d":"HL01","k":"压铸报废框1"}
                $("#HL").val(dat.k);
                $("#HL").attr("_id", dat.n);
                $("#HL").attr("TLLX", (dat.q == "LDZZ" ? "LD" : "CZT"));
                //外面的后面加元素
                if ($("#HL_ID").length == 0) {
                    $("#HL").after('<input type="hidden" id="HL_ID" name="HL_ID" />');
                }
                $("#HL_ID").val(dat.n);
                //执行查询
                scanData.data.api18491();
            }
        } catch (e) {

        }
    },
    data: {
        //泛德 > 压铸车间 > 员工签到 > 设备类型 (编号：YZ_GETSBType)
        YZ_GETSBType: function (fun) {
            db.submitData("YZ_GETSBType", {}, function (dat, dat1) {
                if (fun != undefined) fun(dat, dat1);
            });
        },
        //泛德 > 压铸车间 > 员工签到 > 获取压铸车间设备 (编号：YZ_GETShebei)
        YZ_GETShebei: function (FSbType, fun) {
            db.submitData("YZ_GETShebei", {
                //设备类型
                FSbType: FSbType
            }, function (dat, dat1) {
                if (fun != undefined) fun(dat, dat1);
            });
        }
    },
    //熔炼炉对应状态
    YZJStatus: {
        //通过状态码，获取中文名称
        get: function (FStatus) {
            var Fname = '';
            for (var x in scanData.YZJStatus.data) {
                if (FStatus == scanData.YZJStatus.data[x].FStatus) Fname = scanData.YZJStatus.data[x].FName;
            }
            return Fname;
        },
        //状态对照表
        data: [
            { FStatus: "1", FName: '允许投料' },
            { FStatus: "2", FName: '允许出汤' },
            { FStatus: "3", FName: '未开炉' },
            { FStatus: "4", FName: '正在检验' },
            { FStatus: "5", FName: '正在投料' },
            { FStatus: "6", FName: '正在出汤' },
            { FStatus: "7", FName: '正在维修' }
        ]
    }
};

function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds();
    return currentdate;
}

var netData = null;
var ifDisconnect = true;
(function () {
    var network = function () {
        var monitor = this;
        //定时器  speedInterval
        var speedInterval = null;
        //监听的图片
        var neturl = "http://" + db.Data.get("IP") + "/res/netimg.gif";
        //定时器   networkInterval
        var networkInterval = null;
        //定时器   reNetworkInterval
        var reNetworkInterval = null;
        var time = 3000;
        //获取网络连接状态
        var getConnectState = function () {
            return navigator.onLine ? 1 : 0;
        };
        //网络中断
        var disconnect = function () {
            if ($('.scan').length) {
                $(".scan").html('<font color=red>网络中断</font>');
            }


            if (!netData) {
                netData = {
                    time1: getNowFormatDate(),
                    time2: '',
                    status1: '网络中断',
                    name1: api.winName,
                    url: db.Data.get("IP"),
                    FMachineID: db.Data.get("deviceId") || api.deviceId,
                    User: db.Data.get("UserName"),
                    FInterface: '------------'
                }
            } else {
                if (netData.status1 == '网速过慢') {
                    netData.status1 = '网速过慢,网络中断'
                }
            }

            window.clearInterval(reNetworkInterval);
            reNetworkInterval = null;
            endSpeed();
            endNetwork();
            window.setTimeout(function () {
                reNetworkInterval = window.setInterval(function () {
                    if (getConnectState() == 1) {
                        window.clearInterval(reNetworkInterval);
                        reNetworkInterval = null;
                        startSpeed();
                        startNetwork();
                    } else {
                        window.clearInterval(reNetworkInterval);
                        reNetworkInterval = null;
                        disconnect();
                    }
                }, time);
            }, 2 * time);
        };
        //网络速度
        var speed = {
            //网速过慢
            bad: function () {
                if ($('.scan').length) {
                    $(".scan").html('<font color=red>网速过慢</font>');
                }
                if (!netData) {
                    netData = {
                        time1: getNowFormatDate(),
                        time2: '',
                        status1: '网速过慢',
                        name1: api.winName,
                        url: db.Data.get("IP"),
                        FMachineID: db.Data.get("deviceId") || api.deviceId,
                        User: db.Data.get("UserName"),
                        FInterface: '------------'
                    }
                } else {
                    if (netData.status1 == '网络中断') {
                        netData.status1 = '网速过慢,网络中断'
                    }
                }
            },
            //网速中等
            medium: function () {
                if ($('.scan').length) {
                    $(".scan").html('网速中等');
                }
                if (netData) {
                    netData.time2 = getNowFormatDate();

                    submitvv("NetWorkLog", netData)
                }
            },
            //网速极佳
            great: function () {
                if ($('.scan').length) {
                    $(".scan").html('网速极佳');
                }
                if (netData) {
                    netData.time2 = getNowFormatDate();

                    submitvv("NetWorkLog", netData)
                }
            }
        };
        var submitvv = function (Cmd, data, fun) {
            //请求默认路径
            var linshiUrl = db.config.url;
            var urls = "http://" + db.Data.get("IP") + "/" + linshiUrl + '?cmd=' + Cmd + '&sb=手持PDA';
            $.ajax({
                url: urls, data: data, type: "POST", timeout: 20000, dataType: 'json',
                success: function (retData) {
                    if (typeof (retData) == "object") {
                        netData = null;
                    }
                }
            });
        }
        //开启速度监测
        var startSpeed = function () {
            window.clearInterval(speedInterval);
            speedInterval = null;
            if (getConnectState() == 1) {
                speedInterval = window.setInterval(function () {
                    var start = new Date().getTime();
                    if (getConnectState() == 1) {
                        var img = document.getElementById("networkSpeedImage");
                        if (!!!img) {
                            img = document.createElement("IMG");
                            img.id = "networkSpeedImage";
                            img.style.display = "none";
                            document.body.appendChild(img);
                        }
                        try {
                            ifDisconnect = true;
                            img.src = neturl + "?_t=" + new Date().getTime();
                            img.onload = function () {
                                ifDisconnect = false;
                                var end = new Date().getTime();
                                var delta = end - start;
                                if (delta > 200) {
                                    speed.bad();
                                    window.setTimeout(function () {
                                        if (getConnectState() == 1) {
                                            window.clearInterval(networkInterval);
                                            networkInterval = null;
                                            startSpeed();
                                        } else {
                                            disconnect();
                                        }
                                    }, 2 * time);
                                } else if (delta > 100) {
                                    speed.medium();
                                } else {
                                    speed.great();
                                }
                            };
                            setTimeout(function () {
                                if (ifDisconnect) {

                                    disconnect();
                                }
                            }, 1000)
                        } catch (e) {
                            speed.bad();
                            window.setTimeout(function () {
                                if (getConnectState() == 1) {
                                    window.clearInterval(networkInterval);
                                    networkInterval = null;
                                    startSpeed();
                                } else {
                                    disconnect();
                                }
                            }, 2 * time);
                        }
                    } else {
                        // 网络断开
                        disconnect();
                    }
                }, time);
            } else {
                // 网络断开
                disconnect();
            }
        };
        //停止速度监测
        var endSpeed = function () {
            window.clearInterval(speedInterval);
            speedInterval = null;
        };
        //开启网络连接监测
        var startNetwork = function () {
            if (getConnectState() == 1) {
                networkInterval = window.setInterval(function () {
                    if (getConnectState() == 0) {
                        disconnect();
                    }
                }, time);
            } else {
                disconnect();
            }
        };
        //结束网络连接监测
        var endNetwork = function () {
            window.clearInterval(networkInterval);
            networkInterval = null;
        };
        //网络监控开始
        this.start = function () {
            if (!$('.box .top .scan').length)
                $('.box .top').append('<div class="scan" style="position: absolute;top: 0;right: 5px;font-size: 12px;"></div>');
            startNetwork();
            startSpeed();
        };
        //停止网络监控
        this.stop = function () {
            endSpeed();
            endNetwork();
        };
    };
    window.network = new network();
}).call(this);
// 调用的时候,直接调用network.start();

apiready = function () {
    setTimeout(function () {
        network.start();
    }, 1000)
};

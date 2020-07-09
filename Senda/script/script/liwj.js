
//-------------------------------------------------------------------------填写---------------------------
//选中不能中的就继续使用扫描  输入加data-usb="weak"
$(document).on('focus', 'input', function (e) {
    if ($(this).attr('data-usb') !== 'weak') {
        if (getjd) getjd();
    }
});

//选择完成后恢复扫描
$('body').on('change', 'select', function () {
    //if (getjd) getjd();
});
var liwj = {
    //-------------------------------------------------------------------------显示当前时间---------------------------
    //获取当前时间 格式：yyyy-MM-dd HH:MM:SS
    getCurrentTime: function (type) {//type 1 yyyy-MM-dd HH:MM:SS 2yyyy-MM-dd
        type = type || 1;
        function zeroFill(i) {//补零
            if (i >= 0 && i <= 9) {
                return "0" + i;
            } else {
                return i;
            }
        }
        var date = new Date();//当前时间
        var month = zeroFill(date.getMonth() + 1);//月
        var day = zeroFill(date.getDate());//日
        var hour = zeroFill(date.getHours());//时
        var minute = zeroFill(date.getMinutes());//分
        var second = zeroFill(date.getSeconds());//秒

        var riqi = date.getFullYear() + "-" + month + "-" + day;
        //当前时间
        var curTime = riqi + " " + hour + ":" + minute + ":" + second;
        return type === 1 ? riqi : curTime;
    },

    //-------------------------------------------------------------------------layer 弹框---------------------------
    //layer 弹框
    layerOpen: function (title, content, area, fun, opt) {
        opt = $.extend({}, {
            shade: 0.3,
            shadeClose: true,
            type: 1,
            area: area || ['90%', '60%'],
            closeBtn: 1,
            title: title,
            content: content,
            end: function () { if (fun) fun(); }
        }, opt);
        return layer.open(opt);
    },
    

    //-------------------------------------------------------------------------将动态列表数据填充到列表---------------------------
    //tableName 'table_one'
    //theadData [{col:'A',colE:'a'},...]
    //tbodyData [{a:'aaa',b:'bbb',c:'ccc'},....]
    getTableList: function (tableName, theadData, tbodyData) {

        var htmlHead = '',
            htmlBody = '';

        if (!theadData.length) return;

        htmlHead += '<tr class="table-head">';
        for (var i = 0, length = theadData.length; i < length; i++) {
            htmlHead += '<th>' + theadData[i].col + '</th>';
        }
        htmlHead += '</tr>';
        $('#' + tableName + ' thead').html(htmlHead);

        if (!tbodyData.length) {
            htmlBody = '<tr><td  colspan="' + (theadData.length - 0 + 1) + '" style="text-align: center;">暂无数据</td></tr>';
        } else {
            for (var i = 0, length = tbodyData.length; i < length; i++) {
                htmlBody += '<tr>';
                for (var j in theadData) {
                    var key = theadData[j].colE,
                        val = tbodyData[i][key];
                    htmlBody += '<td>' + val + '</td>';
                }
                htmlBody += '</tr>';
            }
        }
        $('#' + tableName + ' tbody').html(htmlBody);
    },

    


}

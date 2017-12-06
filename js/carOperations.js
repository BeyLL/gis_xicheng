/**
 * 汽车的基础操作
 */
/*------------------------------------------------汽车---------------------------------------------------*/
//构建 矢量覆盖物 图层。
vectorsCar = new SuperMap.Layer.Vector("vectorsCar");
//矢量覆盖物回传事件
callbacksCar = {
    over: onFeatureHoveredCar,
    click: onFeatureSelectedCar,
    out: closeTabsInfoWinCar,
    clickout: closeMenuInfoWinCar
};
//创建一个矢量选择要素的控件，在指定图层上单击鼠标选择矢量要素。
selectFeatureCar = new SuperMap.Control.SelectFeature(vectorsCar,
    {
        callbacks: callbacksCar,
        hover: false
    }, {allowSelectTheSameFeature: true});
/* -------------------------------------添加汽车矢量图层-------------------------------------------*/
/*-------------------------------------获取车辆列表数据信息---------------------------------*/
window.car = [];
function getCarInfo(page) {  //缓存操作
     if(localStorage.getItem("carExpireTime") &&
        localStorage.getItem("carExpireTime")>=new Date().getTime() &&
        localStorage.getItem("car")){
        window.car = JSON.parse(localStorage.getItem("car"));
        addMulVectorCar(JSON.parse(localStorage.getItem("car")));
        openCarPanelAll(JSON.parse(localStorage.getItem("car")));
        console.log("use car in localStorage");
        return;
    }
    //如果没有传则默认1
    if (!page) {
        page = 1;
    }
    var i = 0;
    var getData = {
        "mobile": mobile,
        "token": token,
        "page": page,
        "pageSize": 100

    };
    $.ajax({
        url: window.urlName + "/car/getCar",
        type: 'POST',
        data: getData,
        success:function (data) {
            if (data.code == 200) {
                var data = data.data.data;
                if (data.length === 0) {
                    addMulVectorCar(window.car);
                    openCarPanelAll(window.car);
                    //配置缓存
                    localStorage.setItem("carAllList",JSON.stringify(window.car));
                    localStorage.setItem("carExpireTime",new Date().getTime()+window.carCacheTime);
                } else {
                    window.car = window.car.concat(data);
                    getCarInfo(parseInt(page) + 1);
                }
            } else {
                console.log(data.data.error);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}
/*--------------------------根据汽车的id返回汽车信息------------------------*/
function selectCarInfoByID(id, callback) {
    var getIdData = {
        "mobile": mobile,
        "token": token,
        "id": id
    };
    $.ajax({
        url: window.urlName+"/car/getSingleCarInfo",
        type: 'POST',
        data: getIdData,
        async:false,
        success: function(data){
        	console.log(data)
            if(data.code==200){
                car_info=data.data.data[0];
            }else if(data.code === 401){
                console.log(data.data.error);
            }else if(data.code === 501){
                console.log(data.data.error);
            }else if(data.code === 404){
                console.log(data.data.error);
            }else if(data.code === 301){
                console.log(data.data.error);
            }else if(data.code === 500){
                console.log(data.data.error);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}
/*----------------------------添加多个矢量点-----------------------------*/
function addMulVectorCar(data){
    vectorsCar.removeAllFeatures();
    //点特征数组
    var point_features = [];
    for(var i=0;i < data.length;i++){
    	//console.log(data[i])
        carX =  data[i].SmX;
        carY =  data[i].SmY;
        //声明几何图形点
        var point = new SuperMap.Geometry.Point(carX, carY);
        //声明矢量特征
        var feature = new SuperMap.Feature.Vector(point);
        //点特征样式
        feature.style = {
            fillColor: "transparent",//内填充
            strokeColor: "transparent",//外边线
            pointRadius: 10,//不同图层半径不同按参数r传递
            graphicZIndex:data[i].SmID,
            dataName:data[i].car_no,
            dataAddr:data[i].car_addr,
            graphicOpacity:0
        };
        //添加点特征到点特征数组
        point_features.push(feature);
    }
    //矢量图层添加一组点特征数组
    vectorsCar.addFeatures(point_features);
}
/*------------------------------------------左键点击弹出车辆详细信息--------------------------------------------*/
/*----------------------点击矢量要素覆盖物，调用此函数---------------------*/
function onFeatureSelectedCar(feature) {
    if (isCar == true) {
        return false;
    }
    isCar = true;
    var id = feature.style.graphicZIndex;
    map.setCenter(new SuperMap.LonLat(feature.geometry.x , feature.geometry.y), map.getZoom());
    //根据汽车ID后台获取汽车信息
    selectCarInfoByID(id);
    //汽车详细信息点击事件
    $('#cardetailsWin').css({'display': 'block'});
    $('#cam-list').hide();
    $('#car-list').hide();
    $('#layer-list').hide();
    // $('#cameradetailsWin').hide();
    //添加特定车辆详细信息
    var contentHtml = "";
    for (var i = 0; i < car_setting.length; i++) {
        if(car_setting[i].attr_show_2){
            contentHtml += "<li id='gz' style='line-height: 15px;color: #333333;font-size: 14px;padding:10px 5px 5px;'>"+
                "<span style='display: inline-block;width: 30%;vertical-align: top'>"+car_setting[i].attr_desc+"："+"</span>"+
                "<span style='display: inline-block;width: 70%;'>"+car_info[car_setting[i].attr_name]+"</span></li>"
        }
    }
    $('#detailscontentCar').html(contentHtml);
}
/*----------------------------鼠标悬停弹出Tabs popup，调用此函数。-------------------------*/
function onFeatureHoveredCar(feature) {
    //根据汽车ID后台获取汽车信息
    selectCarInfoByID(feature.style.graphicZIndex);
    var contentHtml = "";
    contentHtml +="<div style='width: 20px;height: 20px;background: rgba(255,255,255,.9);position: relative;top: 20px;left:-30px;transform: rotate(45deg);border-bottom: 1px solid#999;border-left: 1px solid #999'></div>"
    for (var i = 0; i < car_setting.length; i++) {
        if(car_setting[i].attr_show_1){
            contentHtml += "<li id='gz' style='line-height: 15px;color: #333333;font-size: 14px;padding:10px 5px 5px;'>"+
                "<span style='display: inline-block;width: 50%;vertical-align: top'>"+car_setting[i].attr_desc+"："+"</span>"+
                "<span style='display: inline-block;width: 50%;text-overflow: ellipsis;overflow: hidden;white-space: nowrap'>"+car_info[car_setting[i].attr_name]+"</span></li>"
        }
    }
    var popup1 = new SuperMap.Popup(
        "tabsInfoCar",
        new SuperMap.LonLat(feature.geometry.x, feature.geometry.y),
        new SuperMap.Size(225,140),
        contentHtml,
        null,
        true);
    popup1.autoSize = true;
    tabsInfoWinCar= popup1;
    //添加弹窗map图层
    map.addPopup(popup1);
    $('#tabsInfoCar').css({
        'left':parseInt($('#tabsInfoCar').css('left')) + 36 +"px",
        'top':parseInt($('#tabsInfoCar').css('top')) - 36 +"px",
        'width':'200px',
        'border':'1px solid #999',
        'box-shadow':'2px 2px 12px #999',
        'background':'rgba(255,255,255,.9)'
    });
    $('#tabsInfoCar_contentDiv').css({
        'width':'100%',
        'height':'100%'
    });
    if(isCar==true){
        tabsInfoWinCar.hide();
    }else{
        addPopUpCircle('featureShadowCar',feature.geometry.x,feature.geometry.y,map,'rgba(247,173,198,.5)','50','50',25,25);
    }
}
/*---------------------------点击汽车列表Tabs popup，调用此函数。-------------------------*/
function onFeatureHoveredCar1(feature) {
    //根据汽车ID后台获取汽车信息
    selectCarInfoByID(feature.style.graphicZIndex);
    var contentHtml = "";
    contentHtml +="<div style='width: 20px;height: 20px;background: rgba(255,255,255,.9);position: relative;top: 20px;left:-30px;transform: rotate(45deg);border-bottom: 1px solid#999;border-left: 1px solid #999'></div>"
    for (var i = 0; i < car_setting.length; i++) {
        if(car_setting[i].attr_show_1){
            contentHtml += "<li id='gz' style='line-height: 15px;color: #333333;font-size: 14px;padding:10px 5px 5px;'>"+
                "<span style='display: inline-block;width: 35%;vertical-align: top'>"+car_setting[i].attr_desc+"："+"</span>"+
                "<span style='display: inline-block;width: 65%;text-overflow: ellipsis;overflow: hidden;white-space: nowrap'>"+car_info[car_setting[i].attr_name]+"</span></li>"
        }
    }
    var popup1 = new SuperMap.Popup(
        "tabsInfoCar1",
        new SuperMap.LonLat(feature.geometry.x, feature.geometry.y),
        new SuperMap.Size(225,140),
        contentHtml,
        null,
        true);
    popup1.autoSize = true;
    tabsInfoWinCar= popup1;
    //添加弹窗map图层
    map.addPopup(popup1);
    $('#tabsInfoCar1').css({
        'left':parseInt($('#tabsInfoCar1').css('left')) + 36 +"px",
        'top':parseInt($('#tabsInfoCar1').css('top')) - 36 +"px",
        'width':'200px',
        'border':'1px solid #999',
        'box-shadow':'2px 2px 12px #999',
        'background':'rgba(255,255,255,.9)',
    });
    $('#tabsInfoCar1_contentDiv').css({
        'width':'100%',
        'height':'100%'
    });
    if(flag==true){
        tabsInfoWinCar.hide();
    }else{
        addPopUpCircle('featureShadowCar1',feature.geometry.x,feature.geometry.y,map,'rgba(20,88,167,.3)','50','50',25,25);
    }
}
/*--------------------------------------定义悬浮框关闭事件---------------------------------*/
function closeTabsInfoWinCar(){
    if(tabsInfoWinCar){
        tabsInfoWinCar.hide();
        tabsInfoWinCar.destroy();
    }
    if(isCar==false){
        featureShadowCar.hide();
        featureShadowCar.destroy();
    }
}
/*--------------------------定义关闭Menu点击事件--------------------------*/
function closeMenuInfoWinCar(){
    if(isCar){
        isCar = false;
        featureShadowCar.hide();
        featureShadowCar.destroy();
    }
}

/*---------------------------------------获取汽车属性-------------------------------------*/
function getCarAttr() {
    //    初始化属性
    var settings = {
        "url": window.urlName+ "/car/getCarAttrs",
        "method": "POST",
        "data":{
            mobile:mobile,
            token:token,
            type:-1
        }
    }
    $.ajax(settings).done(function (response) {
        if(response.code == 200){
        	console.log(response)
            car_setting = response.data.rows;
        }else {
            console.log(response);
        }
    });
}
/*--------------------------------------定义汽车设置属性---------------------------------*/
function openCarSettings() {
    // alert('首先执行的是这个方法')
    var contentHtml = '';
    for (var i = 0; i < car_setting.length; i++) {
        if(car_setting[i].attr_show_2){
            contentHtml += "<li><a href='javascript:;' onclick='searchCarSelect("+
                "\""+car_setting[i].attr_desc+"\""+
                ",\""+ car_setting[i].attr_name +"\")'>"+ car_setting[i].attr_desc +"</a></li>"
        }
    }
    $('#menuCarSearch').html(contentHtml);
}
/*-------------------------------------打开车辆列表-------------------------------------*/
function openCarPanel(cars){
    saveData('carsList',cars);
    var config = Array();
    var total = {
        text:'全部',
        href:'javascript:;',
        tags:cars.length,
        state:{expanded: true},
        selectable:true,
        nodes:Array()
    };//全部
    var police = {
        text:'车辆',
        href:'javascript:;',
        tags:cars.length,
        state:{expanded: false},
        selectable:true,
        nodes:Array()
    };
    var unKnow = {
        text:'未知',
        href:'javascript:;',
        tags:cars.length,
        state:{expanded: false},
        selectable:true,
        nodes:Array()
    };//未知
    car_selectId=[];
    for(var i=0; i<cars.length; i++){
        var temp = {};
        temp.text = "名称:"+cars[i].car_no;
        temp.href = "javascript:carSelected('"+JSON.stringify(cars[i])+"');";
        // temp.tags = JSON.stringify(cameras[i]);
        addPopUpCircle('car'+cars[i].id,
            cars[i].car_x,
            cars[i].car_y,map,'rgba(20,88,167,.3)','30','30',15,15);
        total.nodes.push(temp);
        car_selectId.push('car'+cars[i].id);
        if(cars[i].cam_sta==1){
            police.nodes.push(temp);
        }else if(cars[i].cam_sta==0){
            unKnow.nodes.push(temp);
        }
    }
    config.push(total);
    config.push(police);
    config.push(unKnow);

    $('#car_list').show();
    if($('#cam_list').css('display')=='none'){
        $('.carList').css({'top':'28%','z-index':'2'})
        $('#car_list').css({'top':'30%','z-index':'1'})
    }else {
        $('.carList').css({'top':'57%','z-index':'2'})
        $('#car_list').css({'top':'60%','z-index':'1'})
    }
    $('#treeviewCar').treeview({
        color: "#428bca",
        expandIcon: 'glyphicon glyphicon-chevron-right',
        collapseIcon: 'glyphicon glyphicon-chevron-down',
        data: config,
        enableLinks:true,
        highlightSelected:true,
    });
}
/*-------------------------------------通过属性搜索选中车辆列表-------------------------------------*/
function openCarPanelSelect(cars){
	map.removeAllPopup();
    saveData('carsList',cars);
    var config = Array();
    var total = {
        text:'查询结果',
        href:'javascript:;',
        tags:cars.length,
        state:{expanded: true},
        selectable:true,
        nodes:Array()
    };
    car_selectId=[];
    for(var i=0; i<cars.length; i++){
        var temp = {};
        temp.text = "车牌号:"+cars[i].car_no;
        temp.href = "javascript:carSelected('"+JSON.stringify(cars[i])+"');";
        // temp.tags = JSON.stringify(cameras[i]);
        addPopUpCircle('car'+cars[i].id,
            cars[i].car_x,
            cars[i].car_y,map,'rgba(20,88,167,.3)','30','30',15,15);
        total.nodes.push(temp);
        car_selectId.push('car'+cars[i].id);
    }
    config.push(total);

    $('#car_list').show();
    if($('#cam_list').css('display')=='none'){
        $('.carList').css({'top':'28%','z-index':'2'})
        $('#car_list').css({'top':'30%','z-index':'1'})
    }else {
        $('.carList').css({'top':'57%','z-index':'2'})
        $('#car_list').css({'top':'60%','z-index':'1'})
    }
    $('#treeviewCar').treeview({
        color: "#428bca",
        expandIcon: 'glyphicon glyphicon-chevron-right',
        collapseIcon: 'glyphicon glyphicon-chevron-down',
        data: config,
        enableLinks:true,
        highlightSelected:true
    });
}
/*-------------------------------------初始化汽车列表-----------------------------------*/
function openCarPanelAll(cars){
    saveData('carsAllList',cars);
    var config = Array();
    var total = {
        text:'全部',
        href:'javascript:;',
        tags:cars.length,
        state:{expanded: true},
        selectable:true,
        nodes:Array()
    };//全部
    var police = {
        text:'车辆',
        href:'javascript:;',
        tags:cars.length,
        state:{expanded: false},
        selectable:true,
        nodes:Array()
    };
    var unKnow = {
        text:'未知',
        href:'javascript:;',
        tags:cars.length,
        state:{expanded: false},
        selectable:true,
        nodes:Array()
    };//未知
    for(var i=0; i<cars.length; i++){
        var temp = {};
        temp.text ="车牌号:"+cars[i].car_no;
        temp.href = "javascript:carSelected('"+JSON.stringify(cars[i])+"');";
        total.nodes.push(temp);
        if(cars[i].cam_sta==1){
            police.nodes.push(temp);
        }else if(cars[i].cam_sta==0){
            unKnow.nodes.push(temp);
        }
    }
    config.push(total);
    config.push(police);
    config.push(unKnow);

    if($('#cam_list').css('display')=='none'){
        $('.carList').css({'top':'28%','z-index':'2'})
        $('#car_list').css({'top':'30%','z-index':'1'})
    }else {
        $('.carList').css({'top':'57%','z-index':'2'})
        $('#car_list').css({'top':'60%','z-index':'1'})
    }
    $('#treeviewCar').treeview({
        color: "#428bca",
        expandIcon: 'glyphicon glyphicon-chevron-right',
        collapseIcon: 'glyphicon glyphicon-chevron-down',
        data: config,
        enableLinks:true,
        highlightSelected:true
    });
}
/*-------------------------------------清空车辆列表-----------------------------------*/
function closeCarPanel() {
    var config = Array();
    var total = {
        text:'全部',
        href:'javascript:;',
        tags:0,
        state:{expanded: true},
        selectable:true,
        nodes:Array()
    };//全部
    var police = {
        text:'车辆',
        href:'javascript:;',
        tags:0,
        state:{expanded: false},
        selectable:true,
        nodes:Array()
    };
    var unKnow = {
        text:'未知',
        href:'javascript:;',
        tags:0,
        state:{expanded: false},
        selectable:true,
        nodes:Array()
    };//未知

    config.push(total);
    config.push(police);
    config.push(unKnow);
    $('#cam_list').show();
    if($('#cam_list').css('display')=='none'){
        $('.carList').css({'top':'28%','z-index':'2'})
        $('#car_list').css({'top':'30%','z-index':'1'})
    }else {
        $('.carList').css({'top':'57%','z-index':'2'})
        $('#car_list').css({'top':'60%','z-index':'1'})
    }
    $('#treeviewCar').treeview({
        color: "#428bca",
        expandIcon: 'glyphicon glyphicon-chevron-right',
        collapseIcon: 'glyphicon glyphicon-chevron-down',
        data: config,
        enableLinks:true,
        highlightSelected:true,
    });
}
/*-------------------------------------车辆高亮-----------------------------------*/
function carHighlight(name,x,y,map){
    if(tabsInfoWinCar && tabsInfoWinCar.hide){
        tabsInfoWinCar.hide();
        try{
            if(typeof(tabsInfoWinCar.destroy)=="function"){
                tabsInfoWinCar.destroy();
            }
        } catch(e){
            console.log("destroy is not a function");
        }

    }
    if(featureShadowCar && featureShadowCar.hide){
        featureShadowCar.hide();
        try{
            if(typeof(featureShadowCar.destroy)=="function"){
                featureShadowCar.destroy();
            }
        } catch(e){
            console.log("destroy is not a function");
        }
    }
    popup2 = new SuperMap.Popup(
        name,
        new SuperMap.LonLat(x, y),
        new SuperMap.Size(15,15),
        null,
        null,
        true);
    featureShadow= popup2;
    map.addPopup(popup2);
    $('#'+name).css({
        'left':parseInt($('#'+name).css('left')) - 15 +"px",
        'top':parseInt($('#'+name).css('top')) -15+"px",
        'width':'30px',
        'height':'30px',
        'border-radius':'50%',
        'background':'#ff0000',
        'opacity':'.4',
        'z-index':'340'
    });

}
/*------------------------------------车辆选择事件-------------------------------------*/
function carSelected(cars){
	console.log(cars)
    cars = JSON.parse(cars);
    //清除弹窗
    $('#Polygon1').remove();
    $('#cejuPopup').remove();
    $('#huzhiPopup').remove();
    $('#Polygon').remove();
    $('#circlePopup1').remove();
    $('#box').remove();
    cleanLayers();
    $('#carSelected').remove();
    carHighlight('carSelected',cars.car_x,cars.car_y,map);
    car_info = cars;
    var feature = {};
    feature.style = {};
    feature.style.graphicZIndex = cars.SmID;
    feature.style.dataName = cars.car_no;
    feature.style.dataAddr = cars.car_addr;
    feature.geometry = {};
    feature.geometry.x = cars.car_x;
    feature.geometry.y = cars.car_y;
    onFeatureHoveredCar1(feature);
    map.setCenter(new SuperMap.LonLat(cars.car_x ,cars.car_y), map.getZoom());
}
/*------------------------------------------------搜索车辆属性---------------------------------------*/
function searchCarSelect(name,val){  //在这里的时候应该是将name:val; val 是我们输入的值。
    $("#searchCarSelect").attr('placeholder',name)  //执行成功
    $("#searchCarSelect").attr('name',val);
}
function carSearchSettings() {
    if ($("#searchCarSelect").val() == ""){
        win.alert('提示','搜索内容不能为空');
        return
    }
    if(!$("#searchCarSelect").attr('name')){
    	win.alert('提示', '请先选择车辆属性');
    	$("#searchCarSelect").val('');
    	return
    }
    var attrName = $("#searchCarSelect").attr('name');  //在这里的时候没有值？？？？
    var attrValue = $("#searchCarSelect").val();
    console.log(attrValue,attrName)
    var carData = {
        mobile: mobile,
        token: token,
        attrName: attrName,
        attrValue: attrValue,
        page: -1,
        pageSize: 10
    };
    var settings = {
        "url": urlName + "/car/pclistbyattr",
        "method": "POST",
        "data":carData
    };

    $.ajax(settings).done(function (response) {
        console.log(response)
        if(response.code==200){
            openCarPanelSelect(response.data.rows)
            // $("#searchCarSelect").val('');
        } else if(response.code === 401){
            console.log(response.data.error);
        }else if(response.code === 501){
            console.log(response.data.error);
        }else if(response.code === 500){
            console.log(response.data.error);
        }
    });
}
/*----------------------------------------关闭车辆详细信息-----------------------------------*/
$('#cardetailsWinclose').click(function() {
    $('#tabsInfoWinCar').hide();
    $('#featureShadowCar').hide();
    $('#layer_list').hide();
    $('#cam_list').hide();
    $('#car_list').hide();
    $('#cardetailsWin').css({'display':'none'});
    closeMenuInfoWinCar();
});
/*---------------------------------------------导出汽车--------------------------------------------*/
//打开汽车导出列表
function excelCar() {
    $('.car_td').remove();
    selectCarExcel();
    $('#excelDivCar').show();
}
//点击关闭汽车导出列表
function excelOffCar() {
    $('#excelDivCar').hide();
}
//点击导出列表显示内容
function excelOutCar() {
    $('#excelDivCar').hide();
    $("#sxtlb_tabCar").table2excel({
        exclude  : ".noExl",
        filename : "carList.xls",
        name: "carList.xls",
        exclude_img: true,
        exclude_links: true,
        exclude_inputs: true
    });
    $('.car_td').remove();
}
//查询出的结果，重构表格
function selectCarExcel() {
    var Data = {};
    var html='<tr id="sxt_tr"></tr>';
    Data.mobile = readData('USER_KEY').mobile;
    Data.token = readData('USER_KEY').token;
    Data.type = -1
    $.ajax({
        url: window.urlName+'/car/getCarAttrs',
        type: 'POST',
        data: Data,
        async:false,
        success: function(data) {
            var date1 = data.data.rows;
            //add By KingDragon
            window.car_attrs = date1;
            for(var i = 1;i<date1.length;i++){
                html+="<td class='car_td'>"+date1[i].attr_desc+"</td>"
            }
            $('#sxtHeadCar').html(html)
            var html='';
            var html1 = '';

            var carList;
            //进行判断是否是全部列表
            if(readData('carsList').length>0){
                carList = readData('carsList');
            }else {
                carList = readData('carsAllList');
            }

            console.log(carList);
            for(var j = 0;j<carList.length;j++){
                html1+="<tr class='car_td'>"
                var attrname = carList[j]
                for(key in attrname){
                    for(var i = 1;i<date1.length;i++){
                        html1+="<td>"+attrname[date1[i].attr_name]+"</td>"
                    }
                    break
                }
                html1+="</tr>"
            }
            $('#sxtlb_tabCar').append(html+html1)
        },
        error: function(data) {
            console.log(data);
        }
    });
}
/*--------------------------------------------详细信息可拖动---------------------------------------*/
$(function () {
    //创建小方块的jquery对象
    var $cardetailsWin = $("#cardetailsWin");
    //创建小方块的鼠标点按下事件
    $cardetailsWin.mousedown(function (event) {
        //获取鼠标按下的时候左侧偏移量和上侧偏移量
        var old_left = event.pageX;//左侧偏移量
        var old_top = event.pageY;//竖直偏移量

        //获取鼠标的位置
        var old_position_left = $(this).position().left;
        var old_position_top = $(this).position().top;

        //鼠标移动
        $(document).mousemove(function (event) {
            var new_left = event.pageX;//新的鼠标左侧偏移量
            var new_top = event.pageY;//新的鼠标竖直方向上的偏移量

            //计算发生改变的偏移量是多少
            var chang_x = new_left - old_left;
            var change_y = new_top - old_top;

            //计算出现在的位置是多少

            var new_position_left = old_position_left + chang_x;
            var new_position_top = old_position_top + change_y;
            //加上边界限制
            if(new_position_top<0){//当上边的偏移量小于0的时候，就是上边的临界点，就让新的位置为0
                new_position_top=0;
            }
            //如果向下的偏移量大于文档对象的高度减去自身的高度，就让它等于这个高度
            if(new_position_top>$(document).height()-$cardetailsWin.height()){
                new_position_top=$(document).height()-$cardetailsWin.height();
            }
            //右限制
            if(new_position_left>$(document).width()-$cardetailsWin.width()){
                new_position_left=$(document).width()-$cardetailsWin.width();
            }
            if(new_position_left<0){//左边的偏移量小于0的时候设置 左边的位置为0
                new_position_left=0;
            }

            $cardetailsWin.css({
                left: new_position_left + 'px',
                top: new_position_top + 'px'
            })
        });
        $cardetailsWin.mouseup(function(){
            $(document).off("mousemove");
        })
    });
});
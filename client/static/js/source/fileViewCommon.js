// {=======pdf、jpg、png文件预览公共方法=========}
var currentAngel=0;  //初始化图片角度
var currentFileIndex;  //当前显示文件key对应fileTypeMap数组的下标
/* demo:  整个循环数据结构
 fileTypeMsgArray:[
              {
                  id:3232,  文件唯一标识
                  fileName:abc.jpg,
                  ...
              },
              {
                  fileName:abc.pdf, 文件唯一标识
                  fileDownloadPath:xxxxx
                  ...
              },
             ]
*/
$(function(){
    //*图片拖拽功能*/
    var oImg = document.getElementById('THoImg');
    addEvent(oImg, 'mousedown', function(ev) {
        var oEvent = prEvent(ev),
        oParent = oImg.parentNode,
        disX = oEvent.clientX - oImg.offsetLeft-350,  
        disY = oEvent.clientY - oImg.offsetTop+30,
        startMove = function(ev) {
            if (oParent.setCapture) {
                oParent.setCapture();
            }
            var oEvent = ev || window.event,
            l = oEvent.clientX - disX,
            t = oEvent.clientY - disY;
            oImg.style.left = l +'px';
            oImg.style.top = t +'px';
            oParent.onselectstart = function() {
                return false;
            }
        }, endMove = function(ev) {
            if (oParent.releaseCapture) {
                oParent.releaseCapture();
            }
            oParent.onselectstart = null;
            removeEvent(oParent, 'mousemove', startMove);
            removeEvent(oParent, 'mouseup', endMove);
        };
        addEvent(oParent, 'mousemove', startMove);
        addEvent(oParent, 'mouseup', endMove);
        return false;
    });
    /*以鼠标位置为中心的滑轮放大功能*/
    addWheelEvent(oImg, function(delta) {
        var ratioL = (this.clientX - oImg.offsetLeft) / oImg.offsetWidth,
        ratioT = (this.clientY - oImg.offsetTop) / oImg.offsetHeight,
        ratioDelta = !delta ? 1 + 0.1 : 1 - 0.1,
        w = parseInt(oImg.offsetWidth * ratioDelta),
        h = parseInt(oImg.offsetHeight * ratioDelta),
        l = Math.round(this.clientX - (w * ratioL))+350,
        t = Math.round(this.clientY - (h * ratioT+30));
        oImg.style.width = w +'px';
        // oImg.style.height = h +'px';
        oImg.style.left = l +'px';
        oImg.style.top = t +'px';
    });
})

/**
 * 上一张
 * @param {*} fileTypeMsgArray 循环下标对应的数组
 */
function FprevImg(fileTypeMsgArray,platformFlag){
    initBigImgDeg();
    currentFileIndex-=1;
    if(currentFileIndex<0){ 
        currentFileIndex=fileTypeMsgArray.length-1;
    }
    showFile(currentFileIndex,fileTypeMsgArray,platformFlag);
}

/**
 * 下一张
 * @param {*} fileTypeMsgArray 循环下标对应的数组
 */
function FnextImg(fileTypeMsgArray,platformFlag){
    initBigImgDeg();
    currentFileIndex+=1;
    if(currentFileIndex>=fileTypeMsgArray.length){
        currentFileIndex=0;
    }
    showFile(currentFileIndex,fileTypeMsgArray,platformFlag);
}
/**
 * 显示文件
 * index 当前key值对应THfileTypeMap的下标
 * fileTypeMsgArray  当前fileID对应的文件详情
 */
function showFile(index,fileTypeMsgArray,platformFlag){
    
    currentFileIndex=index;
    if(!fileTypeMsgArray || fileTypeMsgArray.length<=0){
        console.log("文件列表数据为空！");
        return;
    }
    var fiteMsg=fileTypeMsgArray[index];  //获取对应下标的文件信息
    if(!fiteMsg){
        console.error('error:fiteMsg 未获取到文件');
        return;
    }
    var fileName=fiteMsg.fileName?fiteMsg.fileName:'';
    var fileId=fiteMsg.id;
    if(platformFlag == 'SUPPLY'||platformFlag == 'AG'){
        fileId=fiteMsg.fileId;
    }
    if(!fileName && !fileId){
        alert("没有文件信息！");
        return;
    }
    var fileType=fileName?fileName.substring(fileName.lastIndexOf(".")+1,fileName.length):'';
    if(fileName&&fileName.lastIndexOf("?")>0){
        fileType=fileName.substring(fileName.lastIndexOf(".")+1,fileName.lastIndexOf("?"));
    }
    if(fileType){
        fileType=fileType.toLowerCase();
    }
    if(platformFlag == 'AG'){
        fileType = fiteMsg.type;
        fileName = fileType=='pdf'?'agricluture.pdf':'';
    }
    console.log(fileType);
    $(".JPGdom,#PDFdom,.transform-img,.Otherdom,.discern,.downLoadMp3,.videoDiv").addClass("hidden");
    document.getElementsByTagName('audio')[0].src="";
    document.getElementsByTagName('video')[0].src="";
    if(platformFlag=="SUPPLY"||fileType=="jpg" || fileType=="png"|| fileType=="jpeg"|| fileType=="tiff"|| fileType=="bmp"|| fileType=="raw"){  //============显示图片==============================
        $(".JPGdom,.transform-img").removeClass("hidden");  //图片容器和旋转图片的按钮隐藏
        $(".JPGdom img").attr("src","/node/file/down?isDown=NO&fileId="+fileId+"&fileName="+fileName);
    }else if(fileType=="pdf"){  //===========显示PDF==============================
        var h = document.documentElement.clientHeight;
        $("#PDFdom").removeClass("hidden").height(h-80);
        var options = {
            height: "100%",
            fallbackLink: "<p>您的浏览器暂不支持此pdf，请下载最新的浏览器</p>"
            };
        // pdfURL
        if(fileId){
            PDFObject.embed("/node/file/down?isDown=NO&fileId="+fileId+"&fileName="+fileName, "#PDFdom",options);
        }else{
            PDFObject.embed("/node/file/down?isDown=NO&fileId=0&fileName=a.pdf&fileURL="+fiteMsg.fileDownloadPath, "#PDFdom",options);
        }
    }else if(fileType=="word" || fileType=="excel" || fileType=="xlsx" || fileType=="xls"){    //===========显示word+excle表格==============================
         $(".Otherdom").removeClass("hidden");
         $(".Otherdom iframe").attr("src","/node/file/down?isDown=NO&fileId="+fileId+"&fileName="+fileName);
    }else if(fileType.toLocaleLowerCase()=="mp3" || fileType.toLocaleLowerCase()=="wav" || fileType.toLocaleLowerCase()=="act" || fileType.toLocaleLowerCase()=="wma"){
        $(".audioDiv,.downLoadMp3").removeClass("hidden");
        let audio=document.getElementsByTagName('audio')[0];
        audio.src="/node/file/down?isDown=NO&fileId="+fileId+"&fileName="+fileName;
        audio.load();
        $(".img-ctrl .downLoadMp3").attr("href","/node/file/down?isDown=YES&fileId="+fileId+"&fileName="+fileName);
    }else if(fileType.toLocaleLowerCase()=="mp4" || fileType.toLocaleLowerCase()=="ogg"){
        $(".videoDiv,.downLoadMp3").removeClass("hidden");
        let video=document.getElementsByTagName('video')[0];
        video.src="/node/file/down?isDown=NO&fileId="+fileId+"&fileName="+fileName;
        video.load();
        $(".img-ctrl .downLoadMp3").attr("href","/node/file/down?isDown=YES&fileId="+fileId+"&fileName="+fileName);
    }else if(fileType.toLocaleLowerCase()=="webp"){
        let userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
        if (userAgent.indexOf("Chrome") > -1){ //判断是否chorme浏览器
            $(".JPGdom,.transform-img").removeClass("hidden");  //图片容器和旋转图片的按钮隐藏
            $(".JPGdom img").attr("src","/node/file/down?isDown=NO&fileId="+fileId+"&fileName="+fileName);
        }else{
            $(".discern").removeClass("hidden");
            $(".discern").text('sorry，暂不支持预览'+fileType+'格式文件！');
            let isDownLoad=confirm('sorry，暂不支持预览'+fileType+'格式文件！，是否需要下载该文件到本地？');
            if(isDownLoad){
                window.location="/node/file/down?isDown=NO&fileId="+fileId+"&fileName="+fileName
            }
        }
    }else{  
        $(".discern").removeClass("hidden");
        $(".discern").text('sorry，暂不支持预览'+fileType+'格式文件！');
        let isDownLoad=confirm('sorry，暂不支持预览'+fileType+'格式文件！，是否需要下载该文件到本地？');
        if(isDownLoad){
            window.location="/node/file/down?isDown=YES&fileId="+fileId+"&fileName="+fileName
        }
    }
}

//初始化大图
function initBigImgDeg(){
    $(".img-popup").css({
        "transform":'rotate(0deg)',
        "-ms-transform":'rotate(0deg)', /* Internet Explorer */
        "-moz-transform":'rotate(0deg)', /* Firefox */
        "-webkit-transform":'rotate(0deg)', /* Safari 和 Chrome */
        "-o-transform":'rotate(0deg)', /* Opera */
    });
}
//图片旋转
function FimgTranform(){
    currentAngel+=1
    $(".img-popup").css({
        "transform":'rotate('+currentAngel*90+'deg)',
        "-ms-transform":'rotate('+currentAngel*90+'deg)', /* Internet Explorer */
        "-moz-transform":'rotate('+currentAngel*90+'deg)', /* Firefox */
        "-webkit-transform":'rotate('+currentAngel*90+'deg)', /* Safari 和 Chrome */
        "-o-transform":'rotate('+currentAngel*90+'deg)', /* Opera */
    })        
}
/*滚轮--绑定事件*/
function addEvent(obj, sType, fn) {
	if (obj.addEventListener) {
		obj.addEventListener(sType, fn, false);
	} else {
		obj.attachEvent('on' + sType, fn);
	}
};
function removeEvent(obj, sType, fn) {
	if (obj.removeEventListener) {
		obj.removeEventListener(sType, fn, false);
	} else {
		obj.detachEvent('on' + sType, fn);
	}
};
function prEvent(ev) {
	var oEvent = ev || window.event;
	if (oEvent.preventDefault) {
		oEvent.preventDefault();
	}
	return oEvent;
}
/*添加滑轮事件*/
function addWheelEvent(obj, callback) {
	if (window.navigator.userAgent.toLowerCase().indexOf('firefox') != -1) {
		addEvent(obj, 'DOMMouseScroll', wheel);
	} else {
		addEvent(obj, 'mousewheel', wheel);
	}
	function wheel(ev) {
		var oEvent = prEvent(ev),
		delta = oEvent.detail ? oEvent.detail > 0 : oEvent.wheelDelta < 0;
		callback && callback.call(oEvent,delta);
		return false;
	}
};
//# sourceURL=historyInfoFile.js
var thirdFilesResponseOldDTO={};  //文件-第三方
var platforFileInfo={};  //文件-平台
var THfileTypeMap=[];  //=======
var THfileTypeArray=[];  //文件类型 -- 第三方，循环用---
var XYHfileTypeArray=[];  //小雨花文件
var currentIndexTH;  //第三方文件当前显示文件对应fileTypeMap keys 数组的下标
var currentIndexPF;  //平台文件当前显示文件对应fileTypeMap keys 数组的下标
var currentIndexXYH;  //平台文件当前显示文件对应fileTypeMap keys 数组的下标
var PFfileInfoArray=[]; //文件数据 -- 平台，循环用---

var loanNo=GetQueryString("loanNo");  
var orderNo=GetQueryString("orderNo");  
var cooperationFlag=GetQueryString("cooperationFlag");  
var platformFlag=GetQueryString("platformFlag");  

$(function(){
    getIdentityInfo();  
})

//获取文件数据
function getIdentityInfo(){
    var indexKey;
    $.ajax({
        type:"post", 
        url:"/node/search/identity/info", 
        async:true,
        dataType: "JSON", 
        data:{
            loanNo:loanNo,
            orderNo:orderNo,
            cooperationFlag:cooperationFlag,
            fromFlag:platformFlag,
            label:'cp-historyInfoFile'
        },
        success:function(res){
            if(!ajaxGetCode(res)){
                thirdFilesResponseOldDTO={};   //文件-第三方
                platforFileInfo={};  //文件-平台
                THfileTypeArray=[];
                XYHfileTypeArray=[];
                return;
            }
            var _data=res.data?res.data:{};
            if(platformFlag=="XYH"){
                    XYHfileTypeArray=[]; 
                    let filesInfos=_data.filesInfos?_data.filesInfos:{};//
                    let historyContractFile=filesInfos.historyContractFile?filesInfos.historyContractFile:[]; //历史。合同文件 (共有)
                    let historyGroupPhotoFile=filesInfos.historyGroupPhotoFile?filesInfos.historyGroupPhotoFile:[]; //历史  合照图片(教育分期)
                    let historyProofPhoto=filesInfos.historyProofPhoto?filesInfos.historyProofPhoto:[]; //历史  学历/工作/(教育分期)
                    let historyParentalProofPhoto=filesInfos.historyParentalProofPhoto?filesInfos.historyParentalProofPhoto:[]; //历史  亲子证明照(教育分期)
                    let historyOtherFile=filesInfos.historyOtherFile?filesInfos.historyOtherFile:[]; //历史  其他文件(教育分期)

                    let historyProductConfirm=filesInfos.historyProductConfirm?filesInfos.historyProductConfirm:[];  //服务-商品交付确认书
                    let historySurgeryConsent=filesInfos.historySurgeryConsent?filesInfos.historySurgeryConsent:[];  //手术项目同意书
                    let historyPaymentVoucher=filesInfos.historyPaymentVoucher?filesInfos.historyPaymentVoucher:[];  //首付凭证-医疗美容分期
                    let historyRepaymentVoucher=filesInfos.historyRepaymentVoucher?filesInfos.historyRepaymentVoucher:[];  //还款来源凭证-医疗美容分期

                    if(historyContractFile.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(historyContractFile);
                    }
                    if(historyGroupPhotoFile.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(historyGroupPhotoFile);
                    }
                    if(historyProofPhoto.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(historyProofPhoto);
                    }
                    if(historyParentalProofPhoto.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(historyParentalProofPhoto);
                    }
                    if(historyOtherFile.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(historyOtherFile);
                    }

                    if(historyProductConfirm.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(historyProductConfirm);
                    }
                    if(historySurgeryConsent.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(historySurgeryConsent);
                    }
                    if(historyPaymentVoucher.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(historyPaymentVoucher);
                    }
                    if(historyRepaymentVoucher.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(historyRepaymentVoucher);
                    }
                    indexKey=GetQueryString("key");
                    for(var i=0;i<XYHfileTypeArray.length;i++){
                        var XYHfileTypeArray_i=XYHfileTypeArray[i];
                        if(indexKey==$.md5((XYHfileTypeArray_i.id).toString())){
                            currentIndexXYH=XYHfileTypeArray.indexOf(XYHfileTypeArray_i);
                        }
                    }
                    showFile(currentIndexXYH,XYHfileTypeArray);
                }
       }
   })
}

//上一张
function prevImg(){
    if(platformFlag=="TH"){
        FprevImg(THfileTypeArray);
    }else if(platformFlag=="PF"){
        FprevImg(PFfileInfoArray);
    }else if(platformFlag=="XYH"){
        FprevImg(XYHfileTypeArray);
    }
}

//下一张
function nextImg(){
    if(platformFlag=="TH"){
        FnextImg(THfileTypeArray);
    }else if(platformFlag=="PF"){
        FnextImg(PFfileInfoArray);
    }else if(platformFlag=="XYH"){
        FnextImg(XYHfileTypeArray);
    }
}

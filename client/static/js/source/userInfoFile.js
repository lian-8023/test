//# sourceURL=userInfoFile.js
var thirdFilesResponseOldDTO={};  //文件-第三方
var platforFileInfo={};  //文件-平台
var THfileTypeMap=[];  //=======
var THfileTypeArray=[];  //文件类型 -- 第三方，循环用---
var XYHfileTypeArray=[];  //小雨花文件
var GYLfileTypeArray=[];//供应链文件
var NYfileTypeArray=[];//农业文件
var currentIndexTH;  //第三方文件当前显示文件对应fileTypeMap keys 数组的下标
var currentIndexPF;  //平台文件当前显示文件对应fileTypeMap keys 数组的下标
var currentIndexXYH;  //平台文件当前显示文件对应fileTypeMap keys 数组的下标
var currentIndexGYL;  //平台文件当前显示文件对应fileTypeMap keys 数组的下标
var currentIndexNY;  //平台文件当前显示文件对应fileTypeMap keys 数组的下标
var PFfileInfoArray=[]; //文件数据 -- 平台，循环用---

var loanNo=GetQueryString("loanNo");  
var orderNo=GetQueryString("orderNo");  
var cooperationFlag=GetQueryString("cooperationFlag");  
var platformFlag=GetQueryString("platformFlag");
var nationalId = GetQueryString("nationalId");

$(function(){
    getIdentityInfo();  
})

//获取文件数据
function getIdentityInfo(){
    var indexKey;
    var type = 'post';
    var url = "/node/search/identity/info";
    var data = {
        loanNo:loanNo,
        orderNo:orderNo,
        cooperationFlag:cooperationFlag,
        fromFlag:platformFlag,
        label:'userInfoFile'
    };
    if(platformFlag == 'SUPPLY'){
        type = 'get';
        url = '/node/inner/getBorrowerDetailInfo';
        if(!loanNo){
            alert('未获取到合同号！');
            return;
        }
        data={
            loanNo:loanNo,
            productNo:cooperationFlag
        }
    }
    $.ajax({
        type:type, 
        url:url, 
        async:true,
        dataType: "JSON", 
        data:data,
        success:function(res){
            if(!ajaxGetCode(res)){
                thirdFilesResponseOldDTO={};   //文件-第三方
                platforFileInfo={};  //文件-平台
                THfileTypeArray=[];
                XYHfileTypeArray=[];
                return;
            }
            var _data=res.data?res.data:{};
            let platforFileInfo={  //平台文件
                platformProveFilesInfoDTO:_data.platformProveFilesInfoDTO?_data.platformProveFilesInfoDTO:[],  //证明文件
                platformIdentityCardFilesInfoDTO:_data.platformIdentityCardFilesInfoDTO?_data.platformIdentityCardFilesInfoDTO:[],  //身份证文件
                platformContractFilesInfoDTO:_data.platformContractFilesInfoDTO?_data.platformContractFilesInfoDTO:[],  //合同文件
                operateReportFileInfoDTO:_data.operateReportFileInfoDTO?_data.operateReportFileInfoDTO:[],  //运营商报告
                faceRecogniseFilesInfoDTO:_data.faceRecogniseFilesInfoDTO?_data.faceRecogniseFilesInfoDTO:[],  //人脸识别
            }
            let thirdFileInfo={  //第三方文件
                contractsFileMap:_data.thirdFilesResponseOldDTO?_data.thirdFilesResponseOldDTO.contractsFileMap:{},  //合同文件-wml
                identityDocumentsMap:_data.thirdIdentityResponseOldDTO?_data.thirdIdentityResponseOldDTO.identityDocumentsMap:{},  //身份证文件-whw
                proveDocumentsMap:_data.thirdIdentityResponseOldDTO?_data.thirdIdentityResponseOldDTO.proveDocumentsMap:{},  //证明文件-whw
            };
            let xyhFileInfo={  //小雨花文件
                faceFile:_data.faceFile?_data.faceFile:[],  //人脸识别图片
                groupPhotoFile:_data.groupPhotoFile?_data.groupPhotoFile:[],  //合照图片
                idCardFile:_data.idCardFile?_data.idCardFile:[],  //身份证图片
                otherFile:_data.otherFile?_data.otherFile:[],  //附加文件
                contractDocFile:_data.contractDocFile?_data.contractDocFile:[],  //合同文件
            }
                thirdFilesResponseOldDTO=thirdFileInfo;   //文件-第三方
                // platforFileInfo=platforFileInfo;  //文件-平台
                if(platformFlag=="TH"){
                    THfileTypeMap=(_data.thirdIdentityResponseOldDTO&&_data.thirdIdentityResponseOldDTO.fileTypeMap)?_data.thirdIdentityResponseOldDTO.fileTypeMap:{};  //文件类型
                    if(!THfileTypeMap){
                        console.log("warn:后端接口没有返回 fileTypeMap 字段！");
                    }
                    for(var key in THfileTypeMap){
                        var _obj=THfileTypeMap[key]
                        THfileTypeArray.push(_obj);
                    }
                    PFfileInfoArray=[];  //清空平台文件循环数据
                    //将合同文件追加到 THfileTypeMap 对象，以做上下张循环
                    var THcontractsFileMap=thirdFilesResponseOldDTO.contractsFileMap;  //第三方合同文件-全是pdf类型
                    for(var key in THcontractsFileMap){  
                        THfileTypeArray.push({
                            nameId:key,
                            fileName:key+".pdf",
                            fileDownloadPath:THcontractsFileMap[key]
                        })
                    }
                    let indexKey_code=GetQueryString("key");
                    indexKey=decodeURI(indexKey_code);
                    for(var i=0;i<THfileTypeArray.length;i++){
                        var THfileTypeArray_i=THfileTypeArray[i];
                        if(THfileTypeArray_i.id){
                            if(indexKey==$.md5((THfileTypeArray_i.id).toString())){
                                currentIndexTH=THfileTypeArray.indexOf(THfileTypeArray_i);
                            }
                        }else if(indexKey==$.md5((THfileTypeArray_i.nameId).toString())){
                            currentIndexTH=THfileTypeArray.indexOf(THfileTypeArray_i);
                        }
                    }
                    showFile(currentIndexTH,THfileTypeArray);
                }else if(platformFlag=="PF"){
                    THfileTypeArray=[];  //清空第三方文件循环数据
                    if(platforFileInfo.platformProveFilesInfoDTO.length>0){
                        PFfileInfoArray=PFfileInfoArray.concat(platforFileInfo.platformProveFilesInfoDTO);
                    }
                    if(platforFileInfo.platformIdentityCardFilesInfoDTO.length>0){
                        PFfileInfoArray=PFfileInfoArray.concat(platforFileInfo.platformIdentityCardFilesInfoDTO);
                    }
                    if(platforFileInfo.platformContractFilesInfoDTO.length>0){
                        PFfileInfoArray=PFfileInfoArray.concat(platforFileInfo.platformContractFilesInfoDTO);
                    }
                    if(platforFileInfo.faceRecogniseFilesInfoDTO.length>0){
                        PFfileInfoArray=PFfileInfoArray.concat(platforFileInfo.faceRecogniseFilesInfoDTO);
                    }
                    if(platforFileInfo.operateReportFileInfoDTO.length>0){
                        PFfileInfoArray=PFfileInfoArray.concat(platforFileInfo.operateReportFileInfoDTO);
                    }
                    indexKey=GetQueryString("key");
                    for(var i=0;i<PFfileInfoArray.length;i++){
                        var PFfileInfoArray_i=PFfileInfoArray[i];
                        if(indexKey==$.md5((PFfileInfoArray_i.id).toString())){
                            currentIndexPF=PFfileInfoArray.indexOf(PFfileInfoArray_i);
                        }
                    }
                    showFile(currentIndexPF,PFfileInfoArray);
                }else if(platformFlag=="XYH"){
                    XYHfileTypeArray=[]; 
                    let filesInfos=_data.filesInfos?_data.filesInfos:{};//
                    let contractOnlineFile=filesInfos.contractOnlineFile?filesInfos.contractOnlineFile:[]; //在线签署文件
                    let notificationLetterPhoto=filesInfos.notificationLetterPhoto?filesInfos.notificationLetterPhoto:[];//告知函照：
                    let proofPhoto=filesInfos.proofPhoto?filesInfos.proofPhoto:[];//学历/工作
                    let parentalProofPhoto=filesInfos.parentalProofPhoto?filesInfos.parentalProofPhoto:[];//亲子证明照
                    let mobilePhoneBoxPhoto=filesInfos.mobilePhoneBoxPhoto?filesInfos.mobilePhoneBoxPhoto:{};//手机盒串码照：
                    let notificationLetterGroupPhoto=filesInfos.notificationLetterGroupPhoto?filesInfos.notificationLetterGroupPhoto:{};//手持函合照
                
                    // let productConfirm=filesInfos.productConfirm?filesInfos.productConfirm:[];//服务-商品交付确认书-医疗美容分期
                    let surgeryConsent=filesInfos.surgeryConsent?filesInfos.surgeryConsent:[];//手术项目同意书-医疗美容分期
                    let paymentVoucher=filesInfos.paymentVoucher?filesInfos.paymentVoucher:[];//首付凭证-医疗美容分期
                    let repaymentVoucher=filesInfos.repaymentVoucher?filesInfos.repaymentVoucher:[];//还款来源凭证-医疗美容分期

                    let photosBeforeSurgery=filesInfos.photosBeforeSurgery?filesInfos.photosBeforeSurgery:[];//手术前照片
                    let photosAfterSurgery=filesInfos.photosAfterSurgery?filesInfos.photosAfterSurgery:[];//手术后照片
                    let surgicalSheet=filesInfos.surgicalSheet?filesInfos.surgicalSheet:[];//手术单
                    let historyPhotosBeforeSurgery=filesInfos.historyPhotosBeforeSurgery?filesInfos.historyPhotosBeforeSurgery:[];//历史手术前照片
                    let historyPhotosAfterSurgery=filesInfos.historyPhotosAfterSurgery?filesInfos.historyPhotosAfterSurgery:[];//历史手术后照片
                    let historySurgicalSheet=filesInfos.historySurgicalSheet?filesInfos.historySurgicalSheet:[];//历史手术单
                    let siteProve=filesInfos.siteProve?filesInfos.siteProve:[];//现场证明资料
                    let historySiteProve=filesInfos.historySiteProve?filesInfos.historySiteProve:[];//历史现场证明资料
                    let photosBeforeBodySurgery=filesInfos.photosBeforeBodySurgery?filesInfos.photosBeforeBodySurgery:[];//术前手术部位照
                    let photosAfterBodySurgery=filesInfos.photosAfterBodySurgery?filesInfos.photosAfterBodySurgery:[];//历史手术前照片
                    let historyPhotosBeforeBodySurgery=filesInfos.historyPhotosBeforeBodySurgery?filesInfos.historyPhotosBeforeBodySurgery:[];//历史手术后照片
                    let historyPhotosAfterBodySurgery=filesInfos.historyPhotosAfterBodySurgery?filesInfos.historyPhotosAfterBodySurgery:[];//历史手术后照片

                    // if(productConfirm.length>0){
                    //     XYHfileTypeArray=XYHfileTypeArray.concat(productConfirm);
                    // }
                    if(surgeryConsent.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(surgeryConsent);
                    }
                    if(paymentVoucher.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(paymentVoucher);
                    }
                    if(repaymentVoucher.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(repaymentVoucher);
                    }

                    if(xyhFileInfo.groupPhotoFile.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(xyhFileInfo.groupPhotoFile);
                    }
                    if(xyhFileInfo.faceFile.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(xyhFileInfo.faceFile);
                    }
                    if(xyhFileInfo.idCardFile.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(xyhFileInfo.idCardFile);
                    }
                    if(xyhFileInfo.otherFile.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(xyhFileInfo.otherFile);
                    }
                    if(xyhFileInfo.contractDocFile.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(xyhFileInfo.contractDocFile);
                    }
                    if(contractOnlineFile.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(contractOnlineFile);
                    }
                    if(notificationLetterPhoto.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(notificationLetterPhoto);
                    }
                    if(proofPhoto.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(proofPhoto);
                    }
                    if(parentalProofPhoto.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(parentalProofPhoto);
                    }
                    if(photosBeforeSurgery.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(photosBeforeSurgery);
                    }
                    if(photosAfterSurgery.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(photosAfterSurgery);
                    }
                    if(surgicalSheet.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(surgicalSheet);
                    }
                    if(historyPhotosBeforeSurgery.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(historyPhotosBeforeSurgery);
                    }
                    if(historyPhotosAfterSurgery.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(historyPhotosAfterSurgery);
                    }
                    if(historySurgicalSheet.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(historySurgicalSheet);
                    }
                      
                    if(siteProve.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(siteProve);
                    }
                    if(historySiteProve.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(historySiteProve);
                    }
                    if(photosBeforeBodySurgery.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(photosBeforeBodySurgery);
                    }
                    if(photosAfterBodySurgery.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(photosAfterBodySurgery);
                    }
                    if(historyPhotosBeforeBodySurgery.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(historyPhotosBeforeBodySurgery);
                    }
                    if(historyPhotosAfterBodySurgery.length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat(historyPhotosAfterBodySurgery);
                    }
                    if(Object.keys(mobilePhoneBoxPhoto).length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat([{
                            id:mobilePhoneBoxPhoto.id,
                            fileName:mobilePhoneBoxPhoto.fileName
                        }]);
                    }
                    if(Object.keys(notificationLetterGroupPhoto).length>0){
                        XYHfileTypeArray=XYHfileTypeArray.concat([{
                            id:notificationLetterGroupPhoto.id,
                            fileName:notificationLetterGroupPhoto.fileName
                        }]);
                    }
                    indexKey=GetQueryString("key");
                    for(var i=0;i<XYHfileTypeArray.length;i++){
                        var XYHfileTypeArray_i=XYHfileTypeArray[i];
                        if(indexKey==$.md5((XYHfileTypeArray_i.id).toString())){
                            currentIndexXYH=XYHfileTypeArray.indexOf(XYHfileTypeArray_i);
                        }
                    }
                    showFile(currentIndexXYH,XYHfileTypeArray);
                }else if(platformFlag=="SUPPLY"){
                    GYLfileTypeArray=[]; 
                    let elsePicInfos=_data.elsePicInfos?_data.elsePicInfos:[]; //其他图片
                    let idCardInfos=_data.idCardInfos?_data.idCardInfos:[]; //身份证图片

                    if(idCardInfos.length>0){
                        GYLfileTypeArray=GYLfileTypeArray.concat(idCardInfos);
                    }
                    if(elsePicInfos.length>0){
                        GYLfileTypeArray=GYLfileTypeArray.concat(elsePicInfos);
                    }

                    indexKey=GetQueryString("key");
                    for(var i=0;i<GYLfileTypeArray.length;i++){
                        var GYLfileTypeArray_i=GYLfileTypeArray[i];
                        if(GYLfileTypeArray_i.fileId&&indexKey==$.md5((GYLfileTypeArray_i.fileId).toString())){
                            currentIndexGYL=GYLfileTypeArray.indexOf(GYLfileTypeArray_i);
                        }
                    }
                    showFile(currentIndexGYL,GYLfileTypeArray,platformFlag);
                }else if(platformFlag=="AG"){
                    NYfileTypeArray=[]; 
                    let creditContractList=_data.creditContractList?_data.creditContractList:[]; //其他图片
                    let loanContractList=_data.loanContractList?_data.loanContractList:[]; //身份证图片
                    let files=_data.userInfo?_data.userInfo.files:[]; //身份证图片

                    if(creditContractList.length>0){
                        creditContractList.map(v=>{
                            v.type = 'pdf';
                        })
                        NYfileTypeArray=NYfileTypeArray.concat(creditContractList);
                    }
                    if(loanContractList.length>0){
                        loanContractList.map(v=>{
                            v.type = 'pdf';
                        })
                        NYfileTypeArray=NYfileTypeArray.concat(loanContractList);
                    }
                    if(files.length>0){
                        files.map(v=>{
                            v.type = 'png';
                        })
                        NYfileTypeArray=NYfileTypeArray.concat(files);
                    }
                    indexKey=GetQueryString("key");
                    for(var i=0;i<NYfileTypeArray.length;i++){
                        var NYfileTypeArray_i=NYfileTypeArray[i];
                        if(indexKey==$.md5((NYfileTypeArray_i.fileId).toString())){
                            currentIndexNY=NYfileTypeArray.indexOf(NYfileTypeArray_i);
                        }
                    }
                    showFile(currentIndexNY,NYfileTypeArray,platformFlag);
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
    }else if(platformFlag=="SUPPLY"){
        FprevImg(GYLfileTypeArray,platformFlag);
    }else if(platformFlag=="AG"){
        FprevImg(NYfileTypeArray,platformFlag);
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
    }else if(platformFlag=="SUPPLY"){
        FnextImg(GYLfileTypeArray,platformFlag);
    }else if(platformFlag=="AG"){
        FnextImg(NYfileTypeArray,platformFlag);
    }
}

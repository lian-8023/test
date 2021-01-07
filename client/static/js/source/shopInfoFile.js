// import CommonJs from "./common/common";
// var commonJs=new CommonJs;
// var ProductConfig = require('../template/poductConfig');

//# sourceURL=shopInfoFile.js
var thirdFilesResponseOldDTO={};  //文件-第三方
var platforFileInfo={};  //文件-平台
var THfileTypeMap=[];  //=======
var THfileTypeArray=[];  //文件类型 -- 第三方，循环用---
var currentIndexTH;  //第三方文件当前显示文件对应fileTypeMap keys 数组的下标
var currentIndexPF;  //平台文件当前显示文件对应fileTypeMap keys 数组的下标
var PFfileInfoArray=[]; //文件数据 -- 平台，循环用---

var _productNo=GetQueryString("productNo");  
var _storeId=GetQueryString("storeId");  
var _storeName=GetQueryString("storeName");  

$(function(){
    // console.log(ProductConfig)
    getIdentityInfo();  
})

//获取文件数据
function getIdentityInfo(){
    $.ajax({
         type:"post", 
         url:"/node/store/searchStore", 
         async:true,
         dataType: "JSON", 
         timeout : 60000, //超时时间设置，单位毫秒
         data:{
            queueReloadEnum:"RELOAD",
            productNo:_productNo,
            storeId:_storeId,
            // storeName:_storeName
         }, 
         beforeSend:function(XMLHttpRequest){
            let loading_html='<div id="loading">'+
                                    '<div class="tanc_bg"></div>'+
                                    '<div class="ant-spin ant-spin-lg ant-spin-spinning ant-spin-show-text"><span class="ant-spin-dot"><i></i><i></i><i></i><i></i></span><div class="ant-spin-text">Loading...</div></div>'+
                                '</div>';
            $("body").append(loading_html);       
        },
        complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
            $("#loading").remove();
    　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
    　　　　     ajaxTimeOut.abort(); //取消请求
    　　　　　   alert("请求超时");
    　　　　}
    　　},
        success:function(res){
            $("#loading").remove();
            if(!ajaxGetCode(res)){
                THfileTypeArray=[];
                 return;
            }
            let _data=res.data;
            if(_data.storeContractId){
                THfileTypeArray.push(_data.storeContractId);
            }
            if(_data.businessLicenseFileId){
                THfileTypeArray.push(_data.businessLicenseFileId);
            }
            if(_data.leaseagreementId){
                THfileTypeArray.push(_data.leaseagreementId);
            }
            if(_data.sitephotosId){
                THfileTypeArray.push(_data.sitephotosId);
            }
            
            let new_storeFiles=[];
            if(_data.storeFiles && _data.storeFiles.length>0){
                new_storeFiles=(_data.storeFiles);  //门店信息文件
            }
            if(_data.complianceManageDeclaration && Object.keys(_data.complianceManageDeclaration).length>0){
                new_storeFiles.push(_data.complianceManageDeclaration);  //合规经营声明书（后端数据类型是对象）
            }
            if(_data.mechanismInnerNameList && Object.keys(_data.mechanismInnerNameList).length>0){
                new_storeFiles.push(_data.mechanismInnerNameList);  //机构内部名单 （后端数据类型是对象）
            }
            if(_data.otherImages && _data.otherImages.length>0){
                new_storeFiles=new_storeFiles.concat(_data.otherImages);  //其它图片 （后端数据类型是数组）
            }
            if(new_storeFiles&&new_storeFiles.length>0){
                for(let i=0;i<new_storeFiles.length;i++){
                    THfileTypeArray.push(new_storeFiles[i]);
                }
            }

            let aiShangStoreIdentityInfoDTO=_data.aiShangStoreIdentityInfoDTO?_data.aiShangStoreIdentityInfoDTO:{};
            if(aiShangStoreIdentityInfoDTO.contractPhoto){
                THfileTypeArray.push({
                    fileName:'经营场所购房（租赁）合同照片',
                    fileDownloadPath:aiShangStoreIdentityInfoDTO.contractPhoto?aiShangStoreIdentityInfoDTO.contractPhoto:''
                })
            }
            if(aiShangStoreIdentityInfoDTO.identificationCardBackPhoto){
                THfileTypeArray.push({
                    fileName:'法人身份证反面照片',
                    fileDownloadPath:aiShangStoreIdentityInfoDTO.identificationCardBackPhoto?aiShangStoreIdentityInfoDTO.identificationCardBackPhoto:''
                })
            }
            if(aiShangStoreIdentityInfoDTO.identificationCardFrontPhoto){
                THfileTypeArray.push({
                    fileName:'法人身份证正面照片',
                    fileDownloadPath:aiShangStoreIdentityInfoDTO.identificationCardFrontPhoto?aiShangStoreIdentityInfoDTO.identificationCardFrontPhoto:''
                })
            }
            if(aiShangStoreIdentityInfoDTO.lisencePhoto){
                THfileTypeArray.push({
                    fileName:'营业执照照片',
                    fileDownloadPath:aiShangStoreIdentityInfoDTO.lisencePhoto?aiShangStoreIdentityInfoDTO.lisencePhoto:''
                })
            }
            if(aiShangStoreIdentityInfoDTO.medicalLicensePhoto){
                THfileTypeArray.push({
                    fileName:'医疗机构执业许可证照片',
                    fileDownloadPath:aiShangStoreIdentityInfoDTO.medicalLicensePhoto?aiShangStoreIdentityInfoDTO.medicalLicensePhoto:''
                })
            }
            if(aiShangStoreIdentityInfoDTO.medicalStoreInnerPhoto1){
                THfileTypeArray.push({
                    fileName:'医疗门店内部照1',
                    fileDownloadPath:aiShangStoreIdentityInfoDTO.medicalStoreInnerPhoto1?aiShangStoreIdentityInfoDTO.medicalStoreInnerPhoto1:''
                })
            }
            if(aiShangStoreIdentityInfoDTO.medicalStoreInnerPhoto2){
                THfileTypeArray.push({
                    fileName:'医疗门店内部照2',
                    fileDownloadPath:aiShangStoreIdentityInfoDTO.medicalStoreInnerPhoto2?aiShangStoreIdentityInfoDTO.medicalStoreInnerPhoto2:''
                })
            }
            if(aiShangStoreIdentityInfoDTO.medicalStoreInnerPhoto3){
                THfileTypeArray.push({
                    fileName:'医疗门店内部照3',
                    fileDownloadPath:aiShangStoreIdentityInfoDTO.medicalStoreInnerPhoto3?aiShangStoreIdentityInfoDTO.medicalStoreInnerPhoto3:''
                })
            }
            if(aiShangStoreIdentityInfoDTO.storeConfirmation){
                THfileTypeArray.push({
                    fileName:'门店确认函',
                    fileDownloadPath:aiShangStoreIdentityInfoDTO.storeConfirmation?aiShangStoreIdentityInfoDTO.storeConfirmation:''
                })
            }
            if(aiShangStoreIdentityInfoDTO.storeHeadPhoto){
                THfileTypeArray.push({
                    fileName:'门店头照',
                    fileDownloadPath:aiShangStoreIdentityInfoDTO.storeHeadPhoto?aiShangStoreIdentityInfoDTO.storeHeadPhoto:''
                })
            }
            if(aiShangStoreIdentityInfoDTO.storeInnerPhoto){
                THfileTypeArray.push({
                    fileName:'门店内景照',
                    fileDownloadPath:aiShangStoreIdentityInfoDTO.storeInnerPhoto?aiShangStoreIdentityInfoDTO.storeInnerPhoto:''
                })
            }
            if(aiShangStoreIdentityInfoDTO.storeStreetPhoto){
                THfileTypeArray.push({
                    fileName:'门店街景照',
                    fileDownloadPath:aiShangStoreIdentityInfoDTO.storeStreetPhoto?aiShangStoreIdentityInfoDTO.storeStreetPhoto:''
                })
            }
            // 3C1
            if(_data.locateFiles&&_data.locateFiles.length>0){
                THfileTypeArray=THfileTypeArray.concat(_data.locateFiles);
            }
            if(_data.proveFiles&&_data.proveFiles.length>0){
                THfileTypeArray=THfileTypeArray.concat(_data.proveFiles);
            }
            if(_data.contractPhoto&&_data.contractPhoto.length>0){
                THfileTypeArray=THfileTypeArray.concat(_data.contractPhoto);
            }
            if(_data.storeConfirmation&&_data.storeConfirmation.length>0){
                THfileTypeArray=THfileTypeArray.concat(_data.storeConfirmation);
            }

            let indexKey=GetQueryString("key");
            for(var i=0;i<THfileTypeArray.length;i++){
                var THfileTypeArray_i=THfileTypeArray[i];
                if(indexKey==$.md5((THfileTypeArray_i.id).toString())){
                    currentIndexTH=THfileTypeArray.indexOf(THfileTypeArray_i);
                }else if(indexKey==$.md5((THfileTypeArray_i.fileName).toString())){
                    currentIndexTH=THfileTypeArray.indexOf(THfileTypeArray_i);
                }
            }
            showFile(currentIndexTH,THfileTypeArray);
        },
    })
}

//上一张
function prevImg(){
        FprevImg(THfileTypeArray);
}

//下一张
function nextImg(){
        FnextImg(THfileTypeArray);
}

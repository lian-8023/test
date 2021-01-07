$(function(){
    var THpagesize=25;
    var THpageNumber=1;
    var PFpagesize=25;
    var PFpageNumber=1;
    var thirdDataRepaymentResponseDTO=[],platformLoanPlanInfoDTOS=[];
    var loanNo=GetQueryString("loanNo");  
    var orderNo=GetQueryString("orderNo");  
    var cooperationFlag=GetQueryString("cooperationFlag");  
    var fromFlag=GetQueryString("fromFlag");  
    var nationalId=GetQueryString("nationalId");  
    var _url="/node/search/identity/info";
    let type = 'post';
    let data = {
        loanNo:loanNo,
        orderNo:orderNo,
        cooperationFlag:cooperationFlag,
        fromFlag:fromFlag,
        label:'cp-repaymentList'
    }
    if(fromFlag=='TH'||fromFlag == 'SUPPLY'||fromFlag == 'AG'){
        _url="/node/search/payment/info";
    }
    /* else if(fromFlag == 'SUPPLY'){
        _url="node/inner/getBorrowerDetailInfo";
        type = 'get';
        data = {
            orderNo:orderNo,
            idCard:nationalId,
        }
    } */
    $.ajax({
        type:type, 
        url:_url, 
        async:true,
        dataType: "JSON", 
        data:data,
        beforeSend:function(){
            $(".dataTip").text("加载中...");
            let loading_html='<div id="loading">'+
                                    '<div class="tanc_bg"></div>'+
                                    '<div class="ant-spin ant-spin-lg ant-spin-spinning ant-spin-show-text"><span class="ant-spin-dot"><i></i><i></i><i></i><i></i></span><div class="ant-spin-text">Loading...</div></div>'+
                                '</div>';
            $("body").append(loading_html);   
        },
        success:function(res){
            $("#loading").remove();
            var _data=res.data?res.data:{};
            if(!ajaxGetCode(res)){
                thirdDataRepaymentResponseDTO=[];   //还款列表-第三方
                platformLoanPlanInfoDTOS=[];  //还款列表-平台
                if(!_data.thirdDataRepaymentResponseDTO || _data.thirdDataRepaymentResponseDTO.length<=0){
                    $(".THcontent .dataTip").text("暂未查到相关数据...");
                }
                if(!_data.platformLoanPlanInfoDTOS || _data.platformLoanPlanInfoDTOS.length<=0){
                    $(".PFcontent .dataTip").text("暂未查到相关数据...");
                }
                return;
            }
            if(!_data.thirdDataRepaymentResponseDTO || _data.thirdDataRepaymentResponseDTO.length<=0){
                $(".THcontent .dataTip").text("暂未查到相关数据...");
            }
            if(!_data.platformLoanPlanInfoDTOS || _data.platformLoanPlanInfoDTOS.length<=0){
                $(".PFcontent .dataTip").text("暂未查到相关数据...");
            }
            thirdDataRepaymentResponseDTO=_data.thirdDataRepaymentResponseDTO?_data.thirdDataRepaymentResponseDTO.thirdLoanPlanInfos:[];   //还款列表-第三方
            platformLoanPlanInfoDTOS=_data.platformLoanPlanInfoDTOS?_data.platformLoanPlanInfoDTOS:[];  //还款列表-平台

            //=====================第三方 渲染  ===========================
            if(fromFlag=="TH"){
                dealTHdata(thirdDataRepaymentResponseDTO,THpageNumber,THpagesize);
                $(".THcontent .page-ation").whjPaging({
                    //静态数据已知的总页数
                    totalPage: Math.ceil(thirdDataRepaymentResponseDTO.length/THpagesize),
                    //可选，每页显示条数下拉框，默认下拉框5条/页(默认)、10条/页、15条/页、20条/页
                    pageSizeOpt: [
                        {'value': 25, 'text': '25条/页', 'selected': true},
                        {'value': 50, 'text': '50条/页'},
                        {'value': 100, 'text': '100条/页'}
                      ],
                    isShowRefresh: false,
                    callBack: function(currPage, pageSize) {
                        THpagesize=pageSize;
                        dealTHdata(thirdDataRepaymentResponseDTO,currPage,THpagesize);
                    }
                });
            }else if(fromFlag=="PF"){
                dealPFdata(platformLoanPlanInfoDTOS,PFpageNumber,PFpagesize);
                $(".PFcontent .page-ation").whjPaging({
                    //静态数据已知的总页数
                    totalPage: Math.ceil(platformLoanPlanInfoDTOS.length/PFpagesize),
                    //可选，每页显示条数下拉框，默认下拉框5条/页(默认)、10条/页、15条/页、20条/页
                    pageSizeOpt: [
                        {'value': 25, 'text': '25条/页', 'selected': true},
                        {'value': 50, 'text': '50条/页'},
                        {'value': 100, 'text': '100条/页'}
                      ],
                    isShowRefresh: false,
                    callBack: function(currPage, pageSize) {
                        PFpagesize=pageSize;
                        dealPFdata(platformLoanPlanInfoDTOS,currPage,PFpagesize);
                    }
                });
            }
        },
        complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
            $("#loading").remove();
    　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
    　　　　     ajaxTimeOut.abort(); //取消请求
    　　　　　   alert("请求超时");
    　　　　}
    　　},
    })
})
/**
 * 处理第三方数据
 * @param {*} data 总数据
 * @param {*} THpageNumber 页码
 * @param {*} THpagesize 每页显示数目
 */
function dealTHdata(data,THpageNumber,THpagesize){
    $(".THcontent").removeClass("hidden");
    $(".PFcontent").addClass("hidden");
    var dom;
    var createdTime="-";
    $(".THcontent tbody").html("");
    if(data && data.length>0){
        for(var i=0;i<data.length;i++){
            createdTime=is_obj_exist(data[0].updatedAt);
            var repy=data[i];
            if(i>=THpagesize*(THpageNumber-1) && i<=(THpagesize*THpageNumber-1)){
                dom+='<tr>'+
                '    <td title='+is_obj_exist(repy.installmentNumber)+'>'+
                '        '+is_obj_exist(repy.installmentNumber)+'  <!--还款期数  -->'+
                '    </td>'+
                '    <td title='+is_obj_exist(repy.amount)+'>'+
                '        '+is_obj_exist(repy.amount)+'  <!--还款总额  -->'+
                '    </td>'+
                '    <td title='+is_obj_exist(repy.principal)+'>'+
                '        '+is_obj_exist(repy.principal)+'  <!--还款本金  -->'+
                '    </td>'+
                '    <td title='+is_obj_exist(repy.interest)+'>'+
                '        '+is_obj_exist(repy.interest)+'  <!--还款利息  -->'+
                '    </td>'+
                '    <td title='+is_obj_exist(repy.otherAmount)+'>'+
                '        '+is_obj_exist(repy.otherAmount)+'  <!--其它金额  -->'+
                '    </td>'+
                '    <td title='+is_obj_exist(repy.lateFee)+'>'+
                '        '+is_obj_exist(repy.lateFee)+'  <!--滞纳金  -->'+
                '    </td>'+
                '    <td title='+is_obj_exist(repy.servicesCharge)+'>'+
                '        '+is_obj_exist(repy.servicesCharge)+'  <!--服务费  -->'+
                '    </td>'+
                '    <td title='+is_obj_exist(repy.remainingBalance)+'>'+
                '        '+is_obj_exist(repy.remainingBalance)+'  <!--剩余本息  -->'+
                '    </td>'+
                '    <td title='+is_obj_exist(repy.originalDueDate)+'>'+
                '        '+is_obj_exist(repy.originalDueDate)+'  <!--原始还款日  -->'+
                '    </td>'+
                '    <td title='+is_obj_exist(repy.dueDate)+'>'+
                '        '+is_obj_exist(repy.dueDate)+'  <!--实际还款日  -->'+
                '    </td>'+
                '    <td title='+is_obj_exist(repy.installmentInterestStartDate)+'>'+
                '        '+is_obj_exist(repy.installmentInterestStartDate)+'  <!--起息日  -->'+
                '    </td>'+
                '    <td title='+is_obj_exist(repy.overdueFineDay)+'>'+
                '        '+is_obj_exist(repy.overdueFineDay)+'  <!--违约天数  -->'+
                '    </td>'+
                '    <td title='+is_obj_exist(repy.overdueRemitDay)+'>'+
                '        '+is_obj_exist(repy.overdueRemitDay)+'  <!--违约减免天数  -->'+
                '    </td>'+
                '    <td title='+is_obj_exist(repy.status)+'>'+
                '        '+is_obj_exist(repy.status)+'  <!--代扣状态  -->'+
                '    </td>'+
                '    <td title='+is_obj_exist(repy.payTimes)+'>'+
                '        '+is_obj_exist(repy.payTimes)+'  <!--代扣次数  -->'+
                '    </td>'+
                '</tr>';
            }
        }
        $(".THcontent tbody").append(dom);
    }else{
        $(".THcontent tbody").append('<tr><td colSpan="15" className="gray-tip-font">暂未查到相关数据...</td></tr>');
    }
    $(".THcontent .createdTime").text(createdTime);
}
/**
 * 处理平台数据
 * @param {*} data 总数据
 * @param {*} PFpageNumber 页码
 * @param {*} PFpagesize 每页显示数目
 */
function dealPFdata(data,PFpageNumber,PFpagesize){
    $(".PFcontent").removeClass("hidden");
    $(".THcontent").addClass("hidden");
    var dom;
    var createdTime="-";
    $(".PFcontent tbody").html("");
    if(data && data.length>0){
        for(var i=0;i<data.length;i++){
            createdTime=is_obj_exist(data[0].updatedAt);
            var repy=data[i];
            if(i>=PFpagesize*(PFpageNumber-1) && i<=(PFpagesize*PFpageNumber-1)){
                dom+='<tr>'+
                '    <td title='+is_obj_exist(repy.amount)+'>'+
                '        '+is_obj_exist(repy.amount)+'  <!--当期总金额 -->'+
                '    </td>'+
                '    <td title='+is_obj_exist(repy.dueDate)+'>'+
                '        '+is_obj_exist(repy.dueDate)+'  <!--还款日 -->'+
                '    </td>'+
                '    <td title='+is_obj_exist(repy.installmentInterestStartDate)+'>'+
                '        '+is_obj_exist(repy.installmentInterestStartDate)+'  <!--起息日 -->'+
                '    </td>'+
                '    <td title='+is_obj_exist(repy.installmentNumber)+'>'+
                '        '+is_obj_exist(repy.installmentNumber)+'  <!--第几期 -->'+
                '    </td>'+
                '    <td title='+is_obj_exist(repy.interest)+'>'+
                '        '+is_obj_exist(repy.interest)+'  <!--当期利息 -->'+
                '    </td>'+
                '    <td title='+is_obj_exist(repy.leftPrincipal)+'>'+
                '        '+is_obj_exist(repy.leftPrincipal)+'  <!--剩余本金 -->'+
                '    </td>'+
                '    <td title='+is_obj_exist(repy.principal)+'>'+
                '        '+is_obj_exist(repy.principal)+'  <!--当期本金 -->'+
                '    </td>'+
                '    <td title='+is_obj_exist(repy.servicesCharge )+'>'+
                '        '+is_obj_exist(repy.servicesCharge)+'  <!--服务费 -->'+
                '    </td>'+
                '</tr>';
            }
        }
        $(".PFcontent tbody").append(dom);
    }else{
        $(".PFcontent tbody").append('<tr><td colSpan="12" className="gray-tip-font">暂未查到相关数据...</td></tr>');
    }
    $(".PFcontent .createdTime").text(createdTime);
}
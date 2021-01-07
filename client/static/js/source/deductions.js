// 扣款列表&调账历史记录&blind记录--单页面
var accountId=GetQueryString("accountID");  
var loanNumber=GetQueryString("loannumber");
var customerId=GetQueryString("customerId");
var processingStatus=GetQueryString("processingStatus");

if(processingStatus && processingStatus=="APPROVE"){
    $(".lable-t:eq(0)").removeClass("hidden");
}else{
    $(".lable-t:eq(0)").addClass("hidden");
}

var type=GetQueryString("type");  //扣款列表=>0  调账历史记录=>1  blind记录=>2
var deb_pageSize=25;  //扣款列表-每页显示的条数
var Getad_pageSize=25;  //调账历史记录-每页显示条数
var blinds_pageSize=25;  //blind记录-每页显示条数
var debitting_datas;  //扣款列表接口请求的总数组
$(function(){
    deal_dom(type);//初始化页面
    reloadRules();//获取按钮展示权限
    // 扣款列表-点击展开
    $(".debetting-cont").on("click",".list-cont",function () {
        let condition=$(this).next(".toggle-ul");
        if (condition){
            $(this).addClass("pointer");
            if(condition.hasClass("hidden")){
                condition.removeClass("hidden");
            }else {
                condition.addClass("hidden");
            }
        }
    })
    //顶部title切换
    $(".d-head .lable-t").click(function(){
        var n=$(this).index();
        $(".d-head .tit-t").removeClass("on");
        $(".d-head .tit-t").eq(n).addClass("on");
        $(".d-page .d-cont").addClass("hidden");
        $(".d-page .d-cont").eq(n).removeClass("hidden");
        deal_dom(n);
    })
})// jquery end

/**
 * 根据不同按钮显示不同列表
 * @param {*} n 顶部title的序号，从0开始
 */
function deal_dom(n){
    if(n==0){
        var port_data=getRecordList('/node/debittingRcord',0);
        debitting_datas=(port_data&&port_data.debittings)?port_data.debittings:[];
        dealDebitting(debitting_datas,1,deb_pageSize);  //默认加载第一页
        $(".deb-bottom .page-ation").whjPaging({
            //静态数据已知的总页数
            totalPage: Math.ceil(debitting_datas.length/deb_pageSize),
            //可选，每页显示条数下拉框，默认下拉框5条/页(默认)、10条/页、15条/页、20条/页
            pageSizeOpt: [
                {'value': 25, 'text': '25条/页','selected': true},
                {'value': 50, 'text': '50条/页'},
                {'value': 100, 'text': '100条/页'}
              ],
            isShowRefresh: false,
            callBack: function(currPage, pageSize) {
                dealDebitting(debitting_datas,currPage,pageSize);
                deb_pageSize=pageSize
            }
        });
    }else if(n==1){
        var adjustments=getRecordList('/node/getadjustmentRcord',1);
        var adjustments_datas=adjustments?adjustments.adjustments:[];
        dealGetadjustment(adjustments_datas,1,Getad_pageSize);
        $(".Getad-bottom .page-ation").whjPaging({
            //静态数据已知的总页数
            totalPage: Math.ceil(adjustments_datas.length/Getad_pageSize),
            //可选，每页显示条数下拉框，默认下拉框5条/页(默认)、10条/页、15条/页、20条/页
            pageSizeOpt: [
                {'value': 25, 'text': '25条/页', 'selected': true},
                {'value': 50, 'text': '50条/页'},
                {'value': 100, 'text': '100条/页'}
              ],
            isShowRefresh: false,
            callBack: function(currPage, pageSize) {
                dealGetadjustment(adjustments_datas,currPage,pageSize);
                Getad_pageSize=pageSize;
            }
        });
    }else if(n==2){
        var blinds=getRecordList('/node/blindsRcord',2);
        blinds=blinds?blinds:{};
        var blinds_datas=(blinds&&blinds.blinds)?blinds.blinds:[];
        dealBlind(blinds_datas,1,blinds_pageSize);
        $(".blind-bottom .page-ation").whjPaging({
            //静态数据已知的总页数
            totalPage: Math.ceil(blinds.count/blinds_pageSize),
            //可选，每页显示条数下拉框，默认下拉框5条/页(默认)、10条/页、15条/页、20条/页
            pageSizeOpt: [
                {'value': 25, 'text': '25条/页', 'selected': true},
                {'value': 50, 'text': '50条/页'},
                {'value': 100, 'text': '100条/页'}
              ],
            isShowRefresh: false,
            callBack: function(currPage, pageSize) {
                // dealBlind(blinds_datas,currPage,pageSize);
                blinds_pageSize=pageSize;
                var blinds=getRecordList('/node/blindsRcord',2,currPage,pageSize);
                var blinds_datas=blinds.blinds?blinds.blinds:[];
                dealBlind(blinds_datas,currPage,pageSize);
            }
        });
    }else if(n==3){
        var lawsuitData=getRecordList('/node/loan/lawsuitPayment/record',3);
        var records=(lawsuitData&&lawsuitData.records)?lawsuitData.records:[];
        lawsuitPayment(records,'lawsuit');
    }else if(n==4){
        var executeData=getRecordList('/node/loan/lawsuitPayment/record',4);
        var records=(executeData&&executeData.records)?executeData.records:[];
        // $('.execute tbody tr').remove();
        // let records=[{
        //     loanNumber:34234324,
        //     amount:'feafdsafds',
        //     channel:'3efadfas',
        //     createTime:'2089-323-00',
        //     status:'success',
        //     type:'eafdsa',
        //     message:'efwasfdsfadfdsafdsafdsffdsafjdskaljfkldsajfklsadjflkasjfasdkljfklasdjfkladsjfkalds'
        // }]
        lawsuitPayment(records,'execute');
    }
}
function lawsuitPayment(data,parent){
    $('.'+parent+' tbody tr').remove();
    let dom='';
    if(!data||data.length<=0){
        dom='<tr><td colSpan="7" class="gray-tip-font">暂未查到相关数据...</td></tr>';
        $('.'+parent+' tbody').append(dom);
        return;
    }
    for(let i=0;i<data.length;i++){
        let data_i=data[i];
        dom+='<tr>  '+
                    '    <td title='+is_obj_exist(data_i.loanNumber)+'>'+is_obj_exist(data_i.loanNumber)+'</td>'+
                    '    <td title='+is_obj_exist(data_i.amount)+'>'+is_obj_exist(data_i.amount)+'</td>'+
                    '    <td title='+is_obj_exist(data_i.createDate)+'>'+is_obj_exist(data_i.createDate)+'</td>'+
                    '    <td title='+is_obj_exist(data_i.setBy)+'>'+is_obj_exist(data_i.setBy)+'</td>'+
                    '    <td title='+is_obj_exist(data_i.status)+'>'+is_obj_exist(data_i.status)+'</td>'+
                    '</tr>';
        $('.'+parent+' tbody').append(dom);
    }
}
//根据需求展示不同颜色的文字
function getFontColor(ajaxColor) {
    let colorClass="";
    switch (ajaxColor){
        case "RED":
            colorClass="deep-yellow-font";
            break;
        case "GREEN":
            colorClass="green-font";
            break;
        case "YELLOW":
            colorClass="yellow-font";
            break;
        case "BLUE":
            colorClass="blue-font";
            break;
    }
    return colorClass;
}

/**
 * 获取数据公共方法
 * @param {*} customUrls 请求地址
 * @param {*} n tab展示序号，0开始
 * @param {*} blind_currPage blind记录当前页码
 * @param {*} blind_pageSize blind记录当前显示条数
 */
function getRecordList(customUrls,n,blind_currPage,blind_pageSize){
    var listData=[];
    var data={};
    let ajaxType='get';
    let setType='';
    $(".top-tit .tit-t").removeClass("on");
    $(".top-tit .tit-t").eq(n).addClass("on");
    $(".d-page .d-cont").addClass("hidden");
    $(".d-page .d-cont").eq(n).removeClass("hidden");
    if(!accountId){
        return;
    }
    if(!loanNumber){
        return;
    }
    if(n==2){
        data.page=blind_currPage?(blind_currPage-1):0;
        data.size=blind_pageSize?blind_pageSize:25;
    }else if(n==3){
        setType='litigation';
        ajaxType='post';
    }else if(n==4){
        setType='execution';
        ajaxType='post';
    }
    data.accountId=accountId;
    data.loannumber=loanNumber;
    data.loanNumber=loanNumber;  
    data.customerId=customerId;
    setType?(data.setType=setType):'';  //设定的类  litigation (诉讼费) ; execution(执行费)
    $.ajax({
        type:ajaxType,
        url:customUrls,
        async:false,
        dataType: "JSON",
        data:data,
        beforeSend:function(XMLHttpRequest){
            $("body").append(loading_html);
        },
        success:function(res) {
            $("#loading").remove();
            if(!ajaxGetCode(res)){
                listData=[]
                return;
            }
            let _getData = res.data;
            listData=_getData;   //返回接口数据
            //表格的最大高度
            var window_h = document.documentElement.clientHeight;
            var list_h=window_h-34-36-30-36;
            $(".list-content").css("max-height",list_h);
        },
        complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
            $("#loading").remove();
    　　}
    })
    return listData;
}
//扣款列表的取消按钮
function cancelBtn(){
    $.ajax({
        type:"post",
        url:"/node/cancelDebit",
        async:false,
        dataType: "JSON",
        data:{
            accountId:accountId,
            loannumber:loanNumber
        },
        success:function(res) {
            if(!ajaxGetCode(res)){
                return;
            }
            let _getData = res.data;
            alert(_getData.message);
            deal_dom(0);
        }
    })
}
//点击详情
function showDetail_Prop(event){
    $(".all-principal").text("");
    $(".all-interest").text("");
    $(".record-detail .new-tr").addClass("hidden");
    let all_rincipal=0;
    let all_interest=0;
    let get_debittings=debitting_datas; //扣款列表的接口数据
    let breakdowns_id=$(event).closest(".record-div").attr("data-scheduledId");
    $(".detail_pop").removeClass("hidden");
    for(let i=0;i<get_debittings.length;i++){
        if(get_debittings[i].scheduled_id==breakdowns_id){
            var detail_data=get_debittings[i].breakdowns;
            for(let j=0;j<detail_data.length;j++){
                all_rincipal+=detail_data[j].principal;
                all_interest+=detail_data[j].interest;
                var dom='<tr class="new-tr">'+
                        '    <td></td>'+
                        '    <td class="principal">'+detail_data[j].principal+'</td>'+
                        '    <td class="interest">'+detail_data[j].interest+'</td>'+
                        '    <td class="installment_number">'+detail_data[j].installment_number+'</td>'+
                        '    <td class="original_due_date">'+detail_data[j].original_due_date+'</td>'+
                        '    <td></td>'+
                        '</tr>';
                $(".record-detail .start-tr").after(dom)
            }
            $(".all-principal").text(all_rincipal.toFixed(2));
            $(".all-interest").text(all_interest.toFixed(2));
        }
    }
    $(".record-detail .wraper-cash").text("￥"+$(event).closest("ul").find(".chash").text())  
}
//关闭详情
function close_detail(){
    $(".detail_pop").addClass("hidden");
}
/**
 * 解析 扣款列表界面
 * @param {*} data 总的数据
 * @param {*} currPage 当前页码
 * @param {*} pageSize 每页显示条数
 */
function dealDebitting(data,currPage,pageSize){
    $(".debetting-cont").html("");
    if(!data || data.length<=0){
        $(".debetting-cont").html('<ul class="list-cont grayBg"><li class="gray-tip-font" style="width:80%">暂未查到相关数据...</li></ul>');
        return;
    }
    for(var i=0;i<data.length;i++){
        if(i>=pageSize*(currPage-1) && i<=(pageSize*currPage-1)){
            var data_i=data[i];
            var _scheduledPayment_normals=data_i.scheduledPayment_normals?data_i.scheduledPayment_normals:{};
            var _fontColor1=this.getFontColor(data_i.color);
            if(_scheduledPayment_normals){
                var _fontColor2=this.getFontColor(_scheduledPayment_normals.color);
            }
            let isShowCancelBtn="-";
            if(data_i.payment_status){
                if(data_i.payment_status.value=="not_debit"){
                isShowCancelBtn='<a class="blue-font" onClick="cancelBtn()">取消</a>'
            }else if(data_i.payment_status.value=="paid" || data_i.payment_status.value=="offline_paid" || data_i.payment_status.value=="blind" || data_i.payment_status.value=="active_debit"){
                if(data_i.breakdown_type && data_i.breakdown_type!="transferred"){
                    isShowCancelBtn='<a class="blue-font" onClick="showDetail_Prop(this)">详情</a>';
                }
            }
        }
            var dom='<div class="record-div clearfix" data-scheduledId ="'+is_obj_exist(data_i.scheduled_id)+'">'+
            '                        <ul class="'+((data_i.type && data_i.type.value=="installment")?("list-cont "+_fontColor1):("list-cont grayBg "+_fontColor1))+'">'+
            '                            <li class="'+((data_i.type && data_i.type.value=="installment")?"periods":"periods2")+'" title='+((data_i.type && data_i.type.value=="installment")?data_i.installment_number:"breakdowns")+'>'+
                                            ((data_i.type && data_i.type.value=="installment")?data_i.installment_number:"breakdowns")+
            '                            </li>'+
            '                            <li class="setTime" title='+is_obj_exist(data_i.setup_date)+'>'+is_obj_exist(data_i.setup_date)+'</li>'+
            '                            <li class="refundTime" title='+is_obj_exist(data_i.due_date)+'>'+is_obj_exist(data_i.due_date)+'</li>'+
            '                            <li class="chash" title='+(data_i.amount?data_i.amount.toFixed(2):"-")+'>'+(data_i.amount?data_i.amount.toFixed(2):"-")+'</li>'+
            '                            <li class="principal" title='+(is_obj_exist(data_i.principal))+'>'+(is_obj_exist(data_i.principal))+'</li>'+
            '                            <li class="interest" title='+is_obj_exist(data_i.interest)+'>'+is_obj_exist(data_i.interest)+'</li>'+
            '                            <li class="extension" title='+((data_i.extension && data_i.extension==1) ? is_obj_exist(data_i.extension_fee):"-")+'>'+
                                            ((data_i.extension && data_i.extension==1) ? is_obj_exist(data_i.extension_fee):"-")+
            '                            </li>'+
            '                            <li class="overdue" title='+is_obj_exist(data_i.days_in_default)+'>'+is_obj_exist(data_i.days_in_default)+'</li>'+
            '                            <li class="overdue" title='+is_obj_exist(data_i.pay_method_type)+'>'+is_obj_exist(data_i.pay_method_type)+'</li>'+
            '                            <li class="overdue" title='+is_obj_exist(_scheduledPayment_normals.error_message)+'>'+is_obj_exist(_scheduledPayment_normals.error_message)+'</li>'+
            '                            <li class="operator" title='+(is_obj_exist(data_i.set_by)+((data_i.payment_status||data_i.breakdown_type_special)?"("+(data_i.payment_status?data_i.payment_status.displayName:"")+","+(data_i.breakdown_type_special?data_i.breakdown_type_special:"")+")":""))+'>'+
                                                (is_obj_exist(data_i.set_by)+((data_i.payment_status||data_i.breakdown_type_special)?"("+(data_i.payment_status?data_i.payment_status.displayName:"")+","+(data_i.breakdown_type_special?data_i.breakdown_type_special:"")+")":""))+
            '                            </li>'+
            '                            <li class="'+((data_i.type&&data_i.type.value=="breakdown")?"operate detail-link blue-font":"operate")+'">'+isShowCancelBtn+'</li>'+
            '                        </ul>';
            if(_scheduledPayment_normals){
                dom+='<ul class="toggle-ul grayBg gray-font hidden"'+_fontColor2+'>'+
                '                                <li class="periods2" title='+is_obj_exist(data_i.installment_number)+'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+
                                                    is_obj_exist(data_i.installment_number)+''+
                '                                </li>'+
                '                                <li class="setTime" title='+is_obj_exist(_scheduledPayment_normals.setup_date)+'>'+is_obj_exist(_scheduledPayment_normals.setup_date)+'</li>'+
                '                                <li class="refundTime" title='+is_obj_exist(_scheduledPayment_normals.due_date)+'>'+is_obj_exist(_scheduledPayment_normals.due_date)+'</li>'+
                '                                <li class="chash" title='+is_obj_exist(_scheduledPayment_normals.amount)+'>'+is_obj_exist(_scheduledPayment_normals.amount)+'</li>'+
                '                                <li class="principal" title='+is_obj_exist(_scheduledPayment_normals.principal)+'>'+is_obj_exist(_scheduledPayment_normals.principal)+'</li>'+
                '                                <li class="interest" title='+is_obj_exist(_scheduledPayment_normals.interest)+'>'+is_obj_exist(_scheduledPayment_normals.interest)+'</li>'+
                '                                <li class="extension" title='+is_obj_exist(_scheduledPayment_normals.extension_fee)+'>'+is_obj_exist(_scheduledPayment_normals.extension_fee)+'</li>'+
                '                                <li class="overdue">-</li>'+
                '                                <li class="operator" title='+(is_obj_exist(_scheduledPayment_normals.set_by)+"("+(_scheduledPayment_normals.payment_status?_scheduledPayment_normals.payment_status.displayName:"")+")")+'>'+
                                                    (is_obj_exist(_scheduledPayment_normals.set_by)+"("+(_scheduledPayment_normals.payment_status?_scheduledPayment_normals.payment_status.displayName:"")+")")+
                '                                </li>'+
                '                                <li class="operate pointer pr10">-</li>'+
                '                            </ul>';
            }
            dom+='</div>';
            $(".debetting-cont").append(dom);
        }
    }
}
/**
 * 解析 调账历史记录界面
 * @param {*} data 总的数据
 * @param {*} currPage 当前页码
 * @param {*} pageSize 每页显示条数
 */
function dealGetadjustment(data,currPage,pageSize){
    $(".getadjustment-list-content").html('');
    if(!data || data.length<=0){
        $(".getadjustment-list-content").html('<ul class="list-cont dealGetad"><li class="gray-tip-font" style="width:80%">暂未查到相关数据...</li></ul>');
        return;
    } 
    for(var i=0;i<data.length;i++){
        var data_i=data[i];
        var dom='<ul class="list-cont dealGetad">'+
                '    <li title='+is_obj_exist(data_i.loanNumber)+'>'+is_obj_exist(data_i.loanNumber)+'</li>'+
                '    <li title='+is_obj_exist(data_i.amount)+'>'+is_obj_exist(data_i.amount)+'</li>'+
                '    <li title='+is_obj_exist(data_i.adjustmentTypeId?data_i.adjustmentTypeId.displayName:"")+'>'+is_obj_exist(data_i.adjustmentTypeId?data_i.adjustmentTypeId.displayName:"")+'</li>'+
                '    <li title='+is_obj_exist(data_i.setBy)+'>'+is_obj_exist(data_i.setBy)+'</li>'+
                '    <li title='+is_obj_exist(data_i.completeTime)+'>'+is_obj_exist(data_i.completeTime)+'</li>'+
                '    <li title='+is_obj_exist(data_i.createdAt)+'>'+is_obj_exist(data_i.createdAt)+'</li>'+
                '</ul>';
        $(".getadjustment-list-content").append(dom);
    }
}
/**
 * 解析 blind记录界面
 * @param {*} data 总的数据
 * @param {*} currPage 当前页码
 * @param {*} pageSize 每页显示条数
 */
function dealBlind(data,currPage,pageSize){
    $(".blind-list-content").html('');
    if(!data || data.length<=0){
        $(".blind-list-content").html('<ul class="list-cont"><li class="gray-tip-font" style="width:80%">暂未查到相关数据...</li></ul>');
        return;
    }
    for(var i=0;i<data.length;i++){
        var data_i=data[i];
        var dom='<ul key={index} className="list-cont">'+
                '    <li title='+is_obj_exist(data_i.loanNumber)+'>'+is_obj_exist(data_i.loanNumber)+'</li>'+
                '    <li title='+is_obj_exist(data_i.paymentMethodName)+'>'+is_obj_exist(data_i.paymentMethodName)+'</li>'+
                '    <li title='+((data_i&&data_i.blindTypeId)?is_obj_exist(data_i.blindTypeId.displayName):"-")+'>'+
                        ((data_i&&data_i.blindTypeId)?is_obj_exist(data_i.blindTypeId.displayName):"-")+
                '</li>'+
                '    <li title='+is_obj_exist(data_i.updatedAt)+'>'+is_obj_exist(data_i.updatedAt)+'</li>'+
                '    <li title='+is_obj_exist(data_i.amount)+'>'+is_obj_exist(data_i.amount)+'</li>'+
                '    <li title='+((data_i&&data_i.paymentStatusId)?is_obj_exist(data_i.paymentStatusId.displayName):"-")+'>'+((data_i&&data_i.paymentStatusId)?is_obj_exist(data_i.paymentStatusId.displayName):"-")+'</li>'+
                '    <li title='+is_obj_exist(data_i.msg)+'>'+is_obj_exist(data_i.msg)+'</li>'+
                '</ul>';
        $(".blind-list-content").append(dom);
    }
}
//展期费查询
function extCheck(){
    $(".extension-pop .add-td:eq(0)").nextAll().html("");
    $.ajax({
        type:"post",
        url:"/node/isQualification",
        async:false,
        dataType: "JSON",
        data:{
            accountId:accountId,
            loannumber:loanNumber,
            customerId:customerId
        },
        success:function(res) {
            let _getData = res.data?res.data:{};
            if(!ajaxGetCode(res)){
                return;
            }
            $(".extension-pop").removeClass("hidden");
            var extensionPayPlanInfoDTO=_getData.extensionPayPlanInfoDTO?_getData.extensionPayPlanInfoDTO:{};
            $(".extension-pop .extensionFee_val").text(is_obj_exist(extensionPayPlanInfoDTO.extensionFee));
            var extensionPayInstallmentsInfoDTOS=_getData.extensionPayInstallmentsInfoDTOS;
            if(!extensionPayInstallmentsInfoDTOS || extensionPayInstallmentsInfoDTOS.length<=0){
                $(".extension-pop .add-td:eq(0)").nextAll().html('<tr><td colSpan="7" className="gray-tip-font">暂未查到相关数据...</td></tr>');
                return;
            }
            for(var i=0;i<extensionPayInstallmentsInfoDTOS.length;i++){
                var eldtos=extensionPayInstallmentsInfoDTOS[i];
                let paidOffText;
                if(eldtos.paidOff && eldtos.paidOff==1){
                    if(eldtos.extension && eldtos.extension==1){
                        paidOffText="延期还款"
                    }else{
                        paidOffText="已还款"
                    }
                }else{
                    paidOffText="待还款"
                }
                var dom='<tr key={i}>  '+
                        '    <td>'+paidOffText+'</td>'+
                        '    <td>'+is_obj_exist(eldtos.installmentNumber)+'</td>'+
                        '    <td>'+is_obj_exist(eldtos.amount)+'</td>'+
                        '    <td>'+is_obj_exist(eldtos.installmentNotPaid)+'</td>'+
                        '    <td>'+is_obj_exist(eldtos.originalDueDate)+'</td>'+
                        '    <td>'+((eldtos.extension && eldtos.extension=="1")?"是":"否")+'</td>'+
                        '    <td>'+is_obj_exist(eldtos.installmentInterestStartDate)+'</td>'+
                        '</tr>';
                $(".extension-pop .add-td").after(dom);
            }
        }
    })
}
//关闭展期费查询弹窗
function closeEtnPop(){
    $(".extension-pop").addClass("hidden");
}
// 筛选
function sortList(_this){
    var _selected_value=$(_this).find("option:selected").val();
    debitting_datas=sortLoop(_selected_value);
    dealDebitting(debitting_datas,1,deb_pageSize);
    $(".deb-bottom .page-ation").whjPaging("setPage", 1, Math.ceil(debitting_datas.length/deb_pageSize));
}
/**
 * 筛选功能需要的数据循环公共方法
 * sortType 筛选类型：normal=默认；succeed=成功；defeated=失败；handle=处理中
 */
function sortLoop(sortType){
    var new_deb_data_array=[];
    var port_data=getRecordList('/node/debittingRcord',0);
    debitting_datas=(port_data&&port_data.debittings)?port_data.debittings:[];
    dealDebitting(debitting_datas,1,deb_pageSize);  //默认加载第一页
    if(sortType=="normal"){
        new_deb_data_array=debitting_datas;
    }else if(sortType=="succeed"){
        for(var i=0;i<debitting_datas.length;i++){
            var data_i=debitting_datas[i];
            var sortStatesId=data_i.payment_status_id;
            if(sortStatesId && (sortStatesId==3 || sortStatesId==10 || sortStatesId==11 || sortStatesId==13)){
                new_deb_data_array.push(debitting_datas[i]);
            }
            if(!sortStatesId){
                if(!data_i.scheduledPayment_normals)return;
                var hasBreakDowns_sortStatesId=data_i.scheduledPayment_normals.payment_status_id;
                if(hasBreakDowns_sortStatesId && (hasBreakDowns_sortStatesId==3 || hasBreakDowns_sortStatesId==10 || hasBreakDowns_sortStatesId==11 || hasBreakDowns_sortStatesId==13)){
                    new_deb_data_array.push(debitting_datas[i]);
                }
            }
        }
    }else if(sortType=="defeated"){
        for(var j=0;j<debitting_datas.length;j++){
            var data_j=debitting_datas[j];
            var sortStatesId2=data_j.payment_status_id;
            if(sortStatesId2 && (sortStatesId2==4 || sortStatesId2==5 || sortStatesId2==7 || sortStatesId2==-2)){
                new_deb_data_array.push(debitting_datas[j]);
            }
            if(!sortStatesId2){
                if(!data_j.scheduledPayment_normals)return;
                var hasBreakDowns_sortStatesId2=data_j.scheduledPayment_normals.payment_status_id;
                if(hasBreakDowns_sortStatesId2 && (hasBreakDowns_sortStatesId2==4 || hasBreakDowns_sortStatesId2==5 || hasBreakDowns_sortStatesId2==7 || hasBreakDowns_sortStatesId2==-2)){
                    new_deb_data_array.push(debitting_datas[j]);
                }
            }
        }
    }else if(sortType=="handle"){
        for(var k=0;k<debitting_datas.length;k++){
            var data_k=debitting_datas[k];
            var sortStatesId3=data_k.payment_status_id;
            if(sortStatesId3 && (sortStatesId3!=4 && sortStatesId3!=5 && sortStatesId3!=7 && sortStatesId3!=3 && sortStatesId3!=11 && sortStatesId3!=13 && sortStatesId3!=-2 && sortStatesId3!=10)){
                new_deb_data_array.push(debitting_datas[k]);
            }
            if(!sortStatesId3){
                if(!data_k.scheduledPayment_normals)return;
                var hasBreakDowns_sortStatesId3=data_k.scheduledPayment_normals.payment_status_id;
                if(hasBreakDowns_sortStatesId3 && (hasBreakDowns_sortStatesId3!=4 && hasBreakDowns_sortStatesId3!=5 && hasBreakDowns_sortStatesId3!=7 && hasBreakDowns_sortStatesId3!=3 && hasBreakDowns_sortStatesId3!=11 && hasBreakDowns_sortStatesId3!=13 && hasBreakDowns_sortStatesId3!=-2 && hasBreakDowns_sortStatesId3!=10)){
                    new_deb_data_array.push(debitting_datas[k]);
                }
            }
        }
    }
    return new_deb_data_array; //筛选后的扣款列表数组
}

var loanNo=GetQueryString("loanNo");  
var orderNo=GetQueryString("orderNo");  
var cooperationFlag=GetQueryString("cooperationFlag");  
var fromFlag=GetQueryString("fromFlag");  
var THpagesize=25;
var THpageNumber=1;
var thirdDataRepaymentResponseDTO=[];
//
$(function(){
    THGetData();
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
})
/**
 * 处理第三方数据
 * @param {*} data 总数据
 * @param {*} THpageNumber 页码
 * @param {*} THpagesize 每页显示数目
 */

/**
 * 获取第三方扣款列表数据
 */
function THGetData(){
    thirdDataRepaymentResponseDTO=getRecordList('/node/identity/getDebitingInfo');
    dealDebitting(thirdDataRepaymentResponseDTO,1,THpagesize);  //默认加载第一页
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
            dealDebitting(thirdDataRepaymentResponseDTO,currPage,THpagesize);
        }
    });
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
 * 第三方还款列表获取数据请求方法
 * @param {*} customUrls 请求地址
 */
function getRecordList(customUrls){
    var listData=[];
    var data={};
    if(!loanNo){
        return;
    }
    data.loanNumber=loanNo;
    $.ajax({
        type:"post",
        url:customUrls,
        async:false,
        dataType: "JSON",
        data:data,
        beforeSend:function(XMLHttpRequest){
           let loading_html='<div id="loading">'+
                                   '<div class="tanc_bg"></div>'+
                                   '<div class="ant-spin ant-spin-lg ant-spin-spinning ant-spin-show-text"><span class="ant-spin-dot"><i></i><i></i><i></i><i></i></span><div class="ant-spin-text">Loading...</div></div>'+
                               '</div>';
           $("body").append(loading_html);       
        },
        success:function(res) {
            $("#loading").remove();
            if(!ajaxGetCode(res)){
                $(".THcontent .dataTip").text("暂未查到相关数据...");
                listData=[]
                return;
            }
            let _getData = res.data;
            listData=_getData.installments?_getData.installments:[];   //返回接口数据
            if(!listData || listData.length<=0){
                $(".THcontent .dataTip").text("暂未查到相关数据...");
            }
            //表格的最大高度
            var window_h = document.documentElement.clientHeight;
            var list_h=window_h-80;
            $(".list-content").css("max-height",list_h);
        },
        complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
            $("#loading").remove();
    　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
    　　　　     ajaxTimeOut.abort(); //取消请求
    　　　　　   alert("请求超时");
    　　　　}
    　　},
    })
    return listData;
}
//点击详情
function showDetail_Prop(event){
    $(".all-principal").text("");
    $(".all-interest").text("");
    $(".record-detail .new-tr").addClass("hidden");
    let all_rincipal=0;  //总本金
    let all_interest=0;  //总利息
    let all_serverce=0;  //总服务费
    let all_latefee=0;  //总逾期费
    let all_default_interest=0;  //总罚息
    let all_penalty=0;  //总违约金
    // let get_debittings=thirdDataRepaymentResponseDTO; //扣款列表的接口数据
    let get_debittings=sortNumber(thirdDataRepaymentResponseDTO,"installment_number"); //扣款列表的接口数据-顺序，从小到大排序
    let breakdowns_id=$(event).closest(".record-div").attr("data-scheduledId");
    $(".detail_pop").removeClass("hidden");
    for(let i=0;i<get_debittings.length;i++){
        if(get_debittings[i].scheduled_id==breakdowns_id){
            var detail_data=get_debittings[i].breakdowns;
            for(let j=0;j<detail_data.length;j++){
                all_rincipal+=detail_data[j].principal;
                all_interest+=detail_data[j].interest;
                all_serverce+=detail_data[j].service_charge;
                all_latefee+=detail_data[j].late_fee;
                all_default_interest+=detail_data[j].default_interest;
                all_penalty+=detail_data[j].penalty;
                var dom='<tr class="new-tr">'+
                        '    <td></td>'+
                        '    <td class="principal" title=￥'+is_obj_exist(detail_data[j].principal)+'>￥'+is_obj_exist(detail_data[j].principal)+'</td>'+
                        '    <td class="interest" title=￥'+is_obj_exist(detail_data[j].interest)+'>￥'+is_obj_exist(detail_data[j].interest)+'</td>'+
                        '    <td class="installment_number" title='+is_obj_exist(detail_data[j].installment_number)+'>'+is_obj_exist(detail_data[j].installment_number)+'</td>'+
                        '    <td class="original_due_date" title='+is_obj_exist(detail_data[j].original_due_date)+'>'+is_obj_exist(detail_data[j].original_due_date)+'</td>'+
                        '    <td class="original_due_date" title=￥'+is_obj_exist(detail_data[j].service_charge)+'>￥'+is_obj_exist(detail_data[j].service_charge)+'</td>'+
                        '    <td class="original_due_date" title=￥'+is_obj_exist(detail_data[j].late_fee)+'>￥'+is_obj_exist(detail_data[j].late_fee)+'</td>'+
                        '    <td class="original_due_date" title=￥'+is_obj_exist(detail_data[j].default_interest)+'>￥'+is_obj_exist(detail_data[j].default_interest)+'</td>'+
                        '    <td class="original_due_date" title=￥'+is_obj_exist(detail_data[j].penalty)+'>￥'+is_obj_exist(detail_data[j].penalty)+'</td>'+
                        '    <td></td>'+
                        '</tr>';
                $(".record-detail tr:last").before(dom);
            }
            $(".all-principal").text(all_rincipal?("￥"+all_rincipal.toFixed(2)):"￥0").attr("title",all_rincipal?("￥"+all_rincipal.toFixed(2)):"￥0");
            $(".all-interest").text(all_interest?("￥"+all_interest.toFixed(2)):"￥0").attr("title",all_interest?("￥"+all_interest.toFixed(2)):"￥0");
            $(".all-serverce").text(all_serverce?("￥"+all_serverce.toFixed(2)):"￥0").attr("title",all_serverce?all_serverce.toFixed(2):"￥0");
            $(".all-latefee").text(all_latefee?("￥"+all_latefee.toFixed(2)):"￥0").attr("title",all_latefee?all_latefee.toFixed(2):"￥0");
            $(".all-default-interest").text(all_default_interest?("￥"+all_default_interest.toFixed(2)):"￥0").attr("title",all_default_interest?all_default_interest.toFixed(2):"￥0");
            $(".all-penalty").text(all_penalty?("￥"+all_penalty.toFixed(2)):"￥0").attr("title",all_penalty?all_penalty.toFixed(2):"￥0");
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
                let paymentStatus_s=data_i.payment_status.value;
                if(
                    data_i.type&&data_i.type.value == 'breakdown'&&
                    (paymentStatus_s == 'paid' || 
                    paymentStatus_s == 'blind' ||
                    paymentStatus_s == 'offline_paid' ||
                    paymentStatus_s == 'payment_transfer' ||
                    paymentStatus_s == 'prepayment' ||
                    paymentStatus_s == 'debt_transfer'||
                    paymentStatus_s == 'deposits' ||
                    paymentStatus_s == 'drop_class' ||
                    paymentStatus_s == 'return_goods' ||
                    paymentStatus_s == 'cash_deposit'||
                    paymentStatus_s == 'active_debit')
                ){
                    if(data_i.breakdown_type && data_i.breakdown_type!="transferred" && data_i.breakdown_type!="deposits"){
                        isShowCancelBtn='<a class="blue-font" onClick="showDetail_Prop(this)">详情</a>';
                    }
                }else if(
                    data_i.type&&data_i.type.value == 'installment'&&
                    (data_i.payment_status.value=="transferred"||
                    data_i.payment_status.value=="deposits")
                ){
                    isShowCancelBtn='<a class="blue-font" onClick="showDetail_Prop(this)">详情</a>';
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
            '                            <li class="overdue" title='+is_obj_exist(data_i.service_charge)+'>'+is_obj_exist(data_i.service_charge)+'</li>'+
            '                            <li class="overdue" title='+is_obj_exist(data_i.late_fee)+'>'+is_obj_exist(data_i.late_fee)+'</li>'+
            '                            <li class="overdue" title='+is_obj_exist(data_i.default_interest)+'>'+is_obj_exist(data_i.default_interest)+'</li>'+
            '                            <li class="overdue" title='+is_obj_exist(data_i.paid_off_message)+'>'+is_obj_exist(data_i.paid_off_message)+'</li>'+
            '                            <li class="'+((data_i.type&&data_i.type.value=="breakdown")?"operate detail-link blue-font":"operate")+'">'+isShowCancelBtn+'</li>'+
            '                        </ul>';
            if(_scheduledPayment_normals && data_i.type && data_i.type.value=="installment"){
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
                '                                <li class="interest" title='+is_obj_exist(data_i.pay_method_type)+'>'+is_obj_exist(data_i.pay_method_type)+'</li>'+
                '                                <li class="interest" title="">-</li>'+ 
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
 * 筛选功能需要的数据循环公共方法
 * sortType 筛选类型：normal=默认；succeed=成功；defeated=失败；handle=处理中
 */
function sortLoop(sortType){
    var new_deb_data_array=[];
    var debitting_datas=getRecordList('/node/identity/getDebitingInfo');
    dealDebitting(debitting_datas,1,THpagesize);  //默认加载第一页
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

/**
 * 根据数字排序数组
 * @param {*} data  需要排序的数组
 * @param {*} _nmuber  需要排序的数字字段
 */
function sortNumber(data,_nmuber){
    if(!data||data.length<=0){
        return;
    }
    let new_resultList=data.sort(function(a,b){
        if(a[_nmuber]==""||a[_nmuber]==null){
            a[_nmuber]=0
        }
        if(b[_nmuber]==""||b[_nmuber]==null){
            b[_nmuber]=0
        }
        return (a[_nmuber]-b[_nmuber]);
    })
    return new_resultList;
}
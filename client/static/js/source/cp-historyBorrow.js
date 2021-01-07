
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
})
/**
 * 处理第三方数据
 * @param {*} data 总数据
 * @param {*} THpageNumber 页码
 * @param {*} THpagesize 每页显示数目
 */

/**
 * 获取第三方还款列表数据
 */
function THGetData(){
    thirdDataRepaymentResponseDTO=getRecordList('/node/search/identity/info');
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
// 处理数据
function dealDebitting(data,currPage,pageSize){
    $(".hostoryBorrowTab tbody").html("");
    if(!data || data.length<=0){
        $(".hostoryBorrowTab tbody").html('<tr><th colspan="3">暂未查到相关数据...</th></tr>');
        return;
    }
    let dom="";
    for(var i=0;i<data.length;i++){
        if(i>=pageSize*(currPage-1) && i<=(pageSize*currPage-1)){
            var data_i=data[i];
            dom+='<tr>'+
                    '    <td>'+is_obj_exist(data_i.loanDays)+'</td>'+
                    '    <td>'+is_obj_exist(data_i.overdueDays)+'</td>'+
                    '    <td>'+is_obj_exist(data_i.amount)+'</td>'+
                    '</tr>';
            $(".hostoryBorrowTab tbody").html(dom);
        }
    }
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
    data.loanNo=loanNo;
    data.orderNo=orderNo;
    data.cooperationFlag=cooperationFlag;
    data.fromFlag=fromFlag;
    data.label='cp-historyBorrow';
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
                $(".hostoryBorrowTab tbody").html('<tr><th colspan="3">暂未查到相关数据...</th></tr>');
                listData=[]
                return;
            }
            let _getData = res.data;
            listData=_getData.historyInfoDTOS?_getData.historyInfoDTOS:[];   //返回接口数据
            if(!listData || listData.length<=0){
                $(".hostoryBorrowTab tbody").html('<tr><th colspan="3">暂未查到相关数据...</th></tr>');
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

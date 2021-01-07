
var loanNo=GetQueryString("loanNo"); 
$(".loanNo").html(loanNo);
var orderNo=GetQueryString("orderNo");  
var cooperationFlag=GetQueryString("cooperationFlag");  
var fromFlag=GetQueryString("fromFlag");  
var THpagesize=25;
var THpageNumber=1;
var thirdDataRepaymentResponseDTO=[];

console.log(loanNo);
console.log(cooperationFlag);
console.log(fromFlag);

$(function(){
    function getChildTable(index,installmentNumber){
        let josnParam = {
            loanNumber:loanNo,
            installment:installmentNumber
        }
        $.ajax({
            type:"get",
            url:'/node/loan/merge/payment',
            async:false,
            dataType: "JSON",
            data:josnParam,
            beforeSend:function(XMLHttpRequest){
               let loading_html='<div id="loading">'+
                                       '<div class="tanc_bg"></div>'+
                                       '<div class="ant-spin ant-spin-lg ant-spin-spinning ant-spin-show-text"><span class="ant-spin-dot"><i></i><i></i><i></i><i></i></span><div class="ant-spin-text">Loading...</div></div>'+
                                   '</div>';
               $("body").append(loading_html);       
            },
            success:function(res) {
                let response=res.data;  //from node response
                let data=response.data;  //from java response
                if (response.success&&response.executed == false) {
                    alert(response.message)
                    return;
                }
                $("#loading").remove();
                var childTableList = '<tr>'+
                                        '<th style="width: 4%;"  ></th>'+
                                        '<th>扣款金额</th>'+
                                        '<th>本金/利息/罚息</th>'+
                                        '<th>扣款时间</th>'+
                                        '<th>还款方式</th>'+
                                        '<th>支付渠道</th>'+
                                        '<th>扣款现状</th>'+
                                        '<th>失败原因</th>'+
                                    '</tr>';
                var mergePaymentList = res.data.mergePaymentList;
                mergePaymentList.forEach((v,i)=>{
                    childTableList+='<tr>'+
                                        '<td></td>'+
                                        '<td>'+str(v.withholdAmount)+'</td>'+
                                        '<td>'+str(v.withholdPrincipe)+'/'+str(v.withholdInterest)+'/'+str(v.withholdLateFee)+'</td>'+
                                        '<td>'+(v.withholdDate)+'</td>'+
                                        '<td>'+str(v.refundMethod)+'</td>'+
                                        '<td>'+str(v.payChannel)+'</td>'+
                                        '<td>'+str(v.withholdStatus)+'</td>'+
                                        '<td>'+str(v.reason)+'</td>'+
                                    '</tr>'
                })
                $($('.childTbale')[index]).html(childTableList);
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
        　　　　     ajaxTimeOut.abort(); //取消请求
        　　　　　   alert("请求超时");
        　　　　}
        　　},
        })
    }
    getTableData =()=>{
        let josnParam = {
            loanNumber:loanNo
        }
        $.ajax({
            type:"get",
            url:'/node/loan/merge/installment',
            async:false,
            dataType: "JSON",
            data:josnParam,
            beforeSend:function(XMLHttpRequest){
               let loading_html='<div id="loading">'+
                                       '<div class="tanc_bg"></div>'+
                                       '<div class="ant-spin ant-spin-lg ant-spin-spinning ant-spin-show-text"><span class="ant-spin-dot"><i></i><i></i><i></i><i></i></span><div class="ant-spin-text">Loading...</div></div>'+
                                   '</div>';
               $("body").append(loading_html);       
            },
            success:function(res) {
                $("#loading").remove();
                let response=res.data;  //from node response
                let data=response.data;  //from java response
                if (response.success&&response.executed == false) {
                    alert(response.message)
                    return;
                }
                const mergeInstallmentList = res.data.mergeInstallmentList;
                let outTableHtml = '';
                mergeInstallmentList.forEach((e,i) => {
                    let paidOff = e.paidOff=='0'?'未结清':'结清';
                    outTableHtml+= '<tr>'+
                                        '<td style="cursor: pointer;" index='+i+' class="btn" unfold="false" installmentNumber='+e.installmentNumber+' >+</td>'+
                                        '<td>'+str(e.installmentNumber)+'</td>'+
                                        '<td>'+str(e.principalNotPaid)+'/'+str(e.interestNotPaid)+'/'+str(e.lateFeeNotPaid)+'</td>'+
                                        '<td>'+str(e.amountNotPaid)+'</td>'+
                                        '<td>'+(e.interestStartDate)+'</td>'+
                                        '<td>'+(e.originalDueDate)+'</td>'+
                                        '<td>'+'逾期'+str(e.overDays)+'天'+'</td>'+
                                        '<td>'+paidOff+'</td>'+
                                        '<tr>'+
                                            '<td colspan="8" class="ChildTbaleBox hide" >'+
                                                '<table border="1" class="childTbale" >'+
                                                '</table>'+
                                            '</td>'+
                                        '</tr>'+
                                    '</tr>'
                });
                $('.outTable').append(outTableHtml);
                $('.btn').click((e)=>{
                    var index = $(e.currentTarget).attr('index');
                    var installmentNumber = $(e.currentTarget).attr('installmentNumber');
                    var unfold = $(e.currentTarget).attr('unfold');
                    if(unfold == 'false'){
                        getChildTable(index,installmentNumber);
                        $($('.ChildTbaleBox')[index]).removeClass('hide');
                        $(e.currentTarget).attr('unfold','true');
                    }else{
                        $($('.ChildTbaleBox')[index]).addClass('hide');
                        $(e.currentTarget).attr('unfold','false');

                    }
                })
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
        　　　　     ajaxTimeOut.abort(); //取消请求
        　　　　　   alert("请求超时");
        　　　　}
        　　},
        })
    }

    getTableData();

    function myTime(date){
             var arr=date.split("T");
             var d=arr[0];
           var darr = d.split('-');
        
           var t=arr[1];
           var tarr = t.split('.000');
           var marr = tarr[0].split(':');
        
           var dd = parseInt(darr[0])+"/"+parseInt(darr[1])+"/"+parseInt(darr[2])+" "+parseInt(marr[0])+":"+parseInt(marr[1])+":"+parseInt(marr[2]);
         return dd;
        }
        
     // 数字补0操作
    function  addZero(num) {
        return num < 10 ? '0' + num : num;
    }    
     function formatDateTime (date) {
        var time = new Date(Date.parse(date));
        time.setTime(time.setHours(time.getHours() + 8));
        var Y = time.getFullYear() + '-';
        var  M = this.addZero(time.getMonth() + 1) + '-';
        var D = this.addZero(time.getDate()) + ' ';
        var h = this.addZero(time.getHours()) + ':';
        var m = this.addZero(time.getMinutes()) + ':';
        var  s = this.addZero(time.getSeconds());
        return Y + M + D;
        // }
     }

    function str(str){
        var r = "";
        if(str||str == 0){
            r = str;
        }
        return r;
    }
})
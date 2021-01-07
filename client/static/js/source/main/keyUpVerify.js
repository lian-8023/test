// userMsg 电话号码验证(包含手机号码和座机号码)
function myaer(dom){
    var _val=dom.value;
    var phoneVeri=!(/^1\d{10}$/.test(_val));
    if(_val.length>0 && (isNaN(_val) || _val.length>12 || phoneVeri) && _val.indexOf("0")!=0){
        $(dom).addClass("warnBg");
    }else{
        $(dom).removeClass("warnBg");
    }
}
// userMsg 电话号码验证（仅验证手机号码）
function onlyMobile(dom){
    var _val=dom.value;
    var phoneVeri=!(/^1\d{10}$/.test(_val));
    if(phoneVeri){
        $(dom).addClass("warnBg");
    }else{
        $(dom).removeClass("warnBg");
    }
}
// //只能输入数字
// function onlyNumber(dom){
//     var _val=dom.value;
//     var inputVeri=!(/^[0-9]$/.test(_val));
//     if(inputVeri){
//         $(dom).addClass("warnBg");
//     }else{
//         $(dom).removeClass("warnBg");
//     }
// }
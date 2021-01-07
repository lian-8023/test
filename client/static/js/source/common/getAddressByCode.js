import $ from 'jquery';
 //根据编码获取地址
class GetAddressByCode{
    getAddressByCode(prems){
        if(!prems||prems==""||prems=="-"){
            return "";
        }
        var _get_name="";
       // return "skdhfk"+prems;
        $.ajax({
            type:"get",
            url:"/common/getByCode",
            async:false,
            dataType: "JSON",
            data:{code:prems},
            success:function(res) {
                if (res.code != 1) {
                    alert(res.msg);
                    return;
                }
                if (res.code && res.code == -2) {
                    alert("无法连接服务器");
                    return;
                }
                var _getData = res.data;
                if(_getData.code==0 && _getData.data){ //成功
                    _get_name=_getData.data.name;
                }
            }
        })
        return _get_name;
    }
}

export default GetAddressByCode;

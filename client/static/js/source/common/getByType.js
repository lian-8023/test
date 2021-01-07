/**
 * 根据文件类型获取文件
 */
import $ from 'jquery';

class GetByType{
    getByType(_registrationId,_fileType){
        var _result={};
        $.ajax({
            type:"get",
            url:"/common/byType",
            async:false,
            dataType: "JSON",
            data:{
                registrationId:_registrationId,
                fileType:_fileType
            },
            success:function(res) {
                if (res.code != 1) {
                    alert(res.msg);
                    return;
                }
                if (res.code && res.code == -2) {
                    alert("无法连接服务器");
                    return;
                }
                _result = res.data.files;
            }
        })
        return _result;
    }
}

export default GetByType;
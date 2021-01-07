/**
 * 获取所有短信模板--公用模块
 */
import $ from 'jquery';
import CommonJs from './common';
var commonJs=new CommonJs;

class GetAllMsg{
    getAllMsg(){
        let msgMode;
        $.ajax({
            type:"get",
            url:"/common/getAllSMSTemplate",
            async:false,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                msgMode = res.data;
            }
        })
        return msgMode;
    }
}

export default GetAllMsg;
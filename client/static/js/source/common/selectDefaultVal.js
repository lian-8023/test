/** (========= tip：区别于之前有改动=========)
 * 点击编辑后，select框获取数据和显示默认值
 * obj    列表数组,array类型,例 types[...]
 * current_obj   默认值枚举类型，例 type{value : "rent",name : "rent",displayName : "租房"} 
 */
import $ from 'jquery';

class SelectDefaultVal{
    selectDefaultVal(obj,current_obj){
        if(!obj || obj.length<=0){
            return;
        }
        var edit_seletct='<select name="" class="select-gray ml20 edited-select"><option data-name="">请选择</option>';
        for (let i=0;i<obj.length;i++){
            if (current_obj && current_obj.value==obj[i].value){  //设置默认值
                edit_seletct+='<option selected="selected" data-name="'+obj[i].name+'">'+obj[i].displayName +'</option>';
            }else {
                edit_seletct+='<option data-name="'+obj[i].name+'">'+obj[i].displayName +'</option>';
            }
        }
        edit_seletct+= '</select>';
        return edit_seletct;
    }
}

export default SelectDefaultVal;
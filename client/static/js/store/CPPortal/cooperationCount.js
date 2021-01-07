import { observable, action, computed ,configure,runInAction} from "mobx";
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
configure({enforceActions:true})

//observable data 注册一个数据，这个数据将会成为一个可mobx监测的数据
//处理条数  今日已处理.......
/**
 * _value select选中的option value值
 */
export default class CooperationCountStore {
    @observable cooperationCount = {};

    @action getCooperationCount = (_url,parems) => {
        let that=this;
        $.ajax({
            type:"get", 
            url:_url, 
            async:true,
            dataType: "JSON", 
            data:parems?parems:'',
            success:function(res){
                runInAction(() => {
                    if(!commonJs.ajaxGetCode(res)){
                        that.cooperationCount={}
                        return;
                    }
                    var _data=res.data;
                    that.cooperationCount=_data
                })
            }
       })
    }
}

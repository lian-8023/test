import { observable, action, computed ,configure,runInAction} from "mobx";
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
configure({enforceActions:true})

//observable data 注册一个数据，这个数据将会成为一个可mobx监测的数据
//整站公用渠道（合作方）选择框
export default class ChannelStore {
    @observable channelArr = [];
    @action getChanel = () => {
        let that=this;
        $.ajax({
            type:"get", 
            url:"/node/manual/getSQ", 
            async:false,
            dataType: "JSON", 
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    runInAction(() => {
                        that.channelArr=[]
                    });
                    return;
                }
                var _data=res.data;
                runInAction(() => {
                    that.channelArr=_data.productEnums?_data.productEnums:[]
                });
           }
       })
    }
}

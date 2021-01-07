import { observable, action, computed ,configure,runInAction} from "mobx";
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
configure({enforceActions:true})

//observable data 注册一个数据，这个数据将会成为一个可mobx监测的数据
//商户数据-顶部合作方list
export default class CooperationListStore {
    @observable AllCooperation = {};
    @observable cooperationListUrl="";  //接口请求地址
    @observable parems={};  //接口请求参数

    @action getAllCooperations = (cooperationListUrl,parems) => {
        this.cooperationListUrl=cooperationListUrl;
        this.parems=parems;
        let that=this;
        $.ajax({
            type:"get", 
            url:cooperationListUrl, 
            async:true,
            dataType: "JSON", 
            data:parems?parems:'',
            success:function(res){
                runInAction(() => {
                    var _data=res.data;
                    if(!_data.executed){
                        that.cooperationAjax=false;
                        that.AllCooperation={};
                        return;
                    }
                    that.cooperationAjax=true;
                    that.AllCooperation=_data.count?_data.count:{}
                })
            }
        })
    }
}

import { observable, action, computed ,configure,runInAction} from "mobx";
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
configure({enforceActions:true})

//observable data 注册一个数据，这个数据将会成为一个可mobx监测的数据
//2a portal 顶部绑定（完成）数显示-通用
export default class TopBindNumberStore {
    @observable bindNumberData={};

    /**
     * 获取顶部绑定条数数据
     * callbackFn 获取数据后回调处理函数
     */
    @action initCount=(_url,mothed,callbackFn)=>{
        //获取枚举初始值
        let that=this;
        let _mothed='post';
        if(mothed){
            _mothed=mothed;
        }
        $.ajax({
            type:_mothed,
            url:_url,
            async:true,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    runInAction(() => {
                        that.bindNumberData={};
                    })
                    return;
                } 
                runInAction(() => {
                    let _getData=res.data;
                    that.bindNumberData=_getData
                })
                if(callbackFn)callbackFn();  //执行回调函数
            }
        })
    }
}

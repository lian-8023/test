import { observable, action, computed ,configure,runInAction} from "mobx";
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
configure({enforceActions:true})

//observable data 注册一个数据，这个数据将会成为一个可mobx监测的数据
//2a portal 电话详情数据
export default class PhoneMsgStore {
    @observable phonecallAuthInfoDTO={};
    @observable phonecallListInfoDTOS=[];
    @observable bills={};
    @observable phonecallListInfoDTOS_action={};  //点击phoneMsgList tr时，当前tr对应phonecallListInfoDTOS中的对象
    /**
     * 获取页面信息
     */
    @action getMst=(_that)=>{
        let that=this;
        let acountId=_that.userInfo2AStore.acountId;
        let nationalId=_that.userInfo2AStore.userInfo.nationalId;
        if(!nationalId||!acountId){
            return;
        }
        $.ajax({
			type:"post",
			url:"/node/getBills",
            async:true,
			dataType:"JSON",
            timeout : 30000, //超时时间设置，单位毫秒
            data:{
                nationalId:nationalId,
                accountId:acountId,
                // nationalId:"230602198705281186",
                // accountId:"5565077"
            },
            beforeSend:function(XMLHttpRequest){
                let loading_html='<div id="loading">'+
                                        '<div class="tanc_bg"></div>'+
                                        '<div class="ant-spin ant-spin-lg ant-spin-spinning ant-spin-show-text"><span class="ant-spin-dot"><i></i><i></i><i></i><i></i></span><div class="ant-spin-text">Loading...</div></div>'+
                                    '</div>';
                $("body").append(loading_html);       
            },
			success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    $("#loading").remove();
                    runInAction(() => {
                        that.phonecallAuthInfoDTO={};
                        that.phonecallListInfoDTOS=[];
                        that.bills={};
                    })
                    return;
                }
                runInAction(() => {
                    let _getData = res.data;
                    that.phonecallAuthInfoDTO=_getData.phonecallAuthInfoDTO?_getData.phonecallAuthInfoDTO:{},  //基本信息
                    that.phonecallListInfoDTOS=_getData.phonecallListInfoDTOS?_getData.phonecallListInfoDTOS:[], //电话清单列表
                    that.bills=_getData.bills?_getData.bills:{}
                    $("#loading").remove();
                    //加载默认信息源信息
                    $(".source-label li").removeClass("on");
                    $(".source-label li:eq(0)").addClass("on");
                })
			},
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
        　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
                    $("#loading").remove();
        // 　　　　     ajaxTimeOut.abort(); //取消请求
        　　　　　   alert("请求超时");
        　　　　}
        　　}
		});
    }
    
    // 点击tr事件
    @action setActionTr=(i)=>{
        let _phonecallListInfoDTOS=this.phonecallListInfoDTOS;
        if(_phonecallListInfoDTOS&&_phonecallListInfoDTOS.lenght>0){
            this.phonecallListInfoDTOS_action=this._phonecallListInfoDTOS[i];
        }
    }
}

import { observable, action, computed ,configure,runInAction} from "mobx";
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
configure({enforceActions:true})

//observable data 注册一个数据，这个数据将会成为一个可mobx监测的数据
//2a portal accountid白色信息条bar展示
export default class AcountBarStore {
    @observable acountId=""; 
    @observable selectLoanNoArray = "";  //select下拉框合同列表数据
    @observable selectedLoanNumber = [];  //select下拉框合同列表数据选中的合同号(目前仅 案列 页面请求参数)
    @observable currentLoanNumber = [];  //外部数据获取到的当前合同号

    /**
     * 获取select下拉框列表值
     * acountId 接口请求需要的参数
     * 切换select后的回调函数
     */
    @action getLoanList2A = (acountId,getLoanNoListCallback) => {
        let that=this;
        this.acountId=acountId;
        let n=$(".Csearch-left-page .on").attr("data-id");
        if(!this.acountId||this.acountId==''){
            return;
        }
        // 获取合同列表
        $.ajax({
            type:"get",
            url:"/node/pactList",
            async:true,
            dataType: "JSON",
            data:{
                accountId:that.acountId
            },
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    runInAction(() => {
                        that.selectLoanNoArray=[];
                        that.currentLoanNumber="";
                        that.selectedLoanNumber="";
                    })
                    return;
                }
                runInAction(() => {
                    var _getData = res.data;
                    that.selectLoanNoArray=_getData.loanInfoDTOs?_getData.loanInfoDTOs:[];
                    that.currentLoanNumber=(_getData.loanInfoDTOs&&_getData.loanInfoDTOs.length>0)?_getData.loanInfoDTOs[0].loanNumber:"";
                    that.selectedLoanNumber=(_getData.loanInfoDTOs&&_getData.loanInfoDTOs.length>0)?_getData.loanInfoDTOs[0].loanNumber:"";
                    if(getLoanNoListCallback){
                        getLoanNoListCallback();
                    }
                })
            }
        })
    }
}

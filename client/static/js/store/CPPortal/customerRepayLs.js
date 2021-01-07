import { observable, action, computed ,configure,runInAction} from "mobx";
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
configure({enforceActions:true})

//observable data 注册一个数据，这个数据将会成为一个可mobx监测的数据
//商户数据-顶部合作方list
export default class CustomerRepayLs {
    @observable parems="";  //接口请求参数
    @observable jzbCustomerInfoDTOS = [];
    //搜索
    /**
     * cdt 搜索条件
     */
    @action searchHandle=(pageNumber,pagesize,cdt)=>{
      let that=this;
      let parems={};
      parems.params=cdt;
      parems.pageNumber=pageNumber;
      parems.pagesize=pagesize;
      $.ajax({
        type:"POST", 
        url:'/node/charge/pay/list', 
        async:true,
        dataType: "JSON", 
        data:{josnParam:JSON.stringify(parems)},
        success:function(res){
            runInAction(() => {
                var _data=res.data;
                if (!commonJs.ajaxGetCode(res)) {
                    that.jzbCustomerInfoDTOS=[];
                    that.parems='';
                    return;
                }
                that.jzbCustomerInfoDTOS=_data.jzbCustomerInfoDTOS;
                })
            }
        })
    }

    @action reset=()=>{
        this.jzbCustomerInfoDTOS=[];
    }
}

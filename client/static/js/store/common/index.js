import { observable, action, computed ,configure,runInAction} from "mobx";
configure({enforceActions:true})

//observable data 注册一个数据，这个数据将会成为一个可mobx监测的数据
//整站公用渠道（合作方）选择框
export default class CommonStore {
    @observable requestCount = 0;  //总的请求队列
}

import { observable, action, computed ,configure,runInAction} from "mobx";
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
configure({enforceActions:true})

//observable data 注册一个数据，这个数据将会成为一个可mobx监测的数据
//2a portal labelBox store
export default class LabelBoxStore {
    @observable lef_page="leftComponent";  //左边页面组件
    @observable rig_page="rightComponent"; //右边页面组件
    @observable rowData={};  //labelBox需要的数据
    @observable pageData={};

    @observable A2LeftComponent=[]  //2A portal-左侧页面需要显示的组件配置(统一驼峰命名)
    @observable A2RightComponent=[]  //2A portal-右侧页面需要显示的组件配置
    @observable CPLeftComponent=[]  //cooperation portal-左侧页面需要显示的组件配置
    @observable CPRightComponent=[]  //cooperation portal-右侧页面需要显示的组件配置
}

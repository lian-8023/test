// 合作方
import CommonStore from  './common';  //公用store
import ChannelStore from  './CPPortal/channelArray';  //渠道-合作方  
import UserinfoStore from  './CPPortal/userinfo';  //用户信息
import CooperationListStore from  './CPPortal/cooperationList';  //顶部合作方list
import CooperationCountStore from  './CPPortal/cooperationCount';  //处理条数
import CustomerRepayLs from  './CPPortal/customerRepayLs';  //记账宝还款管理-客户还款账户列表

// 2A PORTAL
import UserInfo2AStore from  './A2Portal/userInfo2A';  //用户信息2A portal   
import AcountBarStore from  './A2Portal/acountBar';  //信息条下拉框2A portal
import PhoneMsgStore from  './A2Portal/phoneMsg';  //电话详情2A portal
import TopBindNumberStore from  './A2Portal/topBindNumber';  //顶部绑定（完成）数显示-通用 2A portal
import LabelBoxStore from  './A2Portal/labelBox';  //labelBox store

export default {
    CommonStore:new CommonStore(), 
    // 合作方
    ChannelStore:new ChannelStore(), 
    UserinfoStore:new UserinfoStore(), 
    CooperationList:new CooperationListStore(), 
    CooperationCountStore:new CooperationCountStore(), 
    CustomerRepayLs:new CustomerRepayLs(),
    // 2A PORTAL
    UserInfo2AStore:new UserInfo2AStore(), 
    AcountBarStore:new AcountBarStore(), 
    PhoneMsgStore:new PhoneMsgStore(),
    TopBindNumberStore:new TopBindNumberStore(),
    LabelBoxStore:new LabelBoxStore(),
}
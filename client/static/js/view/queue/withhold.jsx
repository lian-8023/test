// 重签代扣
import React,{PureComponent} from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import axios from '../../axios';

class Withhold extends React.Component{
    constructor(props){
        super(props);
        this.state={
            _unionPays:[]  //页面数据
        }
    }
    UNSAFE_componentWillMount(){
        this.getMsg();
    }
    componentDidMount(){
        var h = document.documentElement.clientHeight;
        $("#content").height(h-40);
    }
    //获取页面数据
    getMsg(){
        let that=this;
        axios({
            method: 'get',
            url:'/node/unionPayList',
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    _unionPays:[]
                })
                return;
            }
            that.setState({
                _unionPays:data.unionPays
            })
        })
    }
    //确认重签完成
    comfirmUnionPay(event){
        let $this=$(event.target);
        let _id=$this.closest("li").attr("data-id");
        let that=this;
        axios({
            method: 'get',
            url:'/node/comfirmUnionPay',
            params:{id:_id}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            alert(data.message);
            that.getMsg();
        })
    }

    render() {
        let unionPayLists=(this.state._unionPays && this.state._unionPays.length>0);
        return (
            <div className="content" id="content">
                <div className="bar bar-tit pl20"><b>重签银联代扣列表</b></div>
                <ul className="ul-tab mt15">
                    <li className="th">
                        <span className="ul-tab-span" style={{"width":"10%"}}>portal号码</span>
                        <span className="ul-tab-span" style={{"width":"7%"}}>客户姓名</span>
                        <span className="ul-tab-span" style={{"width":"20%"}}>银行卡号</span>
                        <span className="ul-tab-span" style={{"width":"10%"}}>所属银行</span>
                        <span className="ul-tab-span" style={{"width":"7%"}}>创建人</span>
                        <span className="ul-tab-span" style={{"width":"15%"}}>创建时间</span>
                        <span className="ul-tab-span" style={{"width":"7%"}}>目前状态</span>
                        <span className="ul-tab-span" style={{"width":"13%"}}>重签时间</span>
                    </li>
                    {
                        unionPayLists?this.state._unionPays.map((repy,i)=>{
                            let status_class="ul-tab-span";
                            let status_text="-";
                            let status_code=repy.status;
                            if(status_code==0){
                                status_class="ul-tab-span deep-yellow-font";
                                status_text="未发消息";
                            }
                            if(status_code==1){
                                status_class="ul-tab-span green-font";
                                status_text="已发短信";
                            }
                            if(status_code==2){
                                status_class="ul-tab-span blue-green-font";
                                status_text="重签成功";
                            }
                                return <li className="td" key={i} data-id={repy.id}>
                                        <b className="ul-tab-span" title={commonJs.is_obj_exist(repy.accountId)} style={{"width":"10%"}}>
                                            {commonJs.is_obj_exist(repy.accountId)}
                                        </b>
                                        <b className="ul-tab-span" title={commonJs.is_obj_exist(repy.name)} style={{"width":"7%"}}>
                                            {commonJs.is_obj_exist(repy.name)}
                                        </b>
                                        <b className="ul-tab-span" title={commonJs.is_obj_exist(repy.bankCardNumber)} style={{"width":"20%"}}>
                                            {commonJs.is_obj_exist(repy.bankCardNumber)}
                                        </b>
                                        <b className="ul-tab-span" title={commonJs.is_obj_exist(repy.bankName)} style={{"width":"10%"}}>
                                            {commonJs.is_obj_exist(repy.bankName)}
                                        </b>
                                        <b className="ul-tab-span" title={commonJs.is_obj_exist(repy.createdBy)} style={{"width":"7%"}}>
                                            {commonJs.is_obj_exist(repy.createdBy)}
                                        </b>
                                        <b className="ul-tab-span" title={commonJs.is_obj_exist(repy.createdAt)} style={{"width":"15%"}}>
                                            {commonJs.is_obj_exist(repy.createdAt)}
                                        </b>
                                        <b className={status_class} title={commonJs.is_obj_exist(status_text)} style={{"width":"7%"}}>
                                            {commonJs.is_obj_exist(status_text)}
                                        </b>
                                        <b className="ul-tab-span" style={{"width":"13%"}} title={commonJs.is_obj_exist(repy.resignTime)}>
                                            {commonJs.is_obj_exist(repy.resignTime)}
                                        </b>
                                        <b className="ul-tab-span">
                                            <button className="inline-block btn-blue" id={'sureComp'+i} onClick={this.comfirmUnionPay.bind(this)}>确认完成</button>
                                        </b>
                                    </li>
                            }):<li className="td gray-tip-font pl20">暂时没有数据...</li>
                    }
                </ul>
            </div>
        );
    }
};

export default Withhold;
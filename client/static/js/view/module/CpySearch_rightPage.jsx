import React,{PureComponent} from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
// 右侧页面
import CpySearch from './CpySearch';
import CpyOCR from './CpyOCR';
import CpyLP from './CpyLP';
import CpyApprove from './CpyApprove';
import CpyFraud from './CpyFraud';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class CpySearch_rightPage extends React.Component {
    constructor(props){
        super(props);
        this.state={
            _params:"",  //账号
            rig_page:<CpySearch />,  //右边页面组件
            getQueue:[], //顶部选中的合同号
            getCompanySearchCount:"",  //顶部绑定条数
            top_phoneNo:"",  //用户输入的电话号码
            top_acount:"",  //用户输入账号
            top_loanNumber:"",  //用户输入合同号
            outSearchCont:[],  //外部查询信息
            RecordsInfo:[],  //公司搜索queue记录
            Q_ajax:{}
        }
    }

    render() {
        return (
            <div className="right cont-right">
                <div className="bar title-box Csearch-right-page clearfix">
                    <ul className="left ml10 mt5 nav">
                        <li className="on" onClick={this.changeRight.bind(this,0)}>公司搜索</li>
                        <li onClick={this.changeRight.bind(this,3)}>OCR</li>
                        <li onClick={this.changeRight.bind(this,5)}>Approve</li>
                        <li onClick={this.changeRight.bind(this,6)}>Fraud</li>
                    </ul>
                    {/* <i className="right mr20 taggle-cion taggle-cion-up" onClick={commonJs.all_content_toggle.bind(this)}></i> */}
                </div>
                {this.state.rig_page}
            </div>
        );
    }
}
;

export default CpySearch_rightPage;
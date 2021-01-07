// 特殊回访拉取数据 cp-portal
import React from 'react';
import $ from 'jquery';
import { DatePicker } from 'antd';  
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class SpecialAvisitPull extends React.Component{
    constructor(props){
        super(props);
        this.state={
            reportTime: null,
        }
    }
    componentDidMount(){
        commonJs.reloadRules();

        var h = document.documentElement.clientHeight;
        $("#content").height(h-40);
    }
    // 切换时间
    timeChange(value, dateString){
        this.setState({reportTime: dateString});
    }
    //   方法
    searchFn(){
        let that=this;
        let _params={};
        let uploadFileDate=this.state.reportTime;
        if(!uploadFileDate || uploadFileDate==""){
            alert("请选择上报时间！");
            return;
        }
        _params.date=uploadFileDate;
        $.ajax({
            type:"post",
            url:"/node/task/pullAllSpecialReData",
            async:true,
            dataType: "JSON",
            data:_params,
            beforeSend:function(XMLHttpRequest){
               $("body").append(loading_html);       
            },
            success:function(res) {
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                var _getData = res.data;
                alert(_getData.message)
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
        　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
                    $("#loading").remove();
        　　　　     ajaxTimeOut.abort(); //取消请求
        　　　　　   alert("请求超时");
        　　　　}
        　　}
        })
    }
    render() {
        const {list}=this.state;
        return (
            <div className="content" id="content">
                <div className="bar clearfix flow-auto dU-condi pl20 pb10">
                    <div className="left mt15">时间：</div>
                    <div className="left mt10 mr10" id='timeCange'>
                        <DatePicker format='YYYY-MM-DD' onChange={this.timeChange.bind(this)} />
                    </div>
                    <div className="left mt10 mr10">
                        <a id='searchBtn' className="left btn-blue block" onClick={this.searchFn.bind(this)}>拉取特殊回访数据</a>
                    </div>
                </div>
            </div>
        )
    }
};

export default SpecialAvisitPull;  //ES6语法，导出模块
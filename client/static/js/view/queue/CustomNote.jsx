import React,{PureComponent} from 'react';
import $ from 'jquery';

class Withhold extends React.Component{
    render() {
        return (
            <div className="content" id="content">
                <div className="bar sendNote-tip">
                    <b className="left lef-t block">温馨提示：</b>
                    <div className="left rig-t">
                        1.发送短信的号码必须是已经注册过的用户（有薪易，小雨点），否则发送失败 <br/>
                        2.系统会根据手机号码自动判断短信的后缀（有薪易，小雨点） <br/>
                        3.短信内容不能超过300字，否则发送失败 <br/>
                    </div>
                </div>
                <div className="bar mt15 pl20 flow-auto">
                    <input type="text" className="input left mr20 mt10 mb10" placeholder="请输入电话号码" />
                    <select name="" id="" className="select-gray left mt10 mb10" style={{"width":"160px"}}>
                        <option value="">请选择短信类型</option>
                        <option value="">1</option>
                    </select>
                </div>
                <div className="bar left send-note-div">
                    <h3 className="note-t">模板短信</h3>
                    <textarea name="" id="" rows="8" className="note-cont" defaultValue="感谢您选择小雨点，由于您上传的身份证不清晰，导致姓名错误，现已修改为您正确姓名，您的贷款合同已撤销。如果仍有贷款需求，请立即登录官网www.xyd.cn重签合同。如有问题，欢迎随时联系我们， 微信：xyd_cn 热线：4000-188-299   QQ：4000188299">

                    </textarea>
                    <button className="btn-blue block">发送短信</button>
                </div>
                <div className="bar right send-note-div">
                    <h3 className="note-t">自定义短信</h3>
                    <textarea name="" id="" rows="8" className="note-cont" defaultValue="感谢您选择小雨点，由于您上传的身份证不清晰，导致姓名错误，现已修改为您正确姓名，您的贷款合同已撤销。如果仍有贷款需求，请立即登录官网www.xyd.cn重签合同。如有问题，欢迎随时联系我们， 微信：xyd_cn 热线：4000-188-299   QQ：4000188299">

                    </textarea>
                    <button className="btn-blue block">发送短信</button>
                </div>
            </div>
        );
    }
};

export default Withhold;
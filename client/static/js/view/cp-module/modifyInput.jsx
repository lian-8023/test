// 修改信息时显示的input
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
//校验
import VerifyJs from '../../source/common/verify';
var verifyJs=new VerifyJs;

class ModifyInput extends React.Component {
    componentDidMount(){
        this.props.setInit?
        this.props.setInit(this.props.keys,this.props.defaultValue):''
    }
    UNSAFE_componentWillReceiveProps(newProps){
        this.setState({
            newProps:newProps
        })
    }
    render() {
        let _defaultValue=this.props.defaultValue;
        let _value=this.props.value;
        let _w=this.props.width;
        return (
            <input type="text" id={this.props.keys} className={_value?'input':'input warnBg'}
                // defaultValue={(_defaultValue!='-')?this.props.defaultValue:'请输入'} 
                onChange={this.props.onChange} 
                value={_value}
                style={this.props.style}
                onKeyUp={verifyJs.verify.bind(this,"","notNull","auto","请先完善左侧详细信息")}
            />
        );
    }
};

export default ModifyInput;

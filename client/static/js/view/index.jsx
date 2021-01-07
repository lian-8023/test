import React from 'react';
import { Table, Badge, Menu, Dropdown, Icon } from 'antd';
import axios from '../axios';
import qs from 'Qs';
import CommonJs from '../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;

class Index extends React.Component{
    constructor(props){
        super(props);
        this.state={
          
        }
    }

    render() {
        
        return (
          <div className="homePage">
            <div className="hi"></div>
            <div className='homeTit'>欢迎访问2A portal后台系统</div>
          </div>
              
        );
    }
};

export default Index;
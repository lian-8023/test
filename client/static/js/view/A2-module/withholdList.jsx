import React from 'react';
import { Table, Badge, Menu, Dropdown, Icon } from 'antd';
import axios from '../axios';
import qs from 'Qs';
import CommonJs from '../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;

class WithholdList extends React.Component {
    componentDidMount (){
        this.getRepayment();
    }

    getRepayment=()=>{
        let nationalId=this.props.nationalId;
        let that=this;
        axios({
            method: 'get',
            url:'/node/loan/repayment/list',
            params:{nationalId:'500119198907225962'}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    repaymentList:[]
                })
                return;
            }
            that.setState({
                repaymentList:cpCommonJs.opinitionArray(data.data)
            })
        })
    }

    expandedRowRender2=()=>{
        const columns = [
            { title: 'loan', dataIndex: 'date', key: 'date' },
            { title: 'cadd', dataIndex: 'name', key: 'name' },
            { title: 'type', dataIndex: 'upgradeNum', key: 'upgradeNum' },
          ];
          const data = [];
          for (let i = 0; i < 3; ++i) {
            data.push({
              key: i,
              date: '2014-12-24 23:12:00',
              name: 'This is production name',
              upgradeNum: 'Upgraded: 56',
            });
          }
          return <Table columns={columns} dataSource={data} pagination={false} bordered />;
    }
    expandedRowRender = () => {
        const columns = [
          { title: 'Date', dataIndex: 'date', key: 'date' },
          { title: 'Name', dataIndex: 'name', key: 'name' },
          { title: 'Upgrade Status', dataIndex: 'upgradeNum', key: 'upgradeNum' },
        ];
        const data = [];
        for (let i = 0; i < 3; ++i) {
          data.push({
            key: i,
            date: '2014-12-24 23:12:00',
            name: 'This is production name',
            upgradeNum: 'Upgraded: 56',
          });
        }
        return <Table columns={columns} dataSource={data} pagination={false} expandedRowRender={this.expandedRowRender2} bordered />;
      };


    render() {
        const columns = [
            { title: 'Name', dataIndex: 'name', key: 'name' },
            { title: 'Platform', dataIndex: 'platform', key: 'platform' },
            { title: 'Version', dataIndex: 'version', key: 'version' },
            { title: 'Upgraded', dataIndex: 'upgradeNum', key: 'upgradeNum' },
            { title: 'Creator', dataIndex: 'creator', key: 'creator' },
            { title: 'Date', dataIndex: 'createdAt', key: 'createdAt' },
            { title: 'Action', key: 'operation', render: () => <a>Publish</a> },
          ];
        
          const data = [];
          for (let i = 0; i < 3; ++i) {
            data.push({
              key: i,
              name: 'Screem',
              platform: 'iOS',
              version: '10.3.4.5654',
              upgradeNum: 500,
              creator: 'Jack',
              createdAt: '2014-12-24 23:12:00',
            });
          }
        return (
            <div className="content bar" id="" style={{"height":"500px"}}>
                <Table
                    className="components-table-demo-nested"
                    columns={columns}
                    expandedRowRender={this.expandedRowRender}
                    dataSource={data}
                    bordered
                />
            </div>
        );
    }
};

export default WithholdList;

/**
 *
 * axios全局配置
 *
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'mobx-react';
import * as allStoreJs from '../store/allStore';  //所有mobx监测的数据
let allStore=allStoreJs.default;
import { Spin } from 'antd';
import axios from 'axios';
import CommonStore from '../store/allStore';
const commonStore=CommonStore.CommonStore;
// axios 配置
axios.defaults.timeout = 30000; //响应时间
axios.defaults.headers.post['Content-Type'] = 'application/json'; //配置请求头
axios.defaults.headers.get['Content-Type'] = 'application/json'; //配置请求头

// 当实例创建时设置默认配置
// axios.defaults.baseURL = 'http://localhost:3000';

//http response 拦截器:返回状态判断（添加响应拦截器）
axios.interceptors.request.use(function (config) {
  let requestCount=commonStore.requestCount;
  requestCount+=1;
  console.log(requestCount)
  if(requestCount==1){
    let loadingDiv = document.getElementById("loadingDiv");
    if(!loadingDiv){
        loadingDiv = document.createElement("div");
        loadingDiv.setAttribute("id", "loadingDiv");
        document.body.appendChild(loadingDiv);
    }
    loadingDiv.style.display="block";
    ReactDOM.render(
        <Provider allStore={allStore}>
            <Spin tip="Loading..." />
        </Provider>,
        loadingDiv
    );
  }
    return config;
  }, function (error) {
    let loadingDiv = document.getElementById("loadingDiv");
    loadingDiv.style.display="none";
    ReactDOM.unmountComponentAtNode(loadingDiv);
    // Do something with request error
    return Promise.reject(error);
});


axios.interceptors.response.use(function (response) {
  let requestCount=commonStore.requestCount;
  console.log(requestCount)
  if(requestCount==0){
    let loadingDiv = document.getElementById("loadingDiv");
    loadingDiv.style.display="none";
    ReactDOM.unmountComponentAtNode(loadingDiv);

  }
  requestCount-=1;
  // Do something with response data
    return response;
  }, function (error) {
    // Do something with response error
    let loadingDiv = document.getElementById("loadingDiv");
    loadingDiv.style.display="none";
    ReactDOM.unmountComponentAtNode(loadingDiv);
    return Promise.reject(error);
});

export default axios;
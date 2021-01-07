## PORTAL （cooperationPortal && 2aPortal）


* 前端项目名：frontend-portal
* 启动项目：
    * 在根目录下运行命令：node server.js （如果是首次拉取项目，需先运行命令：npm i）
* 项目打包：
    * /client/static/目录下运行命令：webpack
* 项目入口文件：
    * ⁨2aPortal：/client⁩/static⁩/js⁩/view⁩/entry.jsx
    * cooperationPortal：/client⁩/static⁩/js⁩/view⁩/cp-entry.jsx
* 本地环境日志：
    * /utils.js中，设置 isLogger=true，即可查看所有接口日志，否则只会打印错误日志。
* 线上日志位置：
    * /home/simplecredit/log/frontend-portal/applog/frontend-portal-info.log
    * /home/simplecredit/log/frontend-portal/applog/frontend-portal-error.log-yyyy-MM-dd
* 线下打包配置：
    * /utils.js 修改project_env为online，并对应填写当期版本号。
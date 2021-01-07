/*
 * cooperationPortal 请求接口
 * node:{}  前端请求node端配置， url:前端请求node端地址， method:请求方法（默认请求方式为get），os:2a portal或者cp portal；
 * server:{} node端请求服务端配置，url:node端请求后端地址， method:请求方法；
 * { node:{url:'/setup',method:'post'}, server:{url:'/loan/payment/setup',method:'post'} },  //设定付款
 *  */ 
var osConfigJs = require("../request-config/osConfig");
var osOption=osConfigJs.osConfig.cooperationPortal;
module.exports = {
    osOption:osOption,
    urlConfig:[
        // search
        { node:{url:'/manual/getSQ'}, server:{url:'/manual/getSQ'} },  //获取当前用户权限合作方  渠道
        { node:{url:'/search/info',method:'post'}, server:{url:'/search/info',method:'post'} },  //搜索
        { node:{url:'/search/identity/info',method:'post'}, server:{url:'/search/identity/info',method:'post'} },  //详情页面wcl
        { node:{url:'/search/payment/info',method:'post'}, server:{url:'/search/payment/info',method:'post'} },  //还款列表
        { node:{url:'/record/manualQueueRecord'}, server:{url:'/record/manualQueueRecord'} },  //查询人工审核案例记录--详情
        { node:{url:'/record/reVisitQueueRecord'}, server:{url:'/record/reVisitQueueRecord'} },  //回访数据处理 record
        { node:{url:'/record/fraudQueueRecord'}, server:{url:'/record/fraudQueueRecord'} },  //查询fraud案例记录--详情
        { node:{url:'/file/down'}, server:{url:'/file/down/{fileId}?isDown={isDown}&fileURL={fileURL}&fileName={fileName}',method:'pipe'} }, //下载文件 
        { node:{url:'/file/settle/proof'}, server:{url:'/file/settle/proof?isDown={isDown}&productNo={productNo}&loanNumber={loanNumber}&phone={phone}',method:'pipe'} }, //合作方文件结清下载 
        { node:{url:'/file/loan/down'}, server:{url:'/file/loan/down/{loanNumber}?isDown=YES',method:'pipe'} }, //下载文件-平台-合同文件2
        { node:{url:'/identity/update/imei',method:'post'}, server:{url:'/identity/update/imei',method:'post'} },  //修改IMEI串码-lyf
        { node:{url:'/identity/getDebitingInfo',method:'post'}, server:{url:'/identity/getDebitingInfo',method:'post'} },  //获取扣款列表-whw
        { node:{url:'/reV/real-board',method:'post'}, server:{url:'/reV/real-board',method:'post'} },  //回访当天操作实时看板-lyf
        { node:{url:'/account/query/amount',method:'post'}, server:{url:'/account/query/amount',method:'post_body'} },  //查询所需挂账金额
        // queue
        { node:{url:'/manual/count'}, server:{url:'/manual/count'} },  //数据处理情况-人工审核
        { node:{url:'/manual/xyh/count'}, server:{url:'/manual/xyh/count'} },  //数据处理情况-审核queue-小雨花
        { node:{url:'/manual/getAllCooperationCount'}, server:{url:'/manual/getAllCooperationCount'} },  //所有合作方数据展示-人工审核
        { node:{url:'/fraud/getAllCooperationCount'}, server:{url:'/fraud/getAllCooperationCount'} },  //所有合作方数据展示-反欺诈
        { node:{url:'/manual/xyh/getXyhAllCount'}, server:{url:'/manual/xyh/getXyhAllCount'} },  //所有合作方数据展示-审核queue-小雨花
        { node:{url:'/manual/searchByCondition',method:'post'}, server:{url:'/manual/searchByCondition',method:'post'} },  //搜索--人工审核
        { node:{url:'/manual/next'}, server:{url:'/manual/next'} },  //搜索下一条-人工审核
        { node:{url:'/manual/blurry',method:'post'}, server:{url:'/manual/blurry',method:'post'} },  //人工审核 手机号、合同号模糊查询
        { node:{url:'/manual/save',method:'post'}, server:{url:'/manual/save',method:'post_body'} },  //操作人工审核queue
        { node:{url:'/manual/reLoan',method:'post'}, server:{url:'/manual/reLoan',method:'post_body'} },  //重新放款-人工审核queue
        { node:{url:'/fraud/count'}, server:{url:'/fraud/count'} },  //获取今日处理条数-反欺诈queue
        { node:{url:'/fraud/search'}, server:{url:'/fraud/search'} },  //搜索-反欺诈queue
        { node:{url:'/fraud/next'}, server:{url:'/fraud/next'} },  //搜索下一条-反欺诈queue
        { node:{url:'/fraud/saveRecord',method:'post'}, server:{url:'/fraud/saveRecord',method:'post'} },  //保存fraud案列记录-反欺诈queue
        { node:{url:'/manual/loadFraudInfo'}, server:{url:'/manual/loadFraudInfo/{loanNumber}'} },  //反欺诈信息加载-反欺诈queue
        { node:{url:'/fraud/blurry',method:'post'}, server:{url:'/fraud/blurry',method:'post'} },  //反欺诈 手机号、合同号模糊查询
        { node:{url:'/bind/all',method:'post'}, server:{url:'/bind/all',method:'post_body'} },  //任务绑定-获取绑定列表
        { node:{url:'/bind/unbind/id',method:'post'}, server:{url:'/bind/unbind/id',method:'post_body'} },  //任务绑定-按照ID解绑-lyf
        { node:{url:'/store/storeCount'}, server:{url:'/store/storeCount'} },  //数据处理情况-门店审核
        { node:{url:'/store/nextStoreInfo',method:'post'}, server:{url:'/store/nextStoreInfo',method:'post'} },  //搜索下一条-门店审核
        { node:{url:'/store/searchStore',method:'post'}, server:{url:'/store/searchStore',method:'post'} },  //搜索-门店审核
        { node:{url:'/store/saveStoreInfo',method:'post'}, server:{url:'/store/saveStoreInfo',method:'post'} },  //保存record信息-门店审核
        { node:{url:'/reV/searchDa',method:'post'}, server:{url:'/reV/searchDa',method:'post'} },  //回访数据查询
        { node:{url:'/reV/init'}, server:{url:'/reV/init'} },  //初始化金额-回访
        { node:{url:'/reV/searchFund',method:'post'}, server:{url:'/reV/searchFund',method:'post'} },  //回访-放款查询-lyf
        { node:{url:'/reV/searchPaid',method:'post'}, server:{url:'/reV/searchPaid',method:'post'} },  //回访-还款查询-lyf
        { node:{url:'/reV/searchSh-pay',method:'post'}, server:{url:'/reV/searchSh-pay',method:'post'} },  //回访-逾期查询-lyf
        { node:{url:'/reV/assignFund',method:'post'}, server:{url:'/reV/assignFund',method:'post_body'} },  //回访数据-放款分配-lyf
        { node:{url:'/reV/assignPaid',method:'post'}, server:{url:'/reV/assignPaid',method:'post_body'} },  //回访数据-还款分配-lyf
        { node:{url:'/reV/assignShouldPay',method:'post'}, server:{url:'/reV/assignShouldPay',method:'post_body'} },  //回访数据-逾期分配-lyf
        { node:{url:'/reV/count',method:'post'}, server:{url:'/reV/count',method:'post'} },  //回访数据处理-数据处理情况-lyf
        { node:{url:'/reV/search',method:'post'}, server:{url:'/reV/search',method:'post'} },  //回访数据处理-搜索-lyf
        { node:{url:'/reV/next',method:'post'}, server:{url:'/reV/next',method:'post'} },  //回访数据处理-下一条-lyf
        { node:{url:'/reV/saveRe',method:'post'}, server:{url:'/reV/saveRe',method:'post'} },  //回访数据处理-保存-lyf
        { node:{url:'/reV/checkSave',method:'post'}, server:{url:'/reV/checkSave',method:'post_body'} },  //回访数据处理-信息审核保存-lyf
        { node:{url:'/manual/xyh/saveCaseRecord',method:'post'}, server:{url:'/manual/xyh/saveCaseRecord',method:'post_body'} },  //案件记录-小雨花
        { node:{url:'/manual/xyh/save',method:'post'}, server:{url:'/manual/xyh/save',method:'post_body'} },  //操作人工审核-小雨花
        { node:{url:'/reV/search-special',method:'post'}, server:{url:'/reV/search-special',method:'post'} },  //特殊回访-搜索-lyf 
        { node:{url:'/reV/assignSpecial',method:'post'}, server:{url:'/reV/assignSpecial',method:'post_body'} },  //特殊回访-分配-lyf
        { node:{url:'/real/board',method:'post'}, server:{url:'/real/board',method:'post'} },  //实时看板
        { node:{url:'/real/export'}, server:{url:'/real/export?isDown=YES"+"&type={type}&startTime={startTime}&endTime={endTime}&productTypeCode={productTypeCode}',method:'pipe'} }, //实时看板--导出贷款量或者客服处理量
        { node:{url:'/real/loanOrServiceSize',method:'post'}, server:{url:'/real/loanOrServiceSize',method:'post_body'} },  //实时看板--查询贷款量或者客服处理量
        { node:{url:'/real/productNoEnums'}, server:{url:'/real/productNoEnums'} },  //实时看板--合作方列表
        { node:{url:'/reV/getAllRevCount'}, server:{url:'/reV/getAllRevCount'} },  //回访数据处理-顶部合作方列表
        { node:{url:'/reV/real-count'}, server:{url:'/reV/real-count'} },  //查询回访数据实时处理情况-lyf
        { node:{url:'/reV/re-record',method:'post'}, server:{url:'/reV/re-record',method:'post'} },  //案例记录全局搜索-lyf
        { node:{url:'/task/pullAllSpecialReData',method:'post'}, server:{url:'/task/pullAllSpecialReData',method:'post'} },  //特殊回访拉取数据
        { node:{url:'/manual/xyh/searchByCondition',method:'post'}, server:{url:'/manual/xyh/searchByCondition',method:'post'} },  //搜索-小雨花
        { node:{url:'/manual/xyh/next'}, server:{url:'/manual/xyh/next'} },  //搜索下一条-小雨花
        { node:{url:'/manual/xyh/loadFraudInfo'}, server:{url:'/manual/xyh/loadFraudInfo/{loanNumber}'} },  //反欺诈信息加载-小雨花
        { node:{url:'/account/search',method:'post'}, server:{url:'/account/search',method:'post_body'} },  //搜索-合作方挂帐入账
        { node:{url:'/account/download/template'}, server:{url:'/account/download/template',method:'pipe'} }, //下载批量挂帐模板-合作方挂帐入账
        { node:{url:'/account/init'}, server:{url:'/account/init'} },  //初始化数据-合作方挂帐入账
        { node:{url:'/account/single',method:'post'}, server:{url:'/account/single',method:'post'} },  //单笔挂帐-合作方挂帐入账
        { node:{url:'/account/ensure',method:'post'}, server:{url:'/account/ensure',method:'post_body'} },  //确认入账-合作方挂帐入账
        { node:{url:'/account/cancel',method:'post'}, server:{url:'/account/cancel',method:'post'} },  //确认入账-合作方挂帐入账
        { node:{url:'/account/settle/amount'}, server:{url:'/account/settle/amount/{date}'} },  //查询每月快付通结算金额-lyf
        { node:{url:'/collection/updateBankInfo',method:'post'}, server:{url:'/collection/updateBankInfo',method:'post'} },  //17C修改银行信息
        { node:{url:'/account/batEnsure/batchNo',method:'post'}, server:{url:'/account/batEnsure/{batchNo}',method:'post_pipe'} },  //批量入帐总金额查询
        { node:{url:'/account/batEnsure',method:'post'}, server:{url:'/account/batEnsure',method:'post_body'} },  //批量入帐
        { node:{url:'/credit/query-report',method:'post'}, server:{url:'/credit/query-report',method:'post'} },  //征信报告查询
        { node:{url:'/credit/download-report'}, server:{url:'/credit/download-report',method:'pipe_flowUrl'} },  //征信报告下载
        { node:{url:'/case/init',method:'post'}, server:{url:'/case/init',method:'post_body'} },  //创建案例初始化
        { node:{url:'/case/addCase',method:'post'}, server:{url:'/case/addCase',method:'post_body'} },  //创建案例
        { node:{url:'/case/showCase'}, server:{url:'/case/showCase/{loanNumber}',method:'get'} },  //获取案例
        { node:{url:'/case/downCase'}, server:{url:'/case/downCase',method:'pipe_flowUrl'} },  //案例下载
        { node:{url:'/remind/query/conditions',method:'post'}, server:{url:'/remind/query/conditions',method:'post_body'} },  //remander 搜索
        { node:{url:'/remind/count'}, server:{url:'/remind/count'} },  //remander 数据量处理情况
        { node:{url:'/remind/query/loanNumber'}, server:{url:'/remind/query/loanNumber/{loanNumber}'} },  //remander 通过合同号查询数据详情
        { node:{url:'/remind/save',method:'post'}, server:{url:'/remind/save',method:'post_body'} },  //remander 保存record
        { node:{url:'/file/down/certificate'}, server:{url:'/file/down/certificate/{loanNumber}/{productNo}',method:'pipe'} },  //借款凭证下载接口
        { node:{url:'/file/downSettle'}, server:{url:'/file/downSettle/{loanNumber}',method:'pipe'} },  //结清证明下载
        { node:{url:'/merchant/count'}, server:{url:'/merchant/count'} },  //小雨花商户审核-数据处理情况
        { node:{url:'/merchant/search',method:'post'}, server:{url:'/merchant/search',method:'post_body'} },  //小雨花商户审核-搜索
        { node:{url:'/merchant/next',method:'post'}, server:{url:'/merchant/next',method:'post_body'} },  //小雨花商户审核-搜索下一条
        { node:{url:'/merchant/save',method:'post'}, server:{url:'/merchant/save',method:'post_body'} },  //小雨花商户审核-商户信息操作保存-lyf
        { node:{url:'/merchant/case/save',method:'post'}, server:{url:'/merchant/case/save',method:'post_body'} },  //小雨花商户审核-案件记录保存-lyf
        { node:{url:'/merchant/store/getCount'}, server:{url:'/merchant/store/getCount'} },  //小雨花门店审核-绑定条数
        { node:{url:'/merchant/store/getNext'}, server:{url:'/merchant/store/getNext'} },  //小雨花门店审核-搜索
        { node:{url:'/merchant/store/saveCase',method:'post'}, server:{url:'/merchant/store/saveCase',method:'post_body'} },  //小雨花门店审核-案件记录保存-lyf
        { node:{url:'/merchant/store/saveCheck',method:'post'}, server:{url:'/merchant/store/saveCheck',method:'post_body'} },  //小雨花门店审核-审核记录保存-lyf
        { node:{url:'/search/recognize/ocr'}, server:{url:'/search/recognize/ocr/{nationalId}'} },  //小雨花门店审核-搜索
        { node:{url:'/remind/searchList',method:'post'}, server:{url:'/remind/searchList',method:'post_body'} },  //合作方还款提醒-搜索
        { node:{url:'/remind/judgeBind',method:'post'}, server:{url:'/remind/judgeBind',method:'post_body'} },  //合作方还款提醒-搜索详细信息
        { node:{url:'/remind/xyh/save',method:'post'}, server:{url:'/remind/xyh/save',method:'post_body'} },  //合作方还款提醒-record保存
        { node:{url:'/file/down/certificates'}, server:{url:'/file/down/certificates',method:'pipe'} }, //批量借款凭证下载 
        { node:{url:'/reV/down/special'}, server:{url:'/reV/down/special/{batchNo}',method:'pipe'} }, //特殊回访案例下载 
        { node:{url:'/search/2A/identity/info',method:'post'}, server:{url:'/search/2A/identity/info',method:'post_body'} },  //2A详情页左侧用户信息
        { node:{url:'/charge/pay/list',method:'post'}, server:{url:'/charge/pay/list',method:'post_body'} },  //记账宝客户还款账户列表搜索
        { node:{url:'/charge/xyd/account/detail',method:'post'}, server:{url:'/charge/xyd/account/detail',method:'post_body'} },  //记账宝小雨点账户明细/还款流水管理
        { node:{url:'/charge/xyd/pay/manage'}, server:{url:'/charge/xyd/pay/manage'} },  //记账宝小雨点还款管理搜索
        { node:{url:'/manual/xyh/ocr',method:'post'}, server:{url:'/manual/xyh/ocr',method:'post_body'} },  //订单审核-OCR识别信息
        { node:{url:'/charge/xyd/down/detail'}, server:{url:'/charge/xyd/down/detail',method:'pipe_flowUrl'} },  //记账宝小雨点账户明细/还款流水管理 生成EXCL-lyf
        { node:{url:'/charge/query/balance'}, server:{url:'/charge/query/balance/{customerId}'} },  //记账宝显示未结清的列表-lyf
        { node:{url:'/charge/refund',method:'post'}, server:{url:'/charge/refund',method:'post_body'} },  //记账宝退款操作-lyf
        { node:{url:'/charge/query/bank'}, server:{url:'/charge/query/bank/{customerId}'} },  //记账宝获取银行列表-lyf
        { node:{url:'/store/searchStore/history',method:'post'}, server:{url:'/store/searchStore/history',method:'post_body'} },  //查询商户门店历史修改信息-lyf
        { node:{url:'/credit/query/phone',method:'post'}, server:{url:'/credit/query/phone',method:'post'} },  //查询征信手机号-lyf
        { node:{url:'/charge/query/prepayment/info',method:'post'}, server:{url:'/charge/query/prepayment/info',method:'post_body'} },  //查询提前结清所需金额详情-lyf
        { node:{url:'/charge/anyamount/account',method:'post'}, server:{url:'/charge/anyamount/account',method:'post_body'} },  //提交任意金额入账整笔/部分入账-lyf
        { node:{url:'/charge/operate/modify-plan',method:'post'}, server:{url:'/charge/operate/modify-plan',method:'post_body'} },  //查询/确认 提交修改还款计划 金额-lyf
        { node:{url:'/identity/new/getDebitingInfo'}, server:{url:'/identity/new/getDebitingInfo/{loanNumber}'} },  //获取扣款列表-new
        { node:{url:'/account/other/enrty',method:'post'}, server:{url:'/account/other/enrty',method:'post_body'} },  //其他款项登记-入帐-lyf
        { node:{url:'/xyh/manage/search',method:'post'}, server:{url:'/xyh/manage/search',method:'post_body'} },  //查询小雨花商户、门店信息-lyf
        { node:{url:'/xyh/manage/update',method:'post'}, server:{url:'/xyh/manage/update',method:'post_body'} },  //更改进件状态-lyf
        { node:{url:'/commodity/check/getInit'}, server:{url:'/commodity/check/getInit'} },  //小雨花商品审核初始化-wcl
        { node:{url:'/commodity/check/search'}, server:{url:'/commodity/check/search'} },  //小雨花商品审核搜索-wcl
        { node:{url:'/commodity/check/saveCheck',method:'post'}, server:{url:'/commodity/check/saveCheck',method:'post_body'} },  //保存审核记录-wcl
        { node:{url:'/xyhproduct/check/getCount'}, server:{url:'/xyhproduct/check/getCount'} },  //小雨花产品审核统计信息-wy
        { node:{url:'/xyhproduct/check/getNext'}, server:{url:'/xyhproduct/check/getNext'} },  //小雨花产品审核搜索-wy
        { node:{url:'/xyhproduct/check/saveCheck',method:'post'}, server:{url:'/xyhproduct/check/saveCheck',method:'post_body'} },  //小雨花产品保存审核记录-wcl
        { node:{url:'/account/down/special'}, server:{url:'/account/down/special?isDown=YES',method:'pipe'} }, //挂帐入账-下载特殊结清模板
        { node:{url:'/account/ensure/settle',method:'post'}, server:{url:'/account/ensure/settle',method:'post_body'} },  //确认结清-即上传文件-lyf
        { node:{url:'/account/cancel/deduction',method:'post'}, server:{url:'/account/cancel/deduction',method:'post_body'} },  //迭代减免已入账功能，开启2A利息减免支持
        { node:{url:'/account/upfrontfee/breaks',method:'post'}, server:{url:'/account/upfrontfee/breaks',method:'post_body'} },  //前期费减免+部分本金入账-lyf
        { node:{url:'/charge/init/type'}, server:{url:'/charge/init/type'} },  //记账宝客户还款类型初始化-lyf
        { node:{url:'/charge/return/query',method:'post'}, server:{url:'/charge/return/query',method:'post_body'} },  //退款记录查询-lyf
        { node:{url:'/collection/user/select',method:'post'}, server:{url:'/collection/user/select',method:'post_body'} },  //查询催收人员-催收二维码管理
        { node:{url:'/collection/user/add',method:'post'}, server:{url:'/collection/user/add',method:'post_body'} },  //新增用户-催收二维码管理
        { node:{url:'/collection/user/init'}, server:{url:'/collection/user/init',method:'get'} },  //查询产品号-催收二维码管理
        { node:{url:'/collection/user/update',method:'post'}, server:{url:'/collection/user/update',method:'post_body'} },  //更新-催收二维码管理
        { node:{url:'/collection/user/delete',method:'post'}, server:{url:'/collection/user/delete',method:'post_body'} },  //删除-催收二维码管理
        { node:{url:'/transaction/commit',method:'post'}, server:{url:'http://172.16.15.213:7474/db/data/transaction/commit',method:'post',type:'area'} },  //反欺诈查询
        { node:{url:'/cp/sms/send',method:'post'}, server:{url:'/cp/sms/send',method:'post_body'} },  //发送短信
        { node:{url:'/cp/ast/getCount'}, server:{url:'/cp/ast/getCount'} }, //获取AST数据处理情况-lyf
        { node:{url:'/cp/ast/next'}, server:{url:'/cp/ast/next'} },   //下一条-lyf
        { node:{url:'/cp/ast/save',method:'post'}, server:{url:'/cp/ast/save',method:'post_body'} },  //保存-lyf
        { node:{url:'/cp/ast/search',method:'post'}, server:{url:'/cp/ast/search',method:'post_body'} },  //搜索-lyf
        { node:{url:'/search/2C/delay',method:'post'}, server:{url:'/search/2C/delay',method:'post_body'} },  //搜索-lyf
        { node:{url:'/search/logout',method:'post'}, server:{url:'/search/logout',method:'post'} },  //注销2F
        { node:{url:'/account/charge/cash'}, server:{url:'/charge/cash/{productNo}'} },  //保证金充值
        { node:{url:'/charge/xyd/day/amount'}, server:{url:'/charge/xyd/day/amount'} },  //未还款入账金额（每日结算）
        { node:{url:'/opt/queryList',method:'post'}, server:{url:'/opt/queryList',method:'post_body'} },  //优选贷款初始化/搜索
        { node:{url:'/opt/searchSort'}, server:{url:'/opt/searchSort'} },  //优选贷款 搜索排序
        { node:{url:'/opt/sort',method:'post'}, server:{url:'/opt/sort/{flowPackage}',method:'post_pipe'} },  //优选贷款-编辑排序 
        { node:{url:'/opt/edit',method:'post'}, server:{url:'/opt/edit',method:'post_body'} },  //优选贷款-编辑
        { node:{url:'/advance/balance'}, server:{url:'/advance/balance'} },  //获取预付金月余额
        { node:{url:'/advance/all'}, server:{url:'/advance/all'} },  //获取所有预付金账户
        { node:{url:'/advance/records/update',method:'post'}, server:{url:'/advance/records/update',method:'post'} },  //预付金充值/扣款
        { node:{url:'/advance/init',method:'post'}, server:{url:'/advance/init',method:'post'} },  //预付金页面-初始化
        { node:{url:'/advance/create',method:'post'}, server:{url:'/advance/create',method:'post'} },  //预付金页面-创建预付金信息
        { node:{url:'/advance/records'}, server:{url:'/advance/records'} },  //预付金页面-查询预付金详细记录
        { node:{url:'/advance/records/downExcel'}, server:{url:'/advance/records/downExcel?isDown=YES',method:'pipe_flowUrl'} }, //下载预付金明细
        { node:{url:'/debit/queryPendingList',method:'post'}, server:{url:'/debit/queryPendingList',method:'post_body'} },  //扣款查询
        { node:{url:'/virtual/search/balance'}, server:{url:'/virtual/search/balance'} }, //虚拟资金池余额查询
        { node:{url:'/virtual/search/list',method:'post'}, server:{url:'/virtual/search/list',method:'post_body'} },  //虚拟资金池-列表搜索
        { node:{url:'/account/cancel/ensure/money'}, server:{url:'/account/cancel/ensure/{loanNumber}'} },  //取消入帐金额查询
        { node:{url:'/account/cancel/ensure',method:'post'}, server:{url:'/account/cancel/ensure',method:'post'} },  // 确认取消入账
        { node:{url:'/loan/get/contract'}, server:{url:'/loan/get/contract/{loanNumber}'} },  //合同查询list
        { node:{url:'/virtual/ensure',method:'post'}, server:{url:'/virtual/ensure',method:'post_body'} },  //虚拟资金池-资金入账
        { node:{url:'/virtual/down/list'}, server:{url:'/virtual/down/list',method:'pipe_flowUrl'} },  //虚拟资金池-下载
        { node:{url:'/merchant/update/amount',method:'post'}, server:{url:'/merchant/update/amount',method:'post'} },  // 单月最高放款额度（元）修改
        { node:{url:'/charge/correction/refund',method:'post'}, server:{url:'/charge/correction/refund',method:'post_body'} },  // 确认纠错转账
        { node:{url:'/manual/xyh/getLoanNoByNationId'}, server:{url:'/manual/xyh/getLoanNoByNationId'} },  // 身份证号码对应的合同号zys
        { node:{url:'/charge/anyamount/down'}, server:{url:'/charge/anyamount/down',method:'pipe'} },  //批量整笔结清模版下载-lyf
        { node:{url:'/amc/search',method:'post'}, server:{url:'/amc/search',method:'post_body'} },  // 债转数据状态查询-lyf
        { node:{url:'/amc/down/template'}, server:{url:'/amc/down/template',method:'pipe'} },  //债转模版下载-lyf
        

        

        
    ]
}
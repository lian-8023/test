/**
 * a2Portal 请求接口
 * node:{}  前端请求node端配置， url:前端请求node端地址， method:请求方法（默认请求方式为get），os:2a portal或者cp portal；
 * server:{} node端请求服务端配置，url:node端请求后端地址， method:请求方法；
 * { node:{url:'/setup',method:'post'}, server:{url:'/loan/payment/setup',method:'post'} },  //设定付款
 *  */ 
var osConfigJs = require("../request-config/osConfig");
var osOption=osConfigJs.osConfig.a2Portal;
module.exports = {
        osOption:osOption,
        urlConfig:[
            // search
            { node:{url:'/search_list'}, server:{url:'/search/search',method:'post'} },  //2A portal 搜索结果列表 
            { node:{url:'/UserMsg',method:'post'}, server:{url:'/identity/get/by/accountId',method:'post_body'} },  //详情页左侧用户信息
            { node:{url:'/UserMsg_edit_contactMsg'}, server:{url:'/identity/update/by/accountId',method:'post'} },  //详情页左侧用户信息--修改联系人信息
            { node:{url:'/user/pwd'}, server:{url:'/identity/update/user/pwd',method:'post'} },  //详情页左侧用户信息--修改用户密码
            { node:{url:'/pactList'}, server:{url:'/loan/list'} },  //详情-合同列表
            { node:{url:'/view/file'}, server:{url:'/file/down/{fileId}?isDown=NO&filename={filename}',method:'pipe'} }, //查看文件
            { node:{url:'/pactList_detail'}, server:{url:'/loan/loanlist'} },  //右侧--合同列表页面详情
            { node:{url:'/changeProcessingStatus',method:'post'}, server:{url:'/loan/modify/status',method:'post'} },  //右侧--合同列表页面详情
            { node:{url:'/underwrittingresult'}, server:{url:'/loan/underwrittingresult'} },  //右侧--获取creditModel结果
            { node:{url:'/approveStatus'}, server:{url:'/loan/blind/status'} },  //右侧--获取approve
            { node:{url:'/transfer'}, server:{url:'/loan/payment/transfer',method:'post'} },  //转账设定付款
            { node:{url:'/setup'}, server:{url:'/loan/payment/setup',method:'post'} },  //设定付款
            { node:{url:'/adjustment'}, server:{url:'/loan/adjustment',method:'post'} },  //设定调账
            { node:{url:'/debittingRcord'}, server:{url:'/loan/debitting',method:'post'} },  //获取扣款列表
            { node:{url:'/getadjustmentRcord'}, server:{url:'/loan/getadjustment',method:'post'} },  //调账历史记录
            { node:{url:'/blindsRcord'}, server:{url:'/loan/blinds',method:'post'} },  //blind记录
            { node:{url:'/getCpyMsg'}, server:{url:'/ocr/company/get'} },  //OCR-获取公司注册信息
            { node:{url:'/getworkMsg'}, server:{url:'/ocr/employ/get'} },  //OCR-获取工作证明信息
            { node:{url:'/getBankRunningMsg'}, server:{url:'/ocr/bank/statement/get'} },  //OCR-获取银行流水信息
            { node:{url:'/getAddrMsg'}, server:{url:'/ocr/address/get'} },  //OCR-获取地址证明信息
            { node:{url:'/ocrCompanyUpdate'}, server:{url:'/ocr/company/update',method:'post'} },  //修改公司注册信息
            { node:{url:'/ocrEmployUpdate'}, server:{url:'/ocr/employ/update',method:'post'} },  //修改工作证明
            { node:{url:'/bankModify'}, server:{url:'/ocr/bank/statement/modify',method:'post_body'} },  //修改银行流水
            { node:{url:'/ocrAddressUpdate'}, server:{url:'/ocr/address/update',method:'post'} },  //修改地址证明
            { node:{url:'/saveCaseList'}, server:{url:'/queueRecord/saveCaseList',method:'post'} },  //案例--保存
            { node:{url:'/getCompanyQueueRecordsByLoanNumber'}, server:{url:'/queueRecord/getCompanyQueueRecordsByLoanNumber'} },  //案例--公司搜索案例
            { node:{url:'/getVoeQueueRecordsByLoanNumber'}, server:{url:'/queueRecord/getVoeQueueRecordsByLoanNumber'} },  //案例--VOE案例
            { node:{url:'/getVorQueueRecordsByLoanNumber'}, server:{url:'/queueRecord/getVorQueueRecordsByLoanNumber'} },  //案例--VOR案例
            { node:{url:'/getOcrQueueRecordsByLoanNumber'}, server:{url:'/queueRecord/getOcrQueueRecordsByLoanNumber'} },  //案例--OCR案例
            { node:{url:'/getLpQueueRecordsByLoanNumber'}, server:{url:'/queueRecord/getLpQueueRecordsByLoanNumber'} },  //案例--Lp案例
            { node:{url:'/queueRecord/getTSlpQueueRecordByLoanNumber'}, server:{url:'/queueRecord/getTSlpQueueRecordByLoanNumber'} },  //案例--通善queue
            { node:{url:'/getDeclineLpQueueRecordsByLoanNumber'}, server:{url:'/queueRecord/getDeclineLpQueueRecordsByLoanNumber'} },  //案例--LP_Decline 案例
            { node:{url:'/getApproveQueueRecordByLoanNumber'}, server:{url:'/queueRecord/getApproveQueueRecordByLoanNumber'} },  //案例--Approve案例            
            { node:{url:'/getFraudQueueRecordByLoanNumber'}, server:{url:'/queueRecord/getFraudQueueRecordByLoanNumber'} },  //案例--Fraud案例            
            { node:{url:'/getRemindQueueRecordsByLoanNumber'}, server:{url:'/queueRecord/getRemindQueueRecordsByLoanNumber'} },  //案例--reminder案例            
            { node:{url:'/getCollectionQueueRecordsByLoanNumber'}, server:{url:'/queueRecord/getCollectionQueueRecordsByLoanNumber'} },  //案例--collection案例            
            { node:{url:'/getCaseListByLoanNumber'}, server:{url:'/queueRecord/getCaseListByLoanNumber'} },  //案例--通过loan_number查询案例记录            
            { node:{url:'/getCaseTypes'}, server:{url:'/queueRecord/getCaseTypes'} },  //案例--返回案例类别和沟通方式            
            { node:{url:'/smsmodel'}, server:{url:'/resign/smsmodel'} },  //获取重签短信模板
            { node:{url:'/sendSMS'}, server:{url:'/resign/sendSMS',method:'post'} },  //发送重签短信
            { node:{url:'/getUpdateTime'}, server:{url:'/file/getAllFileTypes'} },  //获取文件类型更新时间
            { node:{url:'/down/loan'}, server:{url:'/loan/download?accountId={accountId}&loannumber={loannumber}&isDownloadResign=true',method:'pipe'} }, //下载合同 
            { node:{url:'/loan/settle/proof'}, server:{url:'/loan/settle/proof?accountId={accountId}&loanNumber={loanNumber}&productNo={productNo}&isDownloadResign=true',method:'pipe'} }, //合同列表页面结清下载 
            { node:{url:'/jxlSearch'}, server:{url:'/jxl/search/{nationalId}/{sourceQuotient}/{customerId}'} },  //根据身份证号码获取聚信立-运营商数据-HC
            { node:{url:'/overdueInit'}, server:{url:'/overdue/init'} },  //初始化滞纳金减免类型-lyf
            { node:{url:'/reduceOverdue',method:'post'}, server:{url:'/overdue/reduceOverdue',method:'post'} },  //滞纳金减免保存-lyf
            { node:{url:'/getBills',method:'post'}, server:{url:'/pb/getBills',method:'post'} },  //获取通话清单列表内容-yif
            { node:{url:'/opPhoneBill',method:'post'}, server:{url:'/pb/opPhoneBill',method:'post'} },  //操作更新通话清单列表-yif
            { node:{url:'/cancelLatefee',method:'post'}, server:{url:'/overdue/cancelLatefee',method:'post'} },  //取消设定扣款滞纳金减免-lyf
            { node:{url:'/cancelDebit',method:'post'}, server:{url:'/loan/cancelDebit',method:'post'} },  //取消扣款列表-lyf
            { node:{url:'/overdueList',method:'post'}, server:{url:'/overdue/list',method:'post'} },  //逾期费列表/设定记录/逾期费扣款列表-lyf
            { node:{url:'/Contactslist'}, server:{url:'/identity/get/Contactslist'} },  //查看用户通讯录
            { node:{url:'/menuList',method:'post'}, server:{url:'/collection/menuList',method:'post'} },  //人工通讯记录查询的下拉列表菜单
            { node:{url:'/getManualCallRecord',method:'post'}, server:{url:'/manualCall/getManualCallRecord',method:'post'} },  //人工通讯记录-lyf
            { node:{url:'/isQualification',method:'post'}, server:{url:'/loan/isQualification',method:'post'} },  //获取展期资格查询-lyf
            { node:{url:'/extensionApplication',method:'post'}, server:{url:'/loan/extensionApplication',method:'post'} },  //
            { node:{url:'/phoneConsistency'}, server:{url:'/identity/get/phoneConsistency'} },  //手动获取联系人电话一致性
            { node:{url:'/dragSort'}, server:{url:'/file/change/sort'} },  //文件拖拽排序
            { node:{url:'/getUpfrontFeeRecordsByLoanNumber'}, server:{url:'/queueRecord/getUpfrontFeeRecordsByLoanNumber'} },  //获取前期费案列--案列列表页面
            { node:{url:'/queueRecord/getAstRecordsByLoanNumber'}, server:{url:'/queueRecord/getAstRecordsByLoanNumber'} },  //
            { node:{url:'/getLivingIdenty',method:'post'}, server:{url:'/file/get/liveface',method:'post'} },  //获取活体识别文件
            { node:{url:'/savePhoneLoanPurpose'}, server:{url:'/loan/savePhoneLoanPurpose/{loannumber}/{phoneLoanPurpose}'} },  //合同列表-更新电核贷款目的
            { node:{url:'/socialInfo',method:'post'}, server:{url:'/manager/social/info',method:'post'} },  //查询管理费社保信息
            { node:{url:'/socialDetail',method:'post'}, server:{url:'/manager/social/detail',method:'post'} },  //查询管理费社保详情信息
            { node:{url:'/BankList',method:'post'}, server:{url:'/manager/bank/info',method:'post'} },  //
            { node:{url:'/calculate',method:'post'}, server:{url:'/overdue/calculate',method:'post'} },  //计算逾期费
            { node:{url:'/loan/payment/LawsuitSetup',method:'post'}, server:{url:'/loan/payment/LawsuitSetup',method:'post'} },  //诉讼或者执行设定付款   
            { node:{url:'/loan/lawsuitPayment/record',method:'post'}, server:{url:'/loan/lawsuitPayment/record',method:'post'} },  //查询诉讼或者执行扣款记录 
            // Qport
            { node:{url:'/Taskbundle'}, server:{url:'/bind/all'} },  //任务绑定-获取所有任务 
            { node:{url:'/tianrList'}, server:{url:'/tianr/get/list'} },  //查询天润绑定账号列表
            { node:{url:'/tianr/modify'}, server:{url:'/tianr/modify',method:'post'} },  //新增、修改绑定记录
            { node:{url:'/tianr/del'}, server:{url:'/tianr/del/{id}'} }, //删除绑定记录 
            { node:{url:'/unbindById',method:'post'}, server:{url:'/bind/unbind/byid',method:'post_body'} },  //任务绑定-按id解绑
            { node:{url:'/unbindByType',method:'post'}, server:{url:'/bind/unbind/bytype',method:'post_body'} },  //任务绑定-按类型解绑
            { node:{url:'/unionPayList'}, server:{url:'/resign/unionPayList'} },  //查找重签记录列表
            { node:{url:'/comfirmUnionPay'}, server:{url:'/resign/comfirmUnionPay',method:'post'} },  //确认重签完成
            { node:{url:'/smsType'}, server:{url:'/sms/smsType'} },  //获取初始化短信类型-lyf
            { node:{url:'/smsRecords',method:'post'}, server:{url:'/sms/smsRecords',method:'post_body'} },  //搜索短信内容-lyf
            { node:{url:'/rtTaskIinitType'}, server:{url:'/rtTask/initType'} },  //初始化类型和任务状态-lyf
            { node:{url:'/rtTaskChange',method:'post'}, server:{url:'/rtTask/change',method:'post_body'} },  //任务改派-lyf
            { node:{url:'/rtTaskSearch',method:'post'}, server:{url:'/rtTask/search',method:'post_body'} },  //实时任务搜索-lyf
            { node:{url:'/queryRecon',method:'post'}, server:{url:'/recon/queryRecon',method:'post'} },  //获取核对结果列表
            { node:{url:'/queryReconDetails',method:'post'}, server:{url:'/recon/queryReconDetails',method:'post'} },  //获取数据明细列表
            { node:{url:'/queryUploadHistory',method:'post'}, server:{url:'/recon/queryUploadHistory',method:'post'} },  //获取文件上传历史列表
            { node:{url:'/getSMStemplateList'}, server:{url:'/sms/getSMStemplateList'} },  //获取短信模板
            { node:{url:'/getChannelList'}, server:{url:'/sms/getChannelList'} },  //获取通道数据
            { node:{url:'/getSMSTemplateById'}, server:{url:'/sms/getSMSTemplateById'} },  //通过短信模版ID查询模版内容
            { node:{url:'/updateSMSTemp',method:'post'}, server:{url:'/sms/updateSMSTemplateContent',method:'post'} },  //更新短信模板
            { node:{url:'/corpSeach'}, server:{url:'/cor/corpSeach/{params}'} },  //
            { node:{url:'/searchHistory',method:'post'}, server:{url:'/history/searchHistory',method:'post'} },  //portal操作历史记录
            { node:{url:'/getWorkOrerEnum'}, server:{url:'/workorder/getWorkOrerEnum'} },  //初始化初始枚举值
            { node:{url:'/getWorkOrerList',method:'post'}, server:{url:'/workorder/getWorkOrerList',method:'post_body'} },  //查询工单列表
            { node:{url:'/getWorkOrer'}, server:{url:'/workorder/getWorkOrer'} },  //查询工单详情
            { node:{url:'/saveWorkOrder',method:'post'}, server:{url:'/workorder/saveWorkOrder',method:'post'} },  //保存工单
            { node:{url:'/deleteWorkBind',method:'post'}, server:{url:'/workorder/deleteWorkBind',method:'post_body'} },  //工单解绑
            { node:{url:'/addNewWorkOrder',method:'post'}, server:{url:'/workorder/addWorkOrder',method:'post_body'} },  //新增工单
            { node:{url:'/updateWorkOrer',method:'post'}, server:{url:'/workorder/updateWorkOrer',method:'post'} },  //编辑工单调用接口
            { node:{url:'/searchBind'}, server:{url:'/workorder/getWorkBindList'} },  //查询绑定工单
            { node:{url:'/workorder/getOverdueCaseRecord'}, server:{url:'/workorder/getOverdueCaseRecord'} },  //工单催收案例记录展示
            { node:{url:'/workOrderHistory'}, server:{url:'/workorder/getWorkOrerHistroyList'} },  //查询工单操作历史
            { node:{url:'/statistics',method:'post'}, server:{url:'/collection/statistics',method:'post'} },  //实时统计案件操作，承诺还款，还款人户，金额
            { node:{url:'/getWorkOrerRecord'}, server:{url:'/workorder/getWorkOrerRecord'} },  //查询操作历史详细
            { node:{url:'/warningPaymentRedis'}, server:{url:'/paymentRedis/warningPaymentRedis'} },  //获取预警展示Redis数据--默认加载数据
            { node:{url:'/queryRedisByLoanNumber'}, server:{url:'/paymentRedis/queryRedisByLoanNumber'} },  //通过LoanNumber查询redis数据是否存在
            { node:{url:'/deleteRedisByRedisKey',method:'post'}, server:{url:'/paymentRedis/deleteRedisByRedisKey',method:'post_body'} },  //通过RedisByRedisKey删除redis数据
            { node:{url:'/getUploadFileType'}, server:{url:'/file/getUploadFileType'} },  //根据文件类型获取文件--上报数据
            { node:{url:'/lawsuit/getLawsuitInitEnum'}, server:{url:'/lawsuit/getLawsuitInitEnum'} },  //诉讼--获取初始值
            { node:{url:'/lawsuit/extract'}, server:{url:'/lawsuit/extract/lawsuit/pool?extractNumber={extractNumber}&overdueDayMax={overdueDayMax}&poolEnterTimeBegin={poolEnterTimeBegin}&poolEnterTimeEnd={poolEnterTimeEnd}&productNo={productNo}&totalPastDuePrincipalStart={totalPastDuePrincipalStart}&totalPastDuePrincipalEnd={totalPastDuePrincipalEnd}',method:'pipe'} },  //提取诉讼池到诉讼
            { node:{url:'/lawsuit/getLawsuitList',method:'post'}, server:{url:'/lawsuit/getLawsuitList',method:'post'} },  //诉讼--搜索
            { node:{url:'/lawsuit/batchUpdateCaseStatus',method:'post'}, server:{url:'/lawsuit/batchUpdateCaseStatus',method:'post_body'} },  //诉讼--批量修改结案状态
            { node:{url:'/lawsuit/batchUpdateLawsuitStatus',method:'post'}, server:{url:'/lawsuit/batchUpdateLawsuitStatus',method:'post_body'} },  //诉讼--批量编辑诉讼状态
            { node:{url:'/lawsuit/batchUpdateSubmitLawsuitTime',method:'post'}, server:{url:'/lawsuit/batchUpdateSubmitLawsuitTime',method:'post_body'} },  //诉讼--批量编辑诉讼时间
            { node:{url:'/lawsuit/litigate/download',method:'post'}, server:{url:'/lawsuit/litigate/download',method:'post_body'} },  //诉讼--导出客户合同&还款明细
            { node:{url:'/lawsuit/export/verdictList',method:'post'}, server:{url:'/lawsuit/export/verdictList',method:'post_body'} },  //诉讼--导出判决书
            { node:{url:'/lawsuit/exportLawsuitList'}, server:{url:'/lawsuit/exportLawsuitList?isDown=YES&ids={ids}',method:'pipe'}}, //诉讼--导出清单-get
            { node:{url:'/jxl/search_new'}, server:{url:'/jxl/search_new/{nationalId}/{customerId}'} }, //获取2A聚信立-改版运营商数据-LYF
            { node:{url:'/sms/smsRecordsNew',method:'post'}, server:{url:'/sms/smsRecordsNew',method:'post_body'} },  //短信记录
            { node:{url:'/ts/getTsCount'}, server:{url:'/ts/getTsCount'} }, //数据处理情况
            { node:{url:'/ts/searchTsLoanNumber',method:'post'}, server:{url:'/ts/searchTsLoanNumber',method:'post'} },  //通善lp查询合同号-lyf
            { node:{url:'/ts/tsNext'}, server:{url:'/ts/tsNext'} }, //通善lp下一条
            { node:{url:'/ts/saveTsLp',method:'post'}, server:{url:'/ts/saveTsLp',method:'post'} },  //通善lp保存
            { node:{url:'/ts/searchTsInfoByLoanNumber',method:'post'}, server:{url:'/ts/searchTsInfoByLoanNumber',method:'post'} },  //通善lp根据合同号查询详情
            { node:{url:'/file/financial',method:'post'}, server:{url:'/file/financial',method:'post'} },  //金融办上传数据查询-上报数据搜索
            { node:{url:'/collection/offLinePayment',method:'post'}, server:{url:'/collection/offLinePayment',method:'post'} },  //确认入账-催收queue
            { node:{url:'/collection/cancelPayment',method:'post'}, server:{url:'/collection/cancelPayment',method:'post'} },  //取消线下还款入账
            { node:{url:'/collection/searchRepaymentAmount',method:'post'}, server:{url:'/collection/searchRepaymentAmount',method:'post'} },  //查询当前用户结清金额
            { node:{url:'/collection/behaviour/save',method:'post'}, server:{url:'/collection/behaviour/save',method:'post'} },  //催收行为记录
            { node:{url:'/collection/repayment/plan',method:'post'}, server:{url:'/collection/children/repayment/plan',method:'post'} },  //2F循环授信获取子合同号的还款计划
            { node:{url:'/collection/download/file/notice'}, server:{url:'/collection/download/file/notice'} },  //催告函下载
            { node:{url:'/collection/flag',method:'post'}, server:{url:'/collection/flag',method:'post'} },  //投诉用户打标  
            { node:{url:'/collection/bringDueDateForward',method:'post'}, server:{url:'/collection/bringDueDateForward',method:'post'} },  //投诉用户打标  
            //
            { node:{url:'/getAstCount'}, server:{url:'/ast/getAstCount',method:'post'} },  //获取AST数据处理情况
            { node:{url:'/getAstStepsMsg'}, server:{url:'/ast/get/user/{registrationId}'} },  //根据registrationId获取用户信息
            { node:{url:'/searchAst',method:'post'}, server:{url:'/ast/searchAstLoanNumberByConditions',method:'post'} },  //通过条件查询ast
            { node:{url:'/nextAstQueue'}, server:{url:'/ast/nextAstQueue'} },  //搜索下一条
            { node:{url:'/saveStep1',method:'post'}, server:{url:'/ast/save/step1',method:'post'} },  //保存step1
            { node:{url:'/saveStep2',method:'post'}, server:{url:'/ast/save/step2',method:'post'} },  //保存step2
            { node:{url:'/saveStep3',method:'post'}, server:{url:'/ast/save/step3',method:'post'} },  //保存step3
            { node:{url:'/saveStep4',method:'post'}, server:{url:'/ast/save/step4',method:'post'} },  //保存step4
            { node:{url:'/saveAstQueue',method:'post'}, server:{url:'/ast/saveAstQueue',method:'post'} },  //保存ast
            { node:{url:'/collection/updateBankInfo',method:'post'}, server:{url:'/collection/updateBankInfo',method:'post'} },  //17C修改银行信息
            { node:{url:'/sms/manager',method:'post'}, server:{url:'/sms/manager',method:'post_body'} },  //短信模板和短信业务查询通用接口
            { node:{url:'/collection/assign/lawsuit',method:'post'}, server:{url:'/collection/assign/lawsuit',method:'post_body'} },  //collection 分配到诉讼
            { node:{url:'/workorder/down'}, server:{url:'/workorder/down',method:'pipe_flowUrl'} }, //工单搜索接口下载 
            { node:{url:'/sms/downExcelSendMsgTemplate'}, server:{url:'/sms/downExcelSendMsgTemplate',method:'pipe'} }, //外呼短信模板
            { node:{url:'/lawsuit/assign/lawsuit2Collection',method:'post'}, server:{url:'/lawsuit/assign/lawsuit2Collection',method:'post_body'} },  //诉讼分配到collection
            { node:{url:'/upfrontFee/getUpfrontFeeList',method:'post'}, server:{url:'/upfrontFee/getUpfrontFeeList',method:'post'} },  //担保费搜索
            { node:{url:'/upfrontFee/query/gurantee'}, server:{url:'/upfrontFee/query/gurantee/{loanNumber}'} },  //根据合同号查询担保费还款列表-lyf
            { node:{url:'/upfrontFee/gurantee/pay',method:'post'}, server:{url:'/upfrontFee/gurantee/pay',method:'post_body'} },  //根据合同号查询担保费扣款记录-lyf
            { node:{url:'/identity/logout',method:'post'}, server:{url:'/identity/logout',method:'post'} },  //根据合同号查询担保费扣款记录-lyf
            { node:{url:'/workorder/getWorkOrerEnum'}, server:{url:'/workorder/getWorkOrerEnum'} },  //2A获取所有合作方 - 工单
            { node:{url:'/loan/merge/installment'}, server:{url:'/loan/merge/installment/{loanNumber}'} },  //2F还款列表
            { node:{url:'/loan/merge/payment'}, server:{url:'/loan/merge/payment/{loanNumber}/{installment}'} },  //2F还款列表
            { node:{url:'/fileAfterLoan/getFileList'}, server:{url:'/fileAfterLoan/getFileList'} },  //获取文件列表
            { node:{url:'/fileAfterLoan/getFileParams'}, server:{url:'/fileAfterLoan/getFileParams'} },  //获取文件可用参数
            { node:{url:'/lpr/rate/getList'}, server:{url:'/lpr/rate/getList'} },  //获取LPR列表
            { node:{url:'/fileAfterLoan/getInitData'}, server:{url:'/fileAfterLoan/getInitData'} },  //获取文件可用参数
            { node:{url:'/lpr/rate/save',method:'post'}, server:{url:'/lpr/rate/save',method:'post_body'} },  //保存LPR  
            { node:{url:'/fileAfterLoan/saveFile',method:'post'}, server:{url:'/fileAfterLoan/saveFile',method:'post_body'} },  //诉讼模板保存  
            { node:{url:'/preview/file/word/create',method:'post'}, server:{url:'/fileAfterLoan/preview/file/word/create',method:'post_body'} },  //诉讼模板预览
            { node:{url:'/fileAfterLoan/preview/file/word'}, server:{url:'/fileAfterLoan/preview/file/word',method:'pipe'} },  //诉讼模板删除
            { node:{url:'/fileAfterLoan/deleteFile'}, server:{url:'/fileAfterLoan/deleteFile/{id}'} },  //诉讼模板删除
            { node:{url:'/lpr/rate/deleteFile'}, server:{url:'/lpr/rate/deleteFile/{id}'} },  //删除LPR
            { node:{url:'/external/payment/settlement'}, server:{url:'/external/payment/settlement?isDown=YES',method:'pipe_flowUrl'} }, //新增回款&结算明细下载
            { node:{url:'/loan/repayment/list'}, server:{url:'/loan/repayment/list'} },  //查询扣款列表wcl - 支持2F以外的所有产品
        ]
    }
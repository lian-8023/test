//不同路由对应不同路由文件  server.js文件用
module.exports={
    // new portal
    '/common':'./server/port-config/A2common',
    '/companySearch':'./server/port-config/companySearch',
    '/Qport':'./server/port-config/Qport',
    '/RemColt':'./server/port-config/Remd_Collt',
    // cp-portal
    '/cpQueue':'./server/port-config/cpQueue',
    '/cpCommon':'./server/port-config/cpCommon'
}
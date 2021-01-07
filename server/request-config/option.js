/**
 * 管理员权限端口配置
 */
module.exports ={
        native:{
            cityHost:"base.simplecredit.lotest",
            redisHost:"127.0.0.1",
            redisPort:"6379",
            a2Portal: "http://10.244.76.11:8037",
            cooperationPortal: "http://10.244.76.11:8072",
            internalGateway: "http://10.244.76.11:8083",
            cooperation_alchemist: "http://10.244.76.11:8033"
        },

        dev:{
            cityHost:"base.simplecredit.lotest",
            redisHost:"rule-manager.simplecredit.lodev",
            redisPort:"",
            a2Portal: "http://10.244.76.7",
            cooperationPortal: "http://internal-gateway.simplecredit.lotest/cp-portal",
            internalGateway: "http://internal-gateway.simplecredit.lotest",
            cooperation_alchemist: "http://cooperation_alchemist.simplecredit.lotest"
        },

        test:{
            cityHost:"base.simplecredit.lotest",
            redisHost:"127.0.0.1",
            redisPort:"6379",
            a2Portal: "http://portal-2.simplecredit.lotest",
            cooperationPortal: "http://internal-gateway.simplecredit.lotest/cp-portal",
            internalGateway: "http://internal-gateway.simplecredit.lotest",
            cooperation_alchemist: "http://cooperation_alchemist.simplecredit.lotest",
        },

        demo:{
            cityHost:"base.simplecredit.lotest",
            redisHost:"127.0.0.1",
            redisPort:"6379",
            a2Portal: "http://54.222.226.150:8037",
            cooperationPortal: "http://54.222.226.150:8072",
            internalGateway: "http://54.222.226.150:8072",
            cooperation_alchemist: "http://cooperation_alchemist.simplecredit.lotest"
        },

        staging:{
            cityHost:"base",
            redisHost:"redis",
            redisPort:"6379",
            a2Portal: "http://portal-2",
            cooperationPortal: "http://internal-gateway/cp-portal",
            internalGateway: "http://internal-gateway",
            cooperation_alchemist: "http://cooperation-alchemist"
        },

        online:{
            cityHost:"internal-elb-base-637150706.cn-north-1.elb.amazonaws.com.cn",
            redisHost:"xyd-redis.iyb0as.ng.0001.cnn1.cache.amazonaws.com.cn",
            redisPort:"6379",
            a2Portal: "http://internal-elb-portal-2-770379365.cn-north-1.elb.amazonaws.com.cn",
            cooperationPortal: "http://internal-elb-internal-gateway-926424897.cn-north-1.elb.amazonaws.com.cn/cp-portal",
            internalGateway: "http://internal-elb-internal-gateway-926424897.cn-north-1.elb.amazonaws.com.cn",
            cooperation_alchemist: "http://elb-cooperation-alchemist-429237855.cn-north-1.elb.amazonaws.com.cn"
        }
    }

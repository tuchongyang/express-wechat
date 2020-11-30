let express =require('express');
let cache = require('memory-cache');
let config = require('./config');
let common = require('../common/index')
let router = express.Router();
let util = require('../../utils/util')
let createHash = require('create-hash');
const { json } = require('express');

router.get('/',function(req, res){
    res.render('index', { title: '微信接口服务' });
})

router.get('/test',function(req, res){
    res.json({
        code: 0,
        data: 'text',
        message: ''
    })
})
// 用户授权重定向
router.get('/redirect',function(req, res){
    let redirectUrl = req.query.url
    let scope = req.query.scope || 'snsapi_base'
    let callback='http://wx.icsb.shop/wechat/getOpenId';
    let authorizeUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.wx.appId}&redirect_uri=${callback}&response_type=code&scope=${scope}&state=123#wechat_redirect`

    cache.put('redirectUrl',redirectUrl);

    res.redirect(authorizeUrl);
})

// 根据code获取用户的openId
router.get('/getOpenId',async function(req, res){
    let code = req.query.code
    
    if(!code){
        res.json(util.handleFail('当前为获取到授权code码'))
    }else{
        let result = await common.getAccessToken(code);
        if(result.code == 0){
            let data = result.data;
            let expireTime = 1000 * 60  * 1;
            cache.put('access_token',data.access_token,expireTime);
            cache.put('openId', data.openid,expireTime);
            res.cookie('openId', data.openid, {maxAge: expireTime})
            let redirectUrl = cache.get('redirectUrl')
            res.redirect(redirectUrl)
        }else{
            res.json(result);
        }
    }


})
// 根据code获取用户信息
router.get('/getUserInfo',async function(req, res){
    let access_token = cache.get('access_token');
    let openId = cache.get('openId');
    let result = await common.getUserInfo(access_token,openId);
    res.json(result)
})
// 
router.get('/jssdk',async function(req, res){
    let url = req.query.url;
    let result = await common.getToken();
    if(result.code==0){
        let token = result.data.access_token
        cache.put('token', token);
        let result2 = await common.getTicket(token);
        if(result2.code==0){
            let data = result2.data;
            let params = {
                noncestr: util.createNovceStr(),
                jsapi_ticket:data.ticket,
                timestamp:util.createTimeStamp(),
                url
            }
            let str = util.raw(params);
            let sign = createHash('sha1').update(str).digest('hex');
            res.json(util.handleSuc({
                appId: config.wx.appId,
                timestamp: params.timestamp,
                noncestr: params.noncestr,
                signature: sign,
                jsApiList: ['updateAppMessageShareData','updateTimelineShareData','chooseWXPay','onMenuShareTimeline','onMenuShareAppMessage','onMenuShareQQ','onMenuShareQZone']
            }))

        }
    }else{
        res.json(result)
    }
})


module.exports = router;
let express =require('express');
let cache = require('memory-cache');
let config = require('./config');
let common = require('../common/index')
let router = express.Router();
let util = require('../../utils/util')


router.get('/',function(req, res){
    res.json({
        code: 0,
        data: '微信接口服务',
        message: ''
    })
})

router.get('/test',function(req, res){
    res.json({
        code: 0,
        data: 'text',
        message: ''
    })
})
// 用户授权重定向
router.get('/redrect',function(req, res){
    let redirectUrl = req.query.url
    let scope = req.query.scope || 'snsapi_base'
    let callback='http://m.imooc.com/api/wechat/getOpenId';
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
console.log('access_token',access_token)
    let result = await common.getUserInfo(access_token,openId);
    console.log(result,'result============')
    res.json(result)
})

module.exports = router;
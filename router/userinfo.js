// 导入 express
const express = require('express')
// 创建路由对象
const router = express.Router()
const userInfoHandler = require('../router_handler/userinfo')
// 获取用户的基本信息
router.get('/userinfo', userInfoHandler.getUserInfo)

// 向外共享路由对象
module.exports = router

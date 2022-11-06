// 导入 express 模块
const express = require('express')
// 创建 express 的服务器实例
const app = express()
// write your code here...
const cors = require('cors')
const useRouter = require('./router/user')
const joi = require('joi')
// 导入配置文件
const config = require('./schema/config')

// 解析 token 的中间件
const expressJWT = require('express-jwt')
// 导入并使用用户信息路由模块
const userinfoRouter = require('./router/userinfo')
app.use(
  expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/api\//] })
)

app.use(cors())

// 响应数据的中间件
app.use(express.urlencoded({ extended: false }))

app.use((req, res, next) => {
  // status = 0 为成功； status = 1 为失败； 默认将 status 的值设置为 1，方便处理失败的情况
  res.cc = function (err, status = 1) {
    res.send({
      // 状态
      status,
      // 状态描述，判断 err 是 错误对象 还是 字符串
      message: err instanceof Error ? err.message : err,
    })
  }
  console.log(res.cc())
  next()
})

app.use(express.urlencoded({ extended: false }))
app.use('/api', useRouter)
// 注意：以 /my 开头的接口，都是有权限的接口，需要进行 Token 身份认证
app.use('/my', userinfoRouter)

app.use((err, req, res, next) => {
  console.log(res.cc())
  if (err instanceof joi.ValidationError) {
    return res.cc(err)
  }
  if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
  res.cc(err)
})
// 调用 app.listen 方法，指定端口号并启动web服务器
app.listen(3007, function () {
  console.log('api server running at http://127.0.0.1:3007')
})

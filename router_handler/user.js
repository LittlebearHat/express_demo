const db = require('../db/index')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../schema/config')
exports.register = (req, res) => {
  // 接收表单数据
  const userinfo = req.body
  // 判断数据是否合法
  if (!userinfo.username || !userinfo.password) {
    return res.cc(err)
  }
  const sql = `select * from ev_users where username=?`
  db.query(sql, [userinfo.username], function (err, results) {
    // 执行 SQL 语句失败
    if (err) {
      return res.cc(err)
    }
    // 用户名被占用
    if (results.length > 0) {
      return res.cc('用户名已被占用')
    }
    userinfo.password = bcrypt.hashSync(userinfo.password, 10)
    console.log(userinfo.password)
    const sql = 'insert into ev_users set ?'
    db.query(
      sql,
      { username: userinfo.username, password: userinfo.password },
      function (err, results) {
        // 执行 SQL 语句失败
        if (err) return res.cc()
        // SQL 语句执行成功，但影响行数不为 1
        if (results.affectedRows !== 1) {
          return res.cc('注册用户失败')
        }
        // 注册成功
        res.send({ status: 0, message: '注册成功！' })
      }
    )
  })
}
exports.login = (req, res) => {
  const userinfo = req.body
  const sql = `select * from ev_users where username=?`
  db.query(sql, userinfo.username, function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    // 执行 SQL 语句成功，但是查询到数据条数不等于 1
    if (results.length !== 1) return res.cc('账号或者密码错误！')
    // TODO：判断用户输入的登录密码是否和数据库中的密码一致

    // 拿着用户输入的密码,和数据库中存储的密码进行对比
    console.log(results)
    const compareResult = bcrypt.compareSync(
      userinfo.password,
      results[0].password
    )

    // 如果对比的结果等于 false, 则证明用户输入的密码错误
    if (!compareResult) {
      return res.cc('密码错误！')
    }
    // 剔除完毕之后，user 中只保留了用户的 id, username, nickname, email 这四个属性的值
    const user = { ...results[0], password: '', user_pic: '' }
    // 生成 Token 字符串
    const tokenStr = jwt.sign(user, config.jwtSecretKey, {
      expiresIn: '10h', // token 有效期为 10 个小时
    })
    res.send({
      status: 0,
      message: '登录成功！',
      // 为了方便客户端使用 Token，在服务器端直接拼接上 Bearer 的前缀
      token: 'Bearer ' + tokenStr,
    })
  })
}

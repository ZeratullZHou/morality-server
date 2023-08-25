const router = require('koa-router')();
const User = require('./user');
const Rule = require('./rule');

// 路由前缀
router.prefix('/api')

// 注册
User(router);
Rule(router);

module.exports = router;

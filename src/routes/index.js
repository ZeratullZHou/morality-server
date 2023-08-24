const router = require('koa-router')();

const { addUser, deleteUser } = require('../controller');

router.post('/add-user', addUser);

router.delete('/delete-user', deleteUser);

module.exports = router;

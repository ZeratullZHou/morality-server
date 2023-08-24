const router = require('koa-router')();

const { addUser, deleteUser, setUserScore, selectUser } = require('../controller');

router.post('/add-user', addUser);

router.delete('/delete-user', deleteUser);

router.put('/set-score', setUserScore);

router.get('/get-userinfo', selectUser);

module.exports = router;

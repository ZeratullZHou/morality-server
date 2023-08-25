const { addRule, getRule } = require('../controller');

module.exports = function User(router) {
    router.post('/add-rule', addRule);

    router.get('/get-rule', getRule);

    // router.delete('/delete-user', deleteUser);
    //
    // router.put('/set-score', setUserScore);
    //
    // router.get('/get-userinfo', selectUser);
};

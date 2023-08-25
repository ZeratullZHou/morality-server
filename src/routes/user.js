const { addUser, deleteUser, setUserScore, selectUser } = require('../controller');

module.exports = function User(router) {
    router.post('/add-user', addUser);

    router.delete('/delete-user', deleteUser);

    router.put('/set-score', setUserScore);

    router.get('/get-userinfo', selectUser);
};

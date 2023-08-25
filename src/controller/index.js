const userController = require('./user');
const ruleController = require('./rule');

module.exports = {
    ...userController,
    ...ruleController
};

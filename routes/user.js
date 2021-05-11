const express = require('express')

const userController = require('../controllers/user')
const loginRequired = require('../middleware/loginRequired')
const validation = require('../middleware/validation')

const router = express.Router()

router.post('/login', validation.phoneNumber('phoneNumber').exec(), userController.login)
router.post('/signup', validation.phoneNumber('phoneNumber').string('name').exec(), userController.signup)
//router.get('/find-user/:userName', userController.findUser)
router.post('/get-registered-users-from-contacts', loginRequired, validation.array('contacts').exec(), userController.getRegisteredUsersFromContacts)
router.post('/set-socket-connection-data', loginRequired, validation.phoneNumber('phoneNumber').string('socketID').exec(), userController.setSocketConnectionData)
router.post('/disconnect-socket', loginRequired, validation.phoneNumber('phoneNumber').exec(), userController.disConnectSocket)
router.post('/check-online-contacts', loginRequired, userController.checkOnlineContacts)


module.exports = router
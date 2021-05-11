const express = require('express')

const userController = require('../controllers/user')
const loginRequired = require('../middleware/loginRequired')

const router = express.Router()

router.post('/login', userController.login)
router.post('/signup', userController.signup)
//router.get('/find-user/:userName', userController.findUser)
router.post('/get-registered-users-from-contacts', loginRequired, userController.getRegisteredUsersFromContacts)
router.post('/set-socket-connection-data', loginRequired, userController.setSocketConnectionData)
router.post('/disconnect-socket', loginRequired, userController.disConnectSocket)
router.post('/check-online-contacts', loginRequired, userController.checkOnlineContacts)


module.exports = router
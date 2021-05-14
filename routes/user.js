const express = require('express')

const userController = require('../controllers/user')
const loginRequired = require('../middleware/loginRequired')
const { body } = require('express-validator');

const router = express.Router()

router.post(
    '/login',
    body('phoneNumber').isMobilePhone('any'),
    userController.login
)
router.post(
    '/signup',
    body('phoneNumber').isMobilePhone('any'),
    body('name').isLength({min: 1}),
    body('contactsPhoneNumbers').isArray(),
    userController.signup
)
//router.get('/find-user/:userName', userController.findUser)
router.post(
    '/get-registered-users-from-contacts',
    loginRequired,
    body('contacts').isArray(),
    userController.getRegisteredUsersFromContacts
)
router.post(
    '/set-socket-connection-data',
    loginRequired,
    body('phoneNumber').isMobilePhone('any'),
    body('socketID').isLength({min: 8}),
    userController.setSocketConnectionData
)
router.post(
    '/disconnect-socket',
    loginRequired,
    body('phoneNumber').isMobilePhone('any'),
    userController.disConnectSocket
)
router.post(
    '/check-contact-status',
    loginRequired,
    body('phoneNumber').isMobilePhone('any'),
    userController.checkContactStatus
)


module.exports = router
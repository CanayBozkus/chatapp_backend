const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization')

    if(!authHeader){
        return res.json({
            success: false,
            message: "Login Required",
        })
    }

    const token = authHeader.split(' ')[1]
    let decodedToken

    try{
        decodedToken = jwt.verify(token, 'chatappsecretkey')
    }

    catch(e){
        return res.json({
            success: false,
            message: 'Invalid token',
        })
    }

    req.userId = decodedToken.id
    req.userPhoneNumber = decodedToken.phone
    next()
}
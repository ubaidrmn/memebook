const jwt = require('jsonwebtoken');
const SECRET = 'secret';

function generate_jwt(payload) {
    const token = jwt.sign({data:payload,exp: Math.floor(Date.now() / 1000) + (60 * 60)}, SECRET);
    return token
}

function verify_jwt(token) {
    try {
        return jwt.verify(token, SECRET, function(err, decoded) {
            if(err) {
                return {data:null,verified:false}      
            } else {
                return {data:decoded,verified:true}
            }
        });
    } catch (err) {
        return {data:null,verified:false}
    }
}

module.exports = {
    generate_jwt:generate_jwt,
    verify_jwt:verify_jwt
}
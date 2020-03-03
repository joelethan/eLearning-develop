const validator = require('validator')
const isEmpty = require('./is-empty')

module.exports = validateResetPasswordInput = data => {
    let errors = {};

    data.password = !isEmpty(data.password) ? data.password : ''
    data.password2 = !isEmpty(data.password2) ? data.password2 : ''


    if(validator.isEmpty(data.password)){
        errors.password = 'Password field is required'
    }
    if(!validator.equals(data.password, data.password2)){
        errors.password2 = 'Passwords must match'
    }
    if(validator.isEmpty(data.password2)){
        errors.password2 = 'Confirm Password field is required'
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}

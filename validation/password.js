const validator = require('validator')
const isEmpty = require('./is-empty')

module.exports = validatePasswordInput = data => {
    let errors = {};

    data.old_password = !isEmpty(data.old_password) ? data.old_password : ''
    data.password = !isEmpty(data.password) ? data.password : ''
    data.password2 = !isEmpty(data.password2) ? data.password2 : ''


    if(validator.equals(data.password, data.old_password)){
        errors.old_password = 'Current and New passwords must be different'
    }
    if(validator.isEmpty(data.old_password)){
        errors.old_password = 'Current Password field is required'
    }
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

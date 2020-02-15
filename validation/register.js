const validator = require('validator')
const isEmpty = require('./is-empty')

module.exports = validateRegisterInput = data => {
    let errors = {};

    data.email = !isEmpty(data.email) ? data.email : ''
    data.password = !isEmpty(data.password) ? data.password : ''
    data.password2 = !isEmpty(data.password2) ? data.password2 : ''

    if(!validator.isEmail(data.email)){
        errors.email = 'Email is Invalid'
    }
    if(validator.isEmpty(data.email)){
        errors.email = 'Email field is required'
    }
    if(!validator.isLength(data.password, { min:6, max:30 })){
        errors.password = 'Password must have between 6 and 30 characters'
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

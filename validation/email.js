const validator = require('validator')
const isEmpty = require('./is-empty')

module.exports = validateEmail = data => {
    let errors = {};

    data.email = !isEmpty(data.email) ? data.email : ''

    if(!validator.isEmail(data.email)){
        errors.email = 'Email is Invalid'
    }
    if(validator.isEmpty(data.email)){
        errors.email = 'Email field is required'
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}

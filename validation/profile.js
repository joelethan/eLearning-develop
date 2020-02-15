const validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = validateProfileInput = data => {
    let errors = {};

    data.first_name = !isEmpty(data.first_name) ? data.first_name : '';
    data.last_name = !isEmpty(data.last_name) ? data.last_name : '';


    if(!validator.isLength(data.first_name, { min:3, max:30 })){
        errors.first_name = 'First name must have between 3 and 30 characters'
    }
    if(!validator.isLength(data.last_name, { min:3, max:30 })){
        errors.last_name = 'Last name must have between 3 and 30 characters'
    }
    if(validator.isEmpty(data.first_name)){
        errors.first_name = 'First name field is required';
    }
    if(validator.isEmpty(data.last_name)){
        errors.last_name = 'Last name field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}

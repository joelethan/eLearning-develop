import { isEmpty as _isEmpty, equals } from "validator";
import isEmpty from "./is-empty";

const validateResetPasswordInput = data => {
  let errors = {};

  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";

  if (_isEmpty(data.password)) {
    errors.password = "Password field is required";
  }
  if (!equals(data.password, data.password2)) {
    errors.password2 = "Passwords must match";
  }
  if (_isEmpty(data.password2)) {
    errors.password2 = "Confirm Password field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

export default validateResetPasswordInput;

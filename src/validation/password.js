import { equals, isEmpty as _isEmpty } from "validator";
import isEmpty from "./is-empty";

const validatePasswordInput = data => {
  let errors = {};

  data.old_password = !isEmpty(data.old_password) ? data.old_password : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";

  if (equals(data.password, data.old_password)) {
    errors.old_password = "Current and New passwords must be different";
  }
  if (_isEmpty(data.old_password)) {
    errors.old_password = "Current Password field is required";
  }
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

export default validatePasswordInput;

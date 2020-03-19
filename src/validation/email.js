import { isEmail, isEmpty as _isEmpty } from "validator";
import isEmpty from "./is-empty";

const validateEmail = data => {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : "";

  if (!isEmail(data.email)) {
    errors.email = "Email is Invalid";
  }
  if (_isEmpty(data.email)) {
    errors.email = "Email field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

export default validateEmail;

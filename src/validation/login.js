import { isEmpty as _isEmpty } from "validator";
import isEmpty from "./is-empty";

const validateLoginInput = data => {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  if (_isEmpty(data.email)) {
    errors.email = "Email field is required";
  }
  if (_isEmpty(data.password)) {
    errors.password = "Password field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

export default validateLoginInput;

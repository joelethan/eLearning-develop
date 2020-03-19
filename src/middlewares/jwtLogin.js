import { isLoggedIn } from "./isLoggedIn";
export const jwtLogin = () => {
  return isLoggedIn("jwt");
};

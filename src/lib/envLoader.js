import dotenv from "dotenv";
import { testEnv } from "../constants/test_env";

export const load = () => {
  if (process.env.NODE_ENV === "test") {
    for (let k in testEnv) {
      process.env[k] = testEnv[k];
    }
    return;
  }
  return dotenv.config();
};

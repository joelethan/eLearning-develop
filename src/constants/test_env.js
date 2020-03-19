export const testEnv = {
  PORT: 3000,
  AUTH_BD: "mongodb://127.0.0.1:27017",
  MAIL_USER: "email@gmail.com",
  MAIL_PASS: "password",
  googleclientID: "xxxxxx.apps.googleusercontent.com",
  googleclientSecret: "7G6fDW4ilaVxxxjt2XimBf10d20A",
  facebookclientID: "589447681520864",
  facebookclientSecret: "bffff0f7c7fd08bd4c3cc6fsd7b8ae89777517",
  linkedinclientID: "788pwdt4ddlp89ddddd7kg",
  linkedinclientSecret: "3tPejesVEclcdkdks7jKPuYP",
  OAuthPassword: "OAuthPassword",
  CORSwhitelist: "http://example1.com,http://example2.com"
};
export const replaceVal = (old, separator, joiner) => {
  return(old.toString().split(separator).join(joiner));
}

export class Documentation {
  constructor(app) {
    this.app = app;
    this.test = this.checkEnv();
  }
  checkEnv() {
    if (process.env.NODE_ENV === "test") {
      this.generator = require("express-oas-generator");
      return true;
    }
  }

  processResponse() {
    if (this.test) {
      this.generator.handleResponses(this.app, {
        predefinedSpec: spec => {
          return spec;
        },
        specOutputPath: "src/apiSpec.json"
      });
    }
  }
  processRequest() {
    if (this.test) {
      return this.generator.handleRequests();
    }
  }
}

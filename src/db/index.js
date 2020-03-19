import mongoose from "mongoose";
import app from "../server";
import { loadEnv } from "../lib";

loadEnv();

const DB_URI = process.env.AUTH_BD;
const PORT = process.env.PORT || 5000;

const connect = () => {
  /* istanbul ignore else */
  if (process.env.NODE_ENV === "test") {
    const mocker = require("mockgoose");
    const mockgoose = new mocker.Mockgoose(mongoose);

    mockgoose.prepareStorage().then(() => {
      mongoose
        .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
          app.listen(PORT, () => {
            console.log("Listening on port: " + PORT);
          });
          console.log("MongoDB Connected");
        })
        .catch(
          /* istanbul ignore next */
          err => console.log(err)
        );
    });
  } else {
    mongoose
      .connect(DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      })
      .then(() => {
        app.listen(PORT, () => {
          console.log("Listening on port: " + PORT);
        });
        console.log("MongoDB Connected");
      })
      .catch(err => console.log(err));
  }
};

export const close = () => {
  return mongoose.disconnect();
};

export default connect;

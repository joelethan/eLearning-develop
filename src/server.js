import express from "express";
import { urlencoded, json } from "body-parser";
import passport from "passport";
import cors from "cors";
import routes from "./routes";
import passportConfig from "./config/passport";

import { Documentation, loadEnv } from "./lib";
// load .env file
loadEnv();

const app = express();

// generate documentation
const docs = new Documentation(app);
docs.processResponse();

var whitelist = process.env.CORSwhitelist
  ? process.env.CORSwhitelist.split(",")
  : "";

var corsOptionsDelegate = (req, callback) => {
  var corsOptions;
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};

// Body parser middleware
app.use(urlencoded({ extended: false }));
app.use(json());

// Browser Middleware
app.use(function(req, res, next) {
  req.browser = req.headers["user-agent"];
  next();
});

// Passport middleware
app.use(passport.initialize());

// CORS middleware
app.use(cors(corsOptionsDelegate));

// Passport Config
passportConfig(passport);

app.get("/", (req, res) => res.json({ msg: "Hello world2!!" }));

// Use routes
app.use("/api/user", routes.userRoutes);

//  Documentation routes
app.use(routes.documentationRoutes);

docs.processRequest();

export default app;

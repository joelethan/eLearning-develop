import bcrypt from "bcryptjs";
import { verify, sign } from "jsonwebtoken";
import { AES, enc } from "crypto-js";
import User from "../db/models/User";

import saveUser from "./saveUser";
import loginUser from "./loginUser";
import Emailer from "../services/sendMail";
import validateRegisterInput from "../validation/register";
import validatePasswordInput from "../validation/password";
import validateLoginInput from "../validation/login";
import validateProfileInput from "../validation/profile";
import validateEmail from "../validation/email";
import validateResetPasswordInput from "../validation/resetpassword";
import { replaceVal } from "../constants/test_env";

const secretOrKey = process.env.secretOrKey || "key";

export const registerUser = (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    }
    const newUser = new User({
      email: req.body.email,
      password: req.body.password
    });
    sign(
      { email: newUser.email },
      secretOrKey,
      { expiresIn: "1d" },
      (er, emailToken) => {
        const token_ = AES.encrypt(emailToken, secretOrKey).toString();
        const link = `${process.env.frontendUrl}/confirmEmail/?token=${replaceVal(replaceVal(token_, '/', 'Por21Ld'), '+', 'xMl3Jk')}`;
        Emailer(newUser.email, link, 'confirm');
      }
    );
    saveUser(newUser, res);
  });
};

export const confirmEmail = (req, res) => {
  const token = AES.decrypt(replaceVal(replaceVal(req.params.emailToken, 'xMl3Jk', '+'), 'Por21Ld', '/'), secretOrKey).toString(enc.Utf8)
  verify(token, secretOrKey, (err, decoded) => {
    if (err) {
      return res
        .status(400)
        .json({ email: "Token is expired or corrupted, request another one" });
    }
    User.findOne({ email: decoded.email }).then(user => {
      if (!user) {
        return res.status(400).json({ email: "User not found, Register user" });
      } else if (user.IsAuthenticated) {
        return res.status(400).json({ email: "Email already verified" });
      } else {
        user.IsAuthenticated = true;
        user.save().then(() => {
          return res.json({ email: "Email verified" });
        });
      }
    });
  });
};

const refreshTokens = {};
export const login = (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const password = req.body.password;
  const email = req.body.email;
  User.findOne({ email }).then(user => {
    const errors = {};
    // Check for user
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    } else if (!user.IsAuthenticated) {
      errors.email = "Email not verified";
      return res.status(400).json(errors);
    }
    let refreshToken='';
    // check passsword
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        if (Object.keys(refreshTokens).length === 0) {
          refreshToken = sign({ email }, secretOrKey, { expiresIn: '20d' });
          refreshTokens[refreshToken] = email;
        } else {
        for (const key in refreshTokens) {
          if (refreshTokens[key] == email) {
            verify(key, secretOrKey, (er, decoded)=>{
              if (decoded && !er) {
                refreshToken = key
              } else {
                refreshToken = sign({ email }, secretOrKey, { expiresIn: '20d' });
                refreshTokens[refreshToken] = refreshTokens[key]
                delete refreshTokens[key];
              }
            })
          }
        }}
        loginUser(user, req, res, refreshToken);
      } else {
        errors.password = "Password incorrent";
        return res.status(400).json(errors);
      }
    });
  });
};

export const LoginRefreshToken = (req, res) => {
  const email = req.body.email;
  const refreshToken = req.headers['refreshtoken'];
  
  if((refreshToken in refreshTokens) && (refreshTokens[refreshToken] === email)) {
    verify(refreshToken, secretOrKey, (er, decoded)=>{
      if (!decoded || er) {
        return res.sendStatus(401)
      }
      User.findOne({ email }).then(user => {
        loginUser(user, req, res, refreshToken);
      })
    })
  } else {
    return res.sendStatus(401)
  }
}

export const searchUser = (req, res) => {
  const userDisplay = [];
  delete req.query.ip;
  // Search query in the User model
  User.find({ ...req.query })
    .then(users => {
      for (const user of users) {
        userDisplay.push({
          id: user._id,
          IsAuthenticated: user.IsAuthenticated,
          status: user.status,
          email: user.email,
          first_name: user.first_name,
          register_date: user.register_date,
          last_name: user.last_name,
          activity_data: user.activity_data
        });
      }
      res.json(userDisplay);
    })
    .catch(err => {
      console.log(err);
      res.json({ error: "An error occured" });
    });
};

export const checkPrivilege = (req, res) => {
  User.findById(req.params.id)
    .then(user => {
      res.json({
        IsSuperAdmin: user.IsSuperAdmin
      });
    })
    .catch(() => {
      res.status(401).json({ error: "User not found" });
    });
};

export const getProfile = (req, res) => {
  res.json({
    id: req.user._id,
    email: req.user.email,
    first_name: req.user.first_name,
    last_name: req.user.last_name
  });
};

export const updateProfile = (req, res) => {
  const { errors, isValid } = validateProfileInput(req.body);
  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const email = { email: req.user.email };
  const profile = { first_name, last_name };
  User.findOneAndUpdate(email, profile, { new: true }).then(user => {
    res.json({
      id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      message: "Profile successfully updated"
    });
  });
};

export const updatePassword = (req, res) => {
  const { errors, isValid } = validatePasswordInput(req.body);
  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const password = req.body.password;
  const old_password = req.body.old_password;
  const user = req.user;
  // check passsword
  bcrypt.compare(old_password, user.password).then(isMatch => {
    const errors = {};
    if (isMatch) {
      user.password = password;
      saveUser(user, res);
      res.json({ message: "Password changed successfully" });
    } else {
      errors.password = "Enter correct current password";
      return res.status(400).json(errors);
    }
  });
};

export const resetPassword = (req, res) => {
  const { errors, isValid } = validateEmail(req.body);
  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const { email } = req.body;
  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    }
    sign({ email }, secretOrKey, { expiresIn: "1d" }, (er, resetToken) => {
      const link = `${process.env.frontendUrl}/passwordreset/${AES.encrypt(resetToken, secretOrKey).toString().split('/').join('Por21Ld')}`;
      Emailer(email, link, 'recover');
    });
    res.json({ message: "A password reset link has been sent to your email" });
  });
};

export const resetPasswordConfirm = (req, res) => {
  const { errors, isValid } = validateResetPasswordInput(req.body);
  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const token = AES.decrypt(req.params.resetToken.split('Por21Ld').join('/'), secretOrKey).toString(enc.Utf8)
  
  verify(token, secretOrKey, (err, decoded) => {
    if (err) {
      return res
        .status(400)
        .json({ email: "Token is expired or corrupted, request another one" });
    }
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.password, salt, (err, hash) => {
        const email = decoded.email;
        const password = hash;
        User.findOne({ email }).then(user => {
          if (!user) {
            errors.email = "User not found";
            return res.status(404).json(errors);
          }
          user.password = hash;
          user.save();
        });
        res.json({ message: "Password successfully updated" });
      });
    });
  });
};

export const getActivity = (req, res) => {
  res.json({
    activity: req.user.activity_data
  });
};

export const googleLogin = (req, res) => {
  if (req.user.provider) {
    // User with no account yet
    const email = req.user.emails[0].value;
    const password = process.env.OAuthPassword;
    const newUser = new User({
      email,
      password
    });
    newUser.IsAuthenticated = true;
    newUser.save().then(() => {
      User.findOne({ email }).then(user => {
        loginUser(user, req, res);
      });
    });
  } else {
    // Already registered user
    const email = req.user.email;
    User.findOne({ email }).then(user => {
      loginUser(user, req, res);
    });
  }
};

export const facebookLogin = (req, res) => {
  if (req.user.provider) {
    // User with no account yet
    const email = req.user.emails[0].value;
    const password = process.env.OAuthPassword;
    const newUser = new User({
      email,
      password
    });
    newUser.IsAuthenticated = true;
    newUser.save().then(() => {
      User.findOne({ email }).then(user => {
        loginUser(user, req, res);
      });
    });
  } else {
    // Already registered user
    const email = req.user.email;
    User.findOne({ email }).then(user => {
      loginUser(user, req, res);
    });
  }
};

export const linkedInLogin = (req, res) => {
  const email = req.query.profile.email;
  User.findOne({ email }).then(user => {
    if (!user) {
      // User with no account yet
      const password = process.env.OAuthPassword;
      const newUser = new User({
        email,
        password
      });
      newUser.IsAuthenticated = true;
      newUser.save().then(() => {
        User.findOne({ email }).then(user => {
          loginUser(user, req, res);
        });
      });
    } else {
      // Already registered user
      User.findOne({ email }).then(user => {
        loginUser(user, req, res);
      });
    }
  });
};

import fetch from "node-fetch";

export const linkedInMiddleware = (req, res, next) => {
  let access_token = req.query.access_token;
  fetch("https://api.linkedin.com/v2/me", {
    headers: { Authorization: `Bearer ${access_token}` }
  })
    .then(resp => resp.json())
    .then(user => {
      if (!user.id) {
        res.json({ Error: "Invalid access token" });
        return next();
      }
      fetch(
        "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
        {
          headers: { Authorization: `Bearer ${access_token}` }
        }
      )
        .then(resp => resp.json())
        .then(data => {
          req.query.profile = {
            email: JSON.stringify(data.elements[0]).split('"')[5],
            firstName: user.firstName.localized.en_US,
            lastName: user.lastName.localized.en_US
          };
          return next();
        });
    });
};

const bcrypt = require('bcryptjs');

const saveUser = (newUser, res) => {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            newUser.password = hash;
            newUser.save()
                .then(user => {
                    res.json({
                        _id: user._id,
                        IsAuthenticated: user.IsAuthenticated,
                        email: user.email,
                        register_date: user.register_date,
                    });
                });
        });
    });
}

module.exports = saveUser;

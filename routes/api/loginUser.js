const jwt = require('jsonwebtoken');
const iplocation = require("iplocation").default;


const secretOrKey = process.env.secretOrKey || 'key';

const loginUser = (user, req, res) => {
    if(!req.headers['x-userip']){
        return res.send('Ip address not set')
    }
    const activity = {};
    const payload = {id: user.id, email: user.email}

    jwt.sign(payload, secretOrKey, { expiresIn: '1d' }, (er, token)=>{
        iplocation(req.headers['x-userip'])
            .then(resp=>{
                activity.location = resp.city;
                activity.browser = req.browser
                user.activity_data = []
                user.activity_data.unshift(activity)
                user.save()
                    .then(()=>{
                        res.json({
                            _id: user._id,
                            IsAuthenticated: user.IsAuthenticated,
                            email: user.email,
                            register_date: user.register_date,
                            activity_data: user.activity_data,
                            token: 'Bearer ' + token
                        })
                    })
            })
    })
}

module.exports = loginUser;

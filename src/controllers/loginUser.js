import { sign } from 'jsonwebtoken';
import iplocation from "iplocation";


const secretOrKey = process.env.secretOrKey || 'key';

const loginUser = (user, req, res, refreshtoken) => {
    if(!req.headers['x-forwarded-for']){
        return res.status(400).json({error: 'Ip address not set'})
    }
    const activity = {};
    const payload = {id: user.id, email: user.email}

    sign(payload, secretOrKey, { expiresIn: '1d' }, (er, token)=>{
        iplocation(req.headers['x-forwarded-for'].split(',')[0])
            .then(resp=>{
                activity.location = resp.city;
                activity.browser = req.browser
                user.activity_data = []
                user.activity_data.unshift(activity)
                user.save()
                    .then(()=>{
                        res.json({
                            user,
                            token: 'Bearer ' + token,
                            refreshtoken
                        })
                    })
            })
    })
}

export default loginUser;

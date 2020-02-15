const mongoose = require('mongoose');
const app = require('../server');

require('dotenv').config()

const DB_URI = process.env.AUTH_BD;
const PORT = process.env.PORT || 5000;

function connect() {
    console.log(DB_URI);
    /* istanbul ignore else */
    if (process.env.NODE_ENV === 'test') {
        const Mockgoose = require('mockgoose').Mockgoose;
        const mockgoose = new Mockgoose(mongoose);
        
        mockgoose.prepareStorage()
            .then(() => {
                mongoose.connect(DB_URI,
                    { useNewUrlParser: true, useUnifiedTopology: true })
                        .then(() => {
                            app.listen(PORT, () => {
                                console.log('Listening on port: ' + PORT);
                            });
                            console.log('MongoDB Connected')
                        })
                        .catch(/* istanbul ignore next */
                            err => console.log(err))
            })
    } else {
        mongoose.connect(DB_URI,
            { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
                .then(() => {
                    app.listen(PORT, () => {
                        console.log('Listening on port: ' + PORT);
                    });
                    console.log('MongoDB Connected')
                })
                .catch(err => console.log(err))
    }
}

function close() {
  return mongoose.disconnect();
}

module.exports = { connect, close };

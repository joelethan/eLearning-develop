process.env.NODE_ENV = 'test';
process.env.PORT = 5002;

const expect = require('chai').expect;
const bcrypt = require('bcryptjs');
const request = require('supertest');

const app = require('../server');
const conn = require('../db');
const User = require('../db/models/User')

describe('USER /api/user/', ()=>{
    const userData = {
        email: "joelethan2@gmail.com",
        password: "password",
        password2: "password"
    }
    const newUser = new User({
        email: "joelethan@gmail.com",
        password: "password"
    });

    before((done) => {
        conn.connect();
        done();
    })

    after((done) => {
        conn.close();
        done();
    })

    it('OK, test root endpoint', (done) => {
        request(app).get('/')
            .then(res => {
                const { body } = res;
                expect(body).to.contain.property('msg');
                done();
            })
    })

    it('OK, test root endpoint', (done) => {
        request(app).get('/api/user')
            .then(res => {
                const { body } = res;
                expect(body).to.contain.property('msg');
                done();
            })
    })

    it('OK, test user register', (done) => {
        request(app).post('/api/user/register')
            .send(userData)
            .then(res => {
                const { body } = res;
                expect(body).to.contain.property('_id');
                expect(body).to.contain.property('email');
                expect(body).to.contain.property('register_date');
                done();
            })
    })

    it('FAIL, user register, no data', (done) => {
        request(app).post('/api/user/register')
            .send({})
            .then(res => {
                const { body } = res;
                expect(body).to.contain.property('email');
                done();
            })
    })

    it('FAIL, user login, ', (done) => {
        request(app).post('/api/user/register')
            .send(userData)
            .then(() => {
                request(app).post('/api/user/login')
                    .send({
                        email: "joelethan2@gmail.com",
                        password: "password"
                    })
                    .then(res => {
                        const { body } = res;
                        expect(body).to.contain.property('email');
                        done();
                    })
            })
    })

    it('FAIL, user login, password mismatch', (done) => {
        userData.password2 = 'pass';
        request(app).post('/api/user/register')
            .send(userData)
            .then(res => {
                const { body } = res;
                expect(body).to.contain.property('password2');
                done();
            })
    })

    it('FAIL, user login, missing credentials', (done) => {
        request(app).post('/api/user/register')
            .send(userData)
            .then(() => {
                request(app).post('/api/user/login')
                    .send({})
                    .then(res => {
                        const { body } = res;
                        expect(body).to.contain.property('email');
                        expect(body).to.contain.property('password');
                        done();
                    })
            })
    })

    it('OK, user login', (done) => {
        newUser.IsAuthenticated = true;
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                newUser.password = hash;
                newUser.save()
                request(app).post('/api/user/login')
                    .send({
                        email: "joelethan@gmail.com",
                        password: "password"})
                    .then(res => {
                        const { body } = res;
                        expect(body).to.contain.property('token');
                        done();
                    })
            });
        });
    })

    it('FAIL, user login, wrong password', (done) => {
        newUser.IsAuthenticated = true;
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                newUser.password = hash;
                newUser.save()
                request(app).post('/api/user/login')
                    .send({
                        email: "joelethan@gmail.com",
                        password: "passwordx"})
                    .then(res => {
                        const { body } = res;
                        expect(body).to.contain.property('password');
                        done();
                    })
            });
        });
    })

    it('FAIL, user login, user not found', (done) => {
        request(app).post('/api/user/login')
            .send({
                email: "joelethanx@gmail.com",
                password: "password"})
            .then(res => {
                const { body } = res;
                expect(body).to.contain.property('email');
                done();
            })
    })
})

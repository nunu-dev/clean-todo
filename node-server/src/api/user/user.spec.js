// for test
const should = require('should');
const request = require('supertest');
const app = require('../../../app');

// message
const message = require('../../common/message');

// model
const commonModels = require('../../common/models');
const userModels = require('../user/user.model');

describe('GET /users는 ', () => {
  const users = [
    {
      userId: 'testUser',
      password: 'test123'
    }
  ];
  before(() => commonModels.sequelize.sync({ force: true }));
  before(() => userModels.User.bulkCreate(users));
  describe('성공시', () => {
    let body;
    it('200을 리턴한다', done => {
      request(app)
        .get('/users')
        .end((err, res) => {
          res.status.should.be.equal(200);
          body = res.body;
          done();
        });
    });
    it('유저 배열을 리턴한다', done => {
      body.should.be.Array();
      body[0].should.have.property('userId');
      done();
    });
  });
});

describe('POST /users는 ', () => {
  let userId = 'testUser',
    password = 'test123',
    passwordValid = 'test123',
    body;
  describe('성공시 ', () => {
    before(() => commonModels.sequelize.sync({ force: true }));
    it('201을 리턴한다', done => {
      request(app)
        .post('/users')
        .send({ userId, password, passwordValid })
        .end((err, res) => {
          res.status.should.be.equal(201);
          body = res.body;
          done();
        });
    });
    it('유저 객체를 반환한다', () => {
      body.should.have.property('userId');
    });
  });
  describe('실패시 ', () => {
    before(() => commonModels.sequelize.sync({ force: true }));
    it('userId 파라미터가 없을경우 400 반환한다', done => {
      request(app)
        .post('/users')
        .send({ password, passwordValid })
        .end((err, res) => {
          res.status.should.be.equal(400);
          res.body.msg.should.be.equal(message.MSG_USERID_MISSING);
          done();
        });
    });
    it('password 파라미터가 없을경우 400 반환한다', done => {
      request(app)
        .post('/users')
        .send({ userId, passwordValid })
        .end((err, res) => {
          res.status.should.be.equal(400);
          res.body.msg.should.be.equal(message.MSG_PASSWORD_MISSING);
          done();
        });
    });
    it('passwordValid 파라미터가 없을경우 400 반환한다', done => {
      request(app)
        .post('/users')
        .send({ userId, password })
        .end((err, res) => {
          res.status.should.be.equal(400);
          res.body.msg.should.be.equal(message.MSG_PASSWORDVALID_MISSING);
          done();
        });
    });
    it('password가 다를경우 400 반환한다', done => {
      (password = 'test123'),
        (passwordValid = 'test456'),
        request(app)
          .post('/users')
          .send({ userId, password, passwordValid })
          .end((err, res) => {
            res.status.should.be.equal(400);
            res.body.msg.should.be.equal(message.MSG_PASSWORD_NOT_MATCHED);
            done();
          });
    });
  });
});

describe('POST Login 로직은', () => {
  const userId = 'loginTestUser';
  const password = 'test123';
  const users = [
    {
      userId,
      password
    }
  ];

  describe('성공시', () => {
    const authenticatedUser = request.agent(app);
    let body;
    before(() => commonModels.sequelize.sync({ force: true }));
    before(() => userModels.User.bulkCreate(users));
    it('로그인이 되면 200 ok와 메세지를 반환한다', done => {
      authenticatedUser
        .post('/users/login')
        .send({ userId, password })
        .end((err, res) => {
          res.status.should.be.equal(200);
          res.body.msg.should.be.equal(message.MSG_SUCCESS_LOGIN);
          done();
        });
    });
    it('유저 정보를 요청하면 유저를 반환한다', done => {
      authenticatedUser.get('/users/auth').end((err, res) => {
        res.status.should.be.equal(200);
        res.body.should.have.property('userId');
        done();
      });
    });
  });

  describe('실패시', () => {
    const authenticatedUser = request.agent(app);
    let body;
    const wrongUserId = 'wrong123';
    const wrongUserPassword = 'wrong123';
    before(() => commonModels.sequelize.sync({ force: true }));
    before(() => userModels.User.bulkCreate(users));
    it('userId 값이 같은 유저가 없으면 401 반환한다', done => {
      authenticatedUser
        .post('/users/login')
        .send({ userId: wrongUserId, password })
        .end((err, res) => {
          res.status.should.be.equal(401);
          done();
        });
    });
    it('패스워드가 틀리면 401 반환한다', done => {
      authenticatedUser
        .post('/users/login')
        .send({ userId, password: wrongUserPassword })
        .expect(401)
        .end((err, res) => {
          res.status.should.be.equal(401);
          done();
        });
    });
  });
});

// TODO: Logout

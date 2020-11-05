require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token;

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    test('returns trees', async () => {

      const expectation = [
        {
          id: 1,
          name: 'fir',
          hardness_factor: 5,
          hardwood: false,
          type: 'coniferous',
          owner_id: 1,
        },
        {
          id: 2,
          name: 'maple',
          hardness_factor: 8,
          hardwood: true,
          type: 'deciduous',
          owner_id: 1,
        },
        {
          id: 3,
          name: 'oak',
          hardness_factor: 10,
          hardwood: true,
          type: 'deciduous',
          owner_id: 1,
        },
        {
          id: 4,
          name: 'cedar',
          hardness_factor: 6,
          hardwood: false,
          type: 'coniferous',
          owner_id: 1,
        },
        {
          id: 5,
          name: 'spruce',
          hardness_factor: 4,
          hardwood: false,
          type: 'coniferous',
          owner_id: 1,
        },
        {
          id: 6,
          name: 'pine',
          hardness_factor: 5,
          hardwood: false,
          type: 'coniferous',
          owner_id: 1,
        },
        {
          id: 7,
          name: 'mahogany',
          hardness_factor: 7,
          hardwood: true,
          type: 'deciduous',
          owner_id: 1,
        },
        {
          id: 8,
          name: 'ebony',
          hardness_factor: 9,
          hardwood: true,
          type: 'deciduous',
          owner_id: 1,
        }
      ];


      const data = await fakeRequest(app)
        .get('/trees')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns a single tree', async () => {
      const expectation = {
        id: 1,
        name: 'fir',
        hardness_factor: 5,
        hardwood: false,
        type: 'coniferous',
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .get('/trees/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('adds a tree to the DB and returns it', async () => {
      const expectation = {
        id: 9,
        name: 'cherry',
        hardness_factor: 7,
        hardwood: true,
        type_id: 'deciduous',
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .post('/trees')
        .send({
          name: 'cherry',
          hardness_factor: 7,
          hardwood: true,
          type_id: 2,
          owner_id: 1
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const allTrees = await fakeRequest(app)
        .get('/trees')
        .expect('Content-Type', /json/)
        .expect(200);


      expect(data.body).toEqual(expectation);
      expect(allTrees.body.length).toEqual(9);
    });

    test('updates a single tree in the db', async () => {
      const expectation =
      {
        id: 1,
        name: 'Fir',
        hardness_factor: 5,
        hardwood: false,
        type: 'coniferous',
        owner_id: 1,
      }
        ;

      const data = await fakeRequest(app)
        .put('/trees/1')
        .send(expectation);
      await fakeRequest(app)
        .get('/trees/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('deletes a single tree from the db', async () => {
      const expectation = '';

      const deletedTree = await fakeRequest(app)
        .delete('/trees/1')
        .expect('Content-Type', /json/)
        .expect(200);

      const data = await fakeRequest(app)
        .get('/trees/')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(deletedTree.body).toEqual(expectation);
      expect(data.body.length).toEqual(8);
    });
  });
});

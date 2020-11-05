const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/trees', async (req, res) => {
  try {
    const data = await client.query('SELECT * from trees');

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

// we need all the types so we can make a types dropdown on the front end
app.get('/types', async (req, res) => {
  try {
    const data = await client.query('select * from types');

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/trees/:id', async (req, res) => {
  try {
    const treeId = req.params.id;

    const data = await client.query(`
        SELECT 
        trees.id
        trees.name
        trees.hardness_factor
        trees.type
        FROM trees 
        JOIN types
        on types.id = trees.type_id
        WHERE trees.id=$1 
    `, [treeId]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// we add a new post route with the path /trees
app.post('/trees/', async (req, res) => {
  try {
    // we get all the tree data from the POST body (i.e., from the form in react)
    const newName = req.body.name;
    const newHardnessFactor = req.body.hardness_factor;
    const newHardwood = req.body.hardwood;
    const newTypeId = req.body.type_id;
    const newOwnerId = req.body.owner_id;

    // use an insert statement to make a new tree
    const data = await client.query(`
      INSERT INTO trees (name, hardness_factor, hardwood, type_id, owner_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
      // use the weird $ syntax and this array to prevent SQL injection (i.e. Bobby "DROP TABLES")
      [newName, newHardnessFactor, newHardwood, newTypeId, newOwnerId]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/trees/:id', async (req, res) => {
  try {
    // we get all the tree data from the POST body (i.e., from the form in react)
    const newName = req.body.name;
    const newHardnessFactor = req.body.hardness_factor;
    const newHardwood = req.body.hardwood;
    const newType = req.body.type;
    const newOwnerId = req.body.owner_id;

    // use an insert statement to make a new tree
    const data = await client.query(`
      UPDATE trees
      SET name = $1, 
      hardness_factor = $2,
      hardwood = $3,
      type = $4,
      owner_id = $5
      WHERE trees.id = $6
      RETURNING *
    `,
      // use the weird $ syntax and this array to prevent SQL injection (i.e. Bobby "DROP TABLES")
      [newName, newHardnessFactor, newHardwood, newType, newOwnerId, req.params.id]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.delete('/trees/:id', async (req, res) => {
  try {
    const treeId = req.params.id;

    // use an insert statement to make a new tree
    const data = await client.query(`
      DELETE from trees 
      WHERE trees.id=$1
    `,
      // use the weird $ syntax and this array to prevent SQL injection (i.e. Bobby "DROP TABLES")
      [treeId]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;

const client = require('../lib/client');
// import our seed data:
const trees = require('./trees.js');
const types = require('./types.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
          [user.email, user.hash]);
      })
    );

    const user = users[0].rows[0];

    await Promise.all(
      types.map(item => {
        return client.query(`
                    INSERT INTO types (type)
                    VALUES ($1);
                    RETURNING *;
                `,
          [item.type]);
      })
    );

    await Promise.all(
      trees.map(tree => {
        return client.query(`
                    INSERT INTO trees (name, hardness_factor, hardwood, type_id, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
          [tree.name, tree.hardness_factor, tree.hardwood, tree.type_id, user.id]);
      })
    );


    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }

}

const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { STRING } = Sequelize;
const config = {
  logging: false,
};

if (process.env.LOGGING) {
  delete config.logging;
}
const conn = new Sequelize(
  process.env.DATABASE_URL || 'postgres://localhost/acme_db',
  config
);

const User = conn.define('user', {
  username: STRING,
  password: STRING,
});

const Note = conn.define('note', {
  text: STRING,
});

User.hasMany(Note);
Note.belongsTo(User);

User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

User.byToken = async (token) => {
  try {
    const { userId } = jwt.verify(token, process.env.JWT);
    const user = await User.findByPk(userId);
    if (user) {
      return user;
    }
    const error = Error('bad credentials');
    error.status = 401;

    throw error;
  } catch (ex) {
    const error = Error('bad credentials');
    error.status = 401;

    throw error;
  }
};

User.authenticate = async ({ username, password }) => {
  const user = await User.findOne({
    where: {
      username,
      // password,
    },
  });

  const ifTrue = await bcrypt.compare(password, user.password);

  if (ifTrue) {
    const token = jwt.sign({ userId: user.id }, process.env.JWT);
    return token;
    // return user;
  }
  // if (user) {
  // console.log(user);

  // console.log('here', token);

  // return user.id;
  // }

  const error = Error('bad credentials');
  error.status = 401;
  throw error;
};

const syncAndSeed = async () => {
  await conn.sync({ force: true });
  const credentials = [
    { username: 'lucy', password: 'lucy_pw' },
    { username: 'moe', password: 'moe_pw' },
    { username: 'larry', password: 'larry_pw' },
  ];
  const [lucy, moe, larry] = await Promise.all(
    credentials.map((credential) => User.create(credential))
  );
  const notes = [
    { text: 'hello world' },
    { text: 'reminder to buy groceries' },
    { text: 'reminder to do laundry' },
  ];
  const [note1, note2, note3] = await Promise.all(
    notes.map((note) => Note.create(note))
  );
  await lucy.setNotes(note1);
  await moe.setNotes([note2, note3]);
  return {
    users: {
      lucy,
      moe,
      larry,
    },
  };
};

module.exports = {
  syncAndSeed,
  models: {
    User,
    Note,
  },
};

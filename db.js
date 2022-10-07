const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken')
// const token = jwt.sign({ userId:  })



const { STRING } = Sequelize;
const config = {
  logging: false
};

if(process.env.LOGGING){
  delete config.logging;
}
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_db', config);

const User = conn.define('user', {
  username: STRING,
  password: STRING
});

User.byToken = async(token)=> {
  try {
    console.log(token, "before")
    const user = await User.findByPk(token);
    if(user){
        // console.log(token)
      return user;
    }
    const error = Error('bad credentials');
    error.status = 401;
    // console.log(token, "from err")
    throw error;
  }
  catch(ex){
    const error = Error('bad credentials');
    error.status = 401;
    // console.log(token, "from catch err")
    throw error;
  }
};

User.authenticate = async({ username, password })=> {
  const user = await User.findOne({
    where: {
      username,
      password
    }
  });
  if(user){
    console.log(user)
    const token = jwt.sign({ userId: user.id}, process.env.JWT)
    console.log(token)
    return token
  }
  const error = Error('bad credentials');
  error.status = 401;
  throw error;
};

const syncAndSeed = async()=> {
  await conn.sync({ force: true });
  const credentials = [
    { username: 'lucy', password: 'lucy_pw'},
    { username: 'moe', password: 'moe_pw'},
    { username: 'larry', password: 'larry_pw'}
  ];
  const [lucy, moe, larry] = await Promise.all(
    credentials.map( credential => User.create(credential))
  );
  return {
    users: {
      lucy,
      moe,
      larry
    }
  };
};

module.exports = {
  syncAndSeed,
  models: {
    User
  }
};
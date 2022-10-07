const express = require('express');
const app = express();
const { models: { User }} = require('./db');
const path = require('path');
// const token = require('jsonwebtoken')
const dotenv = require('dotenv').config()
// middleware
app.use(express.json());
console.log("this is the env",process.env.JWT)
// routes
app.get('/', (req, res)=> res.sendFile(path.join(__dirname, 'index.html')));

app.post('/api/auth', async(req, res, next)=> {
  try {
    res.send({ token: await User.authenticate(req.body)});
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/auth', async(req, res, next)=> {
    console.log(req.body)
  try {
    res.send(await User.byToken(req.headers.authorization));
  }
  catch(ex){
    next(ex);
  }
});

// error handling
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;
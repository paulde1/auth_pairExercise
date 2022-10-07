const express = require('express');
const app = express();
const {
  models: { User, Note },
} = require('./db');
const path = require('path');
const token = require('jsonwebtoken');
const dotenv = require('dotenv').config();
// middleware
app.use(express.json());

// routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.post('/api/auth', async (req, res, next) => {
  try {
    res.send({ token: await User.authenticate(req.body) });
  } catch (ex) {
    next(ex);
  }
});

app.get('/api/users/:id/notes', async (req, res, next) => {
  try {
    const notes = await Note.findAll({
      where: {
        userId: req.params.id,
      },
      include: User,
    });
    // const notes = await Note.findAll({
    //   where: {
    //     userId: req.user.userId,
    //   },
    // });
    res.send(notes);
  } catch (ex) {
    next(ex);
  }
});

app.get('/api/auth', async (req, res, next) => {
  try {
    res.send(await User.byToken(req.headers.authorization));
  } catch (ex) {
    next(ex);
  }
});

// error handling
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;

require('dotenv').config('.env');
const cors = require('cors');
const express = require('express');
const app = express();
const morgan = require('morgan');
const { PORT = 3000 } = process.env;
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');

const { User, Cupcake } = require('./db');

// middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

/* *********** YOUR CODE HERE *********** */
const config = {
  authRequired: true,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'http://localhost:3000',
  clientID: 'Zm6XiULa3dA2qZ20ziaso4t07U1du0ts',
  issuerBaseURL: 'https://dev-bre77a26kdxla4hw.us.auth0.com'
};
app.use(auth(config));

app.get('/', (req, res) => {
  const user = req.oidc.user;
  console.log(user);

  const html = req.oidc.isAuthenticated() ? `
    <html>
      <head>
        <title>User Profile</title>
      </head>
      <body>
        <h1>Logged in</h1>
        <p>User Profile:</p>
        <ul>
          <li>Nickname: ${user.nickname}</li>
          <li>Name: ${user.name}</li>
          <li>Email: ${user.email}</li>
          <li>Picture: <img src="${user.picture}" alt="User Picture" /></li>
        </ul>
      </body>
    </html>
  ` : `
    <html>
      <head>
        <title>User Profile</title>
      </head>
      <body>
        <h1>Logged out</h1>
      </body>
    </html>
  `;

  res.send(html);
});
// follow the module instructions: destructure config environment variables from process.env
// follow the docs:
  // define the config object
  // attach Auth0 OIDC auth router
  // create a GET / route handler that sends back Logged in or Logged out

app.get('/cupcakes', async (req, res, next) => {
  try {
    const cupcakes = await Cupcake.findAll();
    res.send(cupcakes);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

// error handling middleware
app.use((error, req, res, next) => {
  console.error('SERVER ERROR: ', error);
  if(res.statusCode < 400) res.status(500);
  res.send({error: error.message, name: error.name, message: error.message});
});

app.listen(PORT, () => {
  console.log(`Cupcakes are ready at http://localhost:${PORT}`);
});


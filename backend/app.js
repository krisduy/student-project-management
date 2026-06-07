const express = require('express');
const userRoutes = require('./src/routes/users.route');

const app = express();
const port = 3000;

app.use('/api/users', userRoutes);
app.get('/api', (req, res) => {
  res.send('Hello World!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
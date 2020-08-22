const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
require('./db');
const app = express();

const cors = require('cors');
app.use(cors());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET");
    res.header("Access-Control-Allow-Header", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const userRoute = require('./route/user');


app.use(express.json());
app.use(userRoute);

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`server is running on por: ${port}`);
})
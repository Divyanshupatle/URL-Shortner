require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const route = require("./src/routes/route");
const app = express();

// Middleware to parse JSON bodies
// This is what handles incoming JSON payloads from requests
app.use(express.json());

// Middleware to parse URL-encoded bodies
// This is what handles form submissions and URL quer
app.use(express.urlencoded({extended: true}));


mongoose.connect(`${process.env.DaTABASE}`,
        { useNewUrlParser: true }
    )
    .then(() => console.log("mongodb connected"))
    .catch((error) => console.log(error.message));

app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reverseRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL

main()
   .then(() => { console.log("Connected to DB"); })
   .catch((err) => { console.log(err); })

async function main() {
    try {
        await mongoose.connect(dbUrl, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 30000,
            connectTimeoutMS: 30000,
        });
        
        mongoose.set('bufferTimeoutMS', 30000);
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);
    }
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

// ✅ SIMPLE SESSION - Memory store use करो अभी
app.use(session({
    secret: process.env.SESSION_SECRET || "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reverseRouter);
app.use("/users", userRouter);

app.use((req, res, next) => {
    next(new ExpressError(404, "page not found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went Wrong!" } = err;
    res.status(statusCode).render("listings/error", { message });
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});
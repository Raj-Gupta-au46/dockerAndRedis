// import { NotFound } from "http-errors";
// import express, { Application } from "express";
// import { Request, Response, NextFunction } from "express"
// import {GOOGLE_CLIENT_SECRET, GOOGLE_CLIENT_ID} from '../config'
// import { google } from "googleapis";
// const  cookieParser= require ('cookie-parser')
// const passport = require('passport');
// var GoogleStrategy = require('passport-google-oauth20').Strategy;
// const session = require('express-session');
// const app: Application = express();
// app.use(express.json());
// app.use(express.urlencoded());
// app.use(
//   session({
//     secret: "your-secret-key",
//     resave: false,
//     saveUninitialized: true,
//     cookie: {secure: false}
//   })
// );
// app.use(cookieParser());

// //routes middleware
// const date = new Date();
// app.use(passport.session());
// app.use(passport.initialize());

// passport.serializeUser((user:any, done:any) => {
//   done(null, user);
// });


// // Deserialize the user object from the session
// passport.deserializeUser((user: any, done:any) => {
//   done(null, user);
// });

// passport.use(new GoogleStrategy({
//     clientID: GOOGLE_CLIENT_ID,
//     clientSecret: GOOGLE_CLIENT_SECRET,
//     callbackURL: "https://customize-spaces-cameroon-earrings.trycloudflare.com/auth/google/callback",
//     scope: ["profile"],
//   },
//   async function(accessToken, refreshToken, profile, done) {

//     // const users: any = {
//     //   accessToken: accessToken,
//     //   profile: profile,
//     // };
//     console.log({profile})
//     done(null, profile);
//   }
// ));


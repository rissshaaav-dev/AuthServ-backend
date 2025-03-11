import express from "express";
import { body } from "express-validator";
import registerUserController from "../controllers/user.controllers/registerUser.controller.js";

const userRouter = express.Router();

userRouter.post(
    "/login",
    [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").notEmpty().withMessage("Email is required"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    registerUserController
);

export default userRouter;
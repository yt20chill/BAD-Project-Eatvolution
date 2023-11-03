import { Request, Response } from "express";
import AuthService from "../services/auth.services";
import { checkPassword } from "hash";


export default class AuthController {
    constructor(private authService: AuthService) {
    }

    logIn = async (req, res) => {
        const { username, password } = req.body
        const matched = await checkPassword(req.body.password, password)

        if (matched) {
            console.log('login success');
            req.session.userId = req.body.username
            res.redirect('../private/user.html')
        }
        res.status(401).json({ success: false, message: "Failed to find matching username/password!" });
    }

}
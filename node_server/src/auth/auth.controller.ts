import { Request } from "express";
import { AuthControllerHelper } from "src/models/controllerModels";
import { logger } from "../config/logger";
import { deleteSocket } from "../socket";
import { BadRequestError } from "../utils/error";
import { AppUtils } from "../utils/utils";
import AuthService from "./auth.service";

export default class AuthController implements AuthControllerHelper {
  constructor(private readonly authService: AuthService) {}

  signUp = async (req: Request) => {
    if (!req.body) throw new BadRequestError();
    const { username, password, confirmPassword } = req.body;

    if (password !== confirmPassword) return AppUtils.setServerResponse("password mismatch", false);

    //package ZOD for type checking
    if (
      !username ||
      !password ||
      !confirmPassword ||
      typeof username !== "string" ||
      typeof password !== "string" ||
      typeof confirmPassword !== "string"
    )
      throw new BadRequestError();

    const id = await this.authService.signUp(username, password);

    if (id === -1) return AppUtils.setServerResponse("Duplicated username", false);

    req.session.user = { id, username };

    return AppUtils.setServerResponse();
  };

  login = async (req: Request) => {
    if (!req.body) throw new BadRequestError();
    const { username, password } = req.body;
    if (typeof username !== "string" || typeof password !== "string") throw new BadRequestError();
    const id = await this.authService.login(username, password);
    if (id === -1) return AppUtils.setServerResponse(null, false);
    req.session.user = { id, username };
    return AppUtils.setServerResponse(); // return {success: true, result: null}
  };

  oauthLogin = async (req: Request) => {
    try {
      const accessToken = req.session?.["grant"].response.access_token;
      if (!accessToken) return AppUtils.setServerResponse(null, false);
      const fetchRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        method: "get",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (fetchRes.status >= 400) return AppUtils.setServerResponse(null, false);
      const fetchedUser = await fetchRes.json(); //login success => get user data in google
      const { email } = fetchedUser;
      const id = await this.authService.oauthLogin(email);
      req.session.user = { id, username: email };
      return AppUtils.setServerResponse();
    } catch (err) {
      logger.error(err);
      return AppUtils.setServerResponse(null, false);
    }
  };

  logout = async (req: Request) => {
    if (req.session?.user) {
      if (req.session.user.id) deleteSocket(req.session.user.id);
      delete req.session.user;
      delete req.session.grant;
    }
    return AppUtils.setServerResponse();
  };
}

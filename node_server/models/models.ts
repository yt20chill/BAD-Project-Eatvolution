import { Request } from "express";
declare module "express-session" {
  interface SessionData {
    userId?: string;
    grant: Grant;
  }
}

declare module "express" {
  interface Request {
    //key-value pairs you would like to pass in the middleware to the next middleware
  }
}

export type ValueTypes<T> = T[keyof T];

// Type Grant from grant
type Grant = {
  provider: string;
  state: string;
  response: GrantResponse;
};

type GrantResponse = {
  id_token: string;
  access_token: string;
  raw: Raw;
};

type Raw = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token: string;
};

export type OAuthRes = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
};

export interface ControllerResult<ResultType> {
  success: boolean;
  result: ResultType;
}

export type Controller<ResultType = null> = (req: Request) => Promise<ControllerResult<ResultType>>;

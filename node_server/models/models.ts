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

export type CnItem = {
  sugar_g: number;
  fiber_g: number;
  serving_size_g: number;
  sodium_mg: number;
  name: string;
  potassium_mg: number;
  fat_saturated_g: number;
  fat_total_g: number;
  calories: number;
  cholesterol_mg: number;
  protein_g: number;
  carbohydrates_total_g: number;
};

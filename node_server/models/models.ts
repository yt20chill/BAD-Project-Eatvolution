declare module "express-session" {
  interface SessionData {
    userId?: number;
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
  name: string;
  calories: number;
  serving_size_g: number;
  fat_total_g: number;
  fat_saturated_g: number;
  protein_g: number;
  sodium_mg: number;
  potassium_mg: number;
  cholesterol_mg: number;
  carbohydrates_total_g: number;
  fiber_g: number;
  sugar_g: number;
};

export type ClassifyFood = {
  calories: number;
  fat: number;
  saturated_fat: number;
  protein: number;
  sodium: number;
  cholesterol: number;
  carbohydrates: number;
  fibre: number;
  sugar: number;
};

export type InsertFood = {
  name: string;
  cost?: null | number;
  category_id?: null | number;
  calories: number;
  protein: number;
  fat: number;
  saturated_fat: number;
  cholesterol: number;
  carbohydrates: number;
  fibre: number;
  sugar: number;
  sodium: number;
};

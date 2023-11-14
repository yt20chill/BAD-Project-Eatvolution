import { Food } from "./dbModels";

declare module "express-session" {
  interface SessionData {
    user?: { id: number; username: string };
    grant?: Grant;
  }
}

declare module "express" {
  interface Request {
    foodId?: number;
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

export type GeneralOmitFields = "id" | "created_at" | "updated_at";
export type BriefFood = {
  id: number;
  name: string;
  calories: number;
  cost: number;
  emoji: string;
};

export interface FoodCollection extends Omit<Food, "cost" | "name" | "created_at" | "updated_at"> {
  food_name: string;
  category_name: string;
  is_custom: boolean;
}

export interface ExportFoodCollection {
  unlocked: { universal: FoodCollection[]; custom: FoodCollection[] };
  locked: { universal: number[]; custom: number[] };
}

export interface FoodCollectionIds {
  universal: Set<number>;
  custom: Set<number>;
}

export interface SlimeCollection {
  id: string; //uuid
  name: string;
  description: string;
  max_calories: number;
  bmr_multiplier: number;
  earn_rate_multiplier: number;
}

export type UpdateDbUser = {
  money: number;
  total_money: number;
  updated_at: Date;
};

export type RedisUser = {
  money: number;
  total_money: number;
  earning_rate: number;
  updated_at: Date;
};

export interface UserFinancialStatus extends RedisUser {
  id: number;
}

export type EvolutionInfo = {
  food_count: number;
  extra_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
};

export interface ExportSlime {
  id: number;
  owner: string;
  slime_type: string;
  slime_type_description: string;
  current_calories: number;
  max_calories: number;
  extra_calories: number;
  earn_rate: number;
  bmr_rate: number;
}

export interface SlimeDetails extends Omit<ExportSlime, "id" | "current_calories"> {
  slime_id: number;
  slime_type_id: string;
  calories: number;
  food_count: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  updated_at: string;
}

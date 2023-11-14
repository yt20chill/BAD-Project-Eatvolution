/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
import { Knex } from "knex";
import { RedisClientType } from "redis";
import { Server } from "socket.io";

export const mockSocketIO = () => {
  const emit = jest.fn(() => null);
  return {
    to: jest.fn(() => ({ emit })),
  } as unknown as Server;
};

export const mockRequest = () => {
  return {
    session: {
      user: {},
      grant: {
        response: {},
      },
    },
    body: {},
    params: {},
  } as unknown as Request;
};

export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn((_status: number) => res);
  res.json = jest.fn(() => null);
  return res as Response;
};

export const mockRedis = () => {
  const get = jest.fn((_key: string) => null);
  const setEx = jest.fn((_key: string, _expiry: number, _result: string) => null);
  return {
    get,
    setEx,
  } as unknown as RedisClientType;
};

export const countFood = async (knex: Knex) =>
  +(await knex("food").count("id as count"))[0]["count"];

//TODO: combine the testFood and expectTestFood in one object
// FIXME: fibre and fiber
export const testFood = Object.freeze({
  name: "test",
  calories: 0.1,
  protein: 0.1,
  fat: 0.1,
  saturated_fat: 0.1,
  cholesterol: 0.1,
  carbohydrates: 0.1,
  fibre: 0.1,
  sugar: 0.1,
  sodium: 0.1,
  category_id: 1,
});

export const expectTestFood = Object.freeze({
  food_name: "test",
  calories: "0.10",
  protein: "0.10",
  fat: "0.10",
  saturated_fat: "0.10",
  cholesterol: "0.10",
  carbohydrates: "0.10",
  fiber: "0.10",
  sugar: "0.10",
  sodium: "0.10",
});

// insert username: "test", password: "123" to user
export const idFromInsertingTestUser = async (knex: Knex) =>
  (
    await knex("user")
      .insert({
        username: "test",
        hash_password: "$2a$10$8nXBNisolSX6wdRW1xRKw.r/4QK4qgoRnaTHlNHTqcRr1bjV65VR6",
      })
      .returning("id")
  )[0]["id"] as number;

export const countUser = async (knex: Knex) =>
  +(await knex("user").count("id as count"))[0]["count"];

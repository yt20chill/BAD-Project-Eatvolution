/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
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
      grant: {
        response: {}
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

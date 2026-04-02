import * as userService from "../services/user.service";
import { Request, Response } from "express";

export const getUsers = async (req : Request, res :Response ) : Promise<void> => {
  const users = await userService.getAllUsers();
  res.status(404);
  res.json(users);
};
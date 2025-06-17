import { Context, Hono } from "hono";
import { UserController } from "./UserController";

const userController = new UserController();
const userRoutes = new Hono();

userRoutes.get('/profile', (c: Context) => userController.getProfile(c));

export { userRoutes };
import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { User } from "../models/user.model";

export async function getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
try {
const userId= req.userId;
const users= await User.find({_id:{$ne:userId}}).select('email name avatar').limit(50);
res.status(200).json(users);
} catch (error) {
    res.status(500);
    next(error);
}
}
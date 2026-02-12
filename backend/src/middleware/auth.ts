import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { requireAuth } from "@clerk/express";
import { User } from "../models/user.model";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}
export const protectRoute = [
  requireAuth(),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userId: clerkId } = getAuth(req);
      if (!clerkId)
        return res
          .status(401)
          .json({ message: "Unauthorized: invalid token" });
    const user= await User.findOne({clerkId});
    if(!user) return res.status(401).json({message:"Unauthorized: User not found"});
    
    req.userId= user._id.toString();
    next();
    } catch (error) {
        res.status(500);
        next(error);
    }
  },
];

import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { User } from "../models/user.model";
import { clerkClient, getAuth } from "@clerk/express";

export async function getCurrent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500);
    next(error);
  }
}

export async function authCallback(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId)
      return res.status(401).json({ message: "Unauthorized: No valid token" });
    let user = await User.findOne({ clerkId });
    if (!user) {
      // Here you might want to create a new user if not found
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const name = clerkUser.firstName
        ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
        : clerkUser.emailAddresses[0]?.emailAddress.split("@")[0] ||
          "Unnamed User";
      user = new User({
        clerkId: clerkUser.id,
        name: name,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        avatar: clerkUser.imageUrl,
      });
      await user.save();
    }
    res.json(user);
  } catch (error) {
    res.status(500);
    next(error);
  }
}

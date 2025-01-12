import { Request, Response } from "express";
import prisma from "../db/prisma.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const get = (req: Request, res: Response) => {
  res.json("hello");
};

//signup
export const signup = async (req: Request, res: Response) => {
  try {
    const { fullName, username, password, gender } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (user) {
      res.json("Username already exists");
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const boyprofilepic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const girlprofilepic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

    const newuser = await prisma.user.create({
      data: {
        fullName,
        username,
        password: hashedPassword,
        gender,
        profilepic: gender === "male" ? boyprofilepic : girlprofilepic,
      },
    });

    if (newuser) {
      res.json({
        id: newuser.id,
      });
    } else {
      res.json({ error: "Invalid user data" });
    }
  } catch (error: any) {
    console.log(error);
  }
};

//login
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (username === null || username === undefined || username === "") {
      console.log("Invalid username");
    } else {
      let user = await prisma.user.findUnique({ where: { username } });

      if (!user) {
        return res.json("User not found");
      }
      const ispasswordcorrect = await bcryptjs.compare(password, user.password);

      if (!ispasswordcorrect) {
        return res.json("Password is not correct");
      }

      const acesstoken = jwt.sign(
        { id: user.id },
        process.env.JWT_KEY as string,
        {
          expiresIn: "5d",
        }
      );

      res.json({
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        profilepic: user.profilepic,
        acesstoken: acesstoken,
      });
    }
  } catch (err) {
    res.json("the error is : " + err);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.json({ error: "Internal Server Error" });
  }
};

export const getme = async (req: Request, res: Response) => {
  try {
    console.log(req.user.id);
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    res.json({
      id: user?.id,
      fullname: user?.fullName,
      username: user?.username,
      profilepic: user?.profilepic,
    });
  } catch (error) {
    console.log(error);
    res.json({ error: "Internal Server Error" });
  }
};

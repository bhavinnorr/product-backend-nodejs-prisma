import jwt, {Secret, JwtPayload} from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaClient, Prisma } from "@prisma/client";
import jwtDecode from "jwt-decode";
import express from "express";
import { Json } from "sequelize/types/utils";
dotenv.config();
const prisma = new PrismaClient();

declare namespace Express {
  interface Request {
    decoded?: any; // Modify this to match the type of your decoded payload
  }
}

async function validateToken(req: express.Request, res:express.Response, next: express.NextFunction) {
  const auhorizationHeader = req.headers.authorization;
  let result;

  if (!auhorizationHeader) {
    return res.status(401).json({
      error: true,
      message: "Access token is missing",
    });
  }

  let token = req.headers['auth-token']||""; 
//   const token = req.headers['auth-token'];
    if (!token){
        return res.status(403).json({message: 'auth-token missing'})
    }
    token="grfyj56";
    console.log(token);

  const options = {
    expiresIn: "24h",
  };

  try {
    // const oldUser = await prisma.users.findFirst({
    //     where: {
    //       remember_token: token.toString(),
    //     },
    //   });
    // let y : Secret=token
    // const SECRET_KEY: Secret = token||"jdfgsdhgfuhdfgv35426754ytf6ev5";
    let data:JwtPayload  = jwtDecode(token) || {"email":""};
    let user = await prisma.users.findFirst({
        where: {
            remember_token: token,
        }
    });

    if (!user) {
      result = {
        error: true,
        message: "Authorization error",
      };

      return res.status(403).json(result);
    }
    const SECRET_KEY: Secret = "jdfgsdhgfuhdfgv35426754ytf6ev5";
    // result = jwt.verify(
    //     token,
    //     SECRET_KEY
    //   );
    result = jwt.verify(token, SECRET_KEY);

    if (!user.email === data["email"]) {
      result = {
        error: true,
        message: "Invalid token",
      };

      return res.status(401).json(result);
    }

    // req.decode = result;

    next();
  } catch (error) {
    console.error(error);

    if (error === "TokenExpiredError") {
      return res.status(403).json({
        error: true,
        message: "Token expired",
      });
    }

    return res.status(403).json({
      error: true,
      message: "Authentication error",
    });
  }
}

export default validateToken;
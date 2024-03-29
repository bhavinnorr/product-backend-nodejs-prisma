import { PrismaClient, Prisma } from "@prisma/client";
import express, { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
// import path from 'path';
import bcrypt from "bcryptjs";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { json } from "body-parser";
import { JsonWebTokenError } from "jsonwebtoken";
import cors from "cors";
const md5 = require("crypto-js/md5");
const authMiddleware = require("./authMiddleware.js");

var validateToken = require("./token.ts");

const path = require("path");

const prisma = new PrismaClient();
var router = express.Router();
var publicRouter = express.Router();
var protectedRouter = express.Router();
var app = express();

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, "./public/files/"); // Destination folder for uploaded files
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    1;
    console.log("Extension:- " + path.extname(file.originalname));
    cb(
      null,
      md5(file.originalname + Date.now()).toString() +
        path.extname(file.originalname)
    ); // Rename the file with timestamp and original extension
  },
});
// Set up multer with the storage configuration
const upload = multer({ storage });

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

publicRouter.get("/", function (req: express.Request, res: express.Response) {
  res.send("Hello World");
});

publicRouter.post(
  "/login",
  async (req: express.Request, res: express.Response) => {
    // Our register logic starts here
    try {
      // Get user input
      const { email, password } = req.body;

      // Validate user input
      if (!(email && password)) {
        return (
          res
            // .status(400)
            .send({ message: "Please Fill all details", status: 400, data: {} })
        );
      }

      // check if user already exist
      // Validate if user exist in our database
      const User = await prisma.users.findUnique({
        where: {
          email: req.body.email,
        },
      });

      if (User) {
        // bcrypt.compare(User.password,req.body.password)
        const verifyPass = await bcrypt.compare(
          req.body.password,
          User.password
        );
        if (verifyPass) {
          const SECRET_KEY: Secret = "jdfgsdhgfuhdfgv35426754ytf6ev5";
          // Create token
          const token = jwt.sign(
            { _id: User.id?.toString(), name: User.name, email: User.email },
            SECRET_KEY,
            {
              expiresIn: "2 days",
            }
          );
          User.remember_token = token;
          const response={
            message:"User Logged In Successfully",
            id:User.id,
            name:User.name,
            email:User.email,
            token:token,
          }
          // return new user
          return res.status(201).json(response);
        } else {
          return (
            res
              // .status(409)
              .send({ message: "Invalid Credentials.", status: 401, data: {} })
          );
        }
        return (
          res
            // .status(409)
            .send({
              message: "User Already Exist. Please Login",
              status: 401,
              data: {},
            })
        );
      } else {
        return (
          res
            // .status(409)
            .send({
              message: "User Doesn't Exist. Please Register",
              status: 401,
              data: {},
            })
        );
      }

      //Encrypt user password
      // const encryptedPassword = await bcrypt.hash(req.body.password, 10);

      // // Create user in our database
      // const user = await prisma.users.create({
      //   data: {
      //     name: req.body.name,
      //     email: req.body.email,
      //     password: encryptedPassword,
      //   },
      // });
      // const SECRET_KEY: Secret = "jdfgsdhgfuhdfgv35426754ytf6ev5";
      // // Create token
      // const token = jwt.sign(
      //   { _id: user.id?.toString(), name: user.name },
      //   SECRET_KEY,
      //   {
      //     expiresIn: "2 days",
      //   }
      // );
      // user.remember_token = token;

      // // return new user
      // res.status(201).json(user);
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  }
);

publicRouter.post(
  "/signup",
  async (req: express.Request, res: express.Response) => {
    // Our register logic starts here
    try {
      // Get user input
      const { name, email, password } = req.body;

      // Validate user input
      if (!(email && password && name)) {
        res.status(400).send("All input is required");
      }

      // check if user already exist
      // Validate if user exist in our database
      const oldUser = await prisma.users.findUnique({
        where: {
          email: req.body.email,
        },
      });

      if (oldUser) {
        return res.status(409).send("User Already Exist. Please Login");
      }

      //Encrypt user password
      const encryptedPassword = await bcrypt.hash(req.body.password, 10);

      // Create user in our database
      const user = await prisma.users.create({
        data: {
          name: req.body.name,
          email: req.body.email,
          password: encryptedPassword,
        },
      });
      const SECRET_KEY: Secret = "jdfgsdhgfuhdfgv35426754ytf6ev5";
      // Create token
      const token = jwt.sign(
        { _id: user.id?.toString(), name: user.name, email: user.email },
        SECRET_KEY,
        {
          expiresIn: "2 days",
        }
      );
      user.remember_token = token;

      // return new user
      res.status(201).json(user);
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  }
);

// Handle file upload
protectedRouter.post(
  "/save-file",
  upload.single("file"),
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    // The uploaded file information is available in req.file
    console.log("Uploaded file:", req.file);
    //   return response()->json([
    //     'success' => true,
    //     'message' => 'Image has been uploaded successfully.',
    //     'data'=>["name"=>$imageName,"url"=>"http://localhost:8000/files/".$imageName]
    // ]);
    const response = {
      success: true,
      message: "Image has been uploaded successfully.",
      data: {
        name: req.file.filename,
        url: "http://localhost:8000/files/" + req.file.filename,
      },
    };
    res.send(response);
  }
);

// products
// get all products
protectedRouter.get(
  "/products",
  async function (req: express.Request, res: express.Response) {
    const productsWithImages = await prisma.product.findMany({
      include: {
        images: true,
      },
    });
    const data = {
      message: "All Products Fetched Successfully",
      status: 200,
      data: productsWithImages,
    };
    // console.dir(productsWithImages, { depth: null });
    res.send(JSON.stringify(data));
  }
);
// get product by id
protectedRouter.get(
  "/products/:id",
  async function (req: express.Request, res: express.Response, id) {
    const productWithImages = await prisma.product.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
      include: {
        images: true,
      },
    });
    const data = {
      message: "Product Fetched Successfully",
      status: 200,
      data: productWithImages,
    };
    // console.dir(productsWithImages, { depth: null });
    res.send(JSON.stringify(data));
  }
);
// insert product
protectedRouter.post(
  "/products",
  async function (req: express.Request, res: express.Response) {
    // Pass 'user' object into query
    const createProduct = await prisma.product.create({
      data: {
        name: req.body.name,
        in_stock: req.body.in_stock === "yes" ? true : false,
        category: req.body.category,
        price: req.body.price,
        images: {
          create: {
            file_name: req.body.fileList,
          },
        },
      },
    });
    const data = {
      message: "Product Created Successfully",
      status: 200,
      data: createProduct,
    };
    // console.dir(productsWithImages, { depth: null });
    res.send(JSON.stringify(data));
  }
);
// update product by id
protectedRouter.put(
  "/products/:id",
  async function (req: express.Request, res: express.Response) {
    const updateProduct = await prisma.product.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        name: req.body.name,
        in_stock: req.body.in_stock,
        category: req.body.category,
        price: req.body.price,
        images: {
          create: {
            file_name: req.body.fileList,
          },
        },
      },
    });
    const data = {
      message: "Product Updated Successfully",
      status: 200,
      data: updateProduct,
    };
    // console.dir(productsWithImages, { depth: null });
    res.send(JSON.stringify(data));
  }
);

protectedRouter.get(
  "/users",
  async (req: express.Request, res: express.Response) => {
    const users = await prisma.users.findMany();
    res.send(JSON.stringify(users));
  }
);

protectedRouter.post(
  "/mail",
  async (req: express.Request, res: express.Response) => {
    // send mail with defined transport object
    const to = req.body.email;
    const token = "tcer765y5j4y3x4x34f5o60dc4656f5s23rgyur5";
    const name = req.body.name;
    const info = await transporter.sendMail({
      from: '"Windows" <foo@example.com>', // sender address
      to: to, // "1@gmail.com, 2@gmail.com" list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email</title>
    </head>
    <body>
        Hi ${
          name[0].toUpperCase() + name.slice(1, name.length)
        }, You have got an invitation<br>
        <button style="padding:8px 16px; border:0;border-radius: 7px;background-color: crimson;">
            <a href="http://localhost:5173/register?email=${to}&token=${token}" style="text-decoration:none; font-weight:bold; color:white;">Register</a>
        </button>
        
    </body>
    </html>`, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // const data = req.query;
    // console.log(data);
    const data = {
      message: "Email Sent Successfully",
      status: 200,
      data: req.body,
    };
    // console.dir(productsWithImages, { depth: null });
    res.send(JSON.stringify(data));
  }
);

app.use("/api/", publicRouter);
app.use("/api/", authMiddleware, protectedRouter);

// Set the static directory
app.use(express.static(path.join(__dirname, "public")));

var server = app.listen(8000, function () {
  var host = server.address();
  var port = 8000;
  console.log("Example app listening at 123 http://%s:%s", host, port);
});

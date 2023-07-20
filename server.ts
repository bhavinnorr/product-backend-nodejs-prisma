import { PrismaClient, Prisma } from "@prisma/client";
import express from "express";
import bcrypt from "bcryptjs";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { json } from "body-parser";
import { JsonWebTokenError } from "jsonwebtoken";

const prisma = new PrismaClient();
var router = express.Router();
var app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'}));

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

router.get("/", function (req: express.Request, res: express.Response) {
  res.send("Hello World");
});

router.post("/register", async (req: express.Request, res: express.Response) => {

  // Our register logic starts here
  try {
    // Get user input
    const {email , password , name , password_confirmation} = req.body;

    // Validate user input
    if (!(email && password && name && password_confirmation)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await prisma.users.findUnique({where: {
      id: parseInt(req.params.id),
    },});

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
        password: encryptedPassword
      },
    });
    const SECRET_KEY: Secret = "jdfgsdhgfuhdfgv35426754ytf6ev5";
    // Create token
    const token = jwt.sign({ _id: user.id?.toString(), name: user.name }, SECRET_KEY, {
      expiresIn: '2 days',
    });
    // const token = jwt.sign({
    //   payload: { 
    //     user_id: user.id?.toString, 
    //     user_email: user.email 
    //   },
    //   Secret: jwt.Secret
    // });
    // save user token
    user.remember_token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

// products
// get all products
router.get(
  "/products",
  async function (req: express.Request, res: express.Response) {
    const productsWithImages = await prisma.product.findMany({
      include: {
        images: true,
      },
    });
    // console.dir(productsWithImages, { depth: null });
    res.send(JSON.stringify(productsWithImages));
  }
);
// get product by id
router.get(
  "/products/:id",
  async function (req: express.Request, res: express.Response, id) {
    const productWithImages = await prisma.product.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    });
    // console.dir(productsWithImages, { depth: null });
    res.send(JSON.stringify(productWithImages));
  }
);
// insert product
router.post(
  "/products",
  async function (req: express.Request, res: express.Response) {
    // Pass 'user' object into query
    const createProduct = await prisma.product.create({
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
    res.send(JSON.stringify(createProduct));
  }
);
// update product by id
router.put(
  "/products/:id",
  async function (req: express.Request, res: express.Response) {
    const updateProduct = await prisma.product.update({
      where: {
        id: parseInt(req.params.id),
      },
      data:{
        name: req.body.name,
        in_stock: req.body.in_stock,
        category: req.body.category,
        price: req.body.price,
        images: {
          create: {
            file_name: req.body.fileList,
          },
        },
      }
    });
    res.send(JSON.stringify(updateProduct));
  }
);

router.get("/users", async (req: express.Request, res: express.Response) => {
  const users = await prisma.users.findMany();
  res.send(JSON.stringify(users));
});

router.post("/mail", async (req: express.Request, res: express.Response) => {
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
  res.send(JSON.stringify(req.body));
});

app.use("/api/", router);

var server = app.listen(8000, function () {
  var host = server.address();
  var port = 8000;
  console.log("Example app listening at 123 http://%s:%s", host, port);
});

import { PrismaClient } from ".prisma/client";
import express from "express";

const prisma = new PrismaClient();
var router = express.Router();
var app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: 'bhavin.openspace@gmail.com',
    pass: 'REPLACE-WITH-YOUR-GENERATED-PASSWORD'
  }
});

router.get("/", function (req: express.Request, res: express.Response) {
  res.send("Hello World");
});

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

router.get("/users", async (req: express.Request, res: express.Response) => {
  const users = await prisma.users.findMany();
  res.send(JSON.stringify(users));
});

router.post("/mail", async (req: express.Request, res: express.Response) => {
  const data = req.query;
  console.log(data);
  res.send(JSON.stringify(req.body));
});

app.use("/api/", router);

var server = app.listen(8000, function () {
  var host = server.address();
  var port = 8000;
  console.log("Example app listening at 123 http://%s:%s", host, port);
});

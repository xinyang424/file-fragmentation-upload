import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join("./public")));

app.get("/", (_, res) => {
  res.redirect("/index.html");
});

app.get("/test", (req, res) => {
  res.send({
    code: 200,
    msg: "ok",
  });
});

// 初始化 multer
const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, "upload/"); // 分片存储的目录
  },
  filename(req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
  res.send("ok");
});
app.post("/merge", (req, res) => {
  // 读取目录下面的所有切片
  const uploadDir = path.join(process.cwd(), "upload");
  const uploadArr = fs.readdirSync(uploadDir);
  uploadArr.sort((a, b) => a.split("--")[1] - b.split("--")[1]);
  const imgDir = path.join(process.cwd(), "upload-img", `${new Date().getTime()}.png`);
  uploadArr.forEach(item => {
    fs.appendFileSync(imgDir, fs.readFileSync(path.join(uploadDir, item)));
    fs.unlinkSync(path.join(uploadDir, item));
  });
  res.send("ok");
});

app.listen(8080, () => {
  console.log("Server is run on http://localhost:8080");
});

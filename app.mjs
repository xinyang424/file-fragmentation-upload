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
  destination: function (req, file, cb) {
    // 分片存储的目录，在根目录下的upload/，需要注意自己要检查根目录下是否有upload文件夹，否则会保存失败
    cb(null, "upload/");
  },
  filename(req, file, cb) {
    // file.originalname 定义每一片文件的文件名，这里的文件名是由前端定义的，格式为：文件的MD5签名--文件切片顺序
    cb(null, file.originalname);
  },
});

// 使用 multer 处理文件上传的 formData
const upload = multer({ storage });

/**
 * 对每一个文件进行保存
 */
app.post("/upload", upload.single("file"), (req, res) => {
  res.send("ok");
});

/**
 * 对文件进行组装
 */
app.post("/merge", (req, res) => {
  // 获取文件切片目录，需要注意自己要检查根目录下是否有upload文件夹，否则会读取失败
  const uploadDir = path.join(process.cwd(), "upload");
  // 读取目录下面的所有切片
  const uploadArr = fs.readdirSync(uploadDir);
  // 将文件切片进行排序
  uploadArr.sort((a, b) => a.split("--")[1] - b.split("--")[1]);
  // 定义组装后的文件保存在 upload-img 文件夹下，第三个参数就是保存的文件名，需要检查根目录下是否有 upload-img 文件夹，否则会读取失败
  const imgDir = path.join(process.cwd(), "upload-img", `${new Date().getTime()}.png`);
  uploadArr.forEach(item => {
    // 将文件分片按顺序进行组装
    fs.appendFileSync(imgDir, fs.readFileSync(path.join(uploadDir, item)));
    // 每组装一个就删除一个文件片段
    fs.unlinkSync(path.join(uploadDir, item));
  });
  res.send("ok");
});

app.listen(8080, () => {
  console.log("Server is run on http://localhost:8080");
});

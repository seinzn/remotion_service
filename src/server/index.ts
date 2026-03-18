import express from "express";
import cors from "cors";
import path from "path";
import renderRouter from "./routes/render";
import { startWorker } from "./queue/renderQueue";

const PORT = parseInt(process.env.PORT || "3000");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// 静态文件 - 输出视频的访问地址
app.use("/output", express.static(path.resolve(__dirname, "../../public/output")));

// API 路由
app.use("/api/render", renderRouter);

// 健康检查
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`服务启动: http://localhost:${PORT}`);
  console.log(`API 地址: http://localhost:${PORT}/api/render`);

  // 启动渲染 Worker
  startWorker();
});

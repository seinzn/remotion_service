import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { renderQueue, getTaskStatus, setTaskStatus, RenderJobData } from "../queue/renderQueue";

const router = Router();

const IMAGE_DURATION_SEC = 3; // 图片默认展示秒数
const DEFAULT_VIDEO_DURATION_SEC = 10; // 视频默认时长（实际应读取视频元数据）
const DEFAULT_FPS = 30;
const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;

interface AssetInput {
  type: "image" | "video";
  url: string;
  duration?: number; // 秒，可选，预留扩展
}

interface RenderRequestBody {
  assets: AssetInput[];
  music: string;
}

// 提交渲染任务
router.post("/", async (req: Request, res: Response) => {
  const { assets, music } = req.body as RenderRequestBody;

  // 参数校验
  if (!assets || !Array.isArray(assets) || assets.length === 0) {
    res.status(400).json({ error: "assets 不能为空" });
    return;
  }

  if (!music || typeof music !== "string") {
    res.status(400).json({ error: "music 不能为空" });
    return;
  }

  for (const asset of assets) {
    if (!["image", "video"].includes(asset.type)) {
      res.status(400).json({ error: `不支持的素材类型: ${asset.type}` });
      return;
    }
    if (!asset.url || typeof asset.url !== "string") {
      res.status(400).json({ error: "素材 url 不能为空" });
      return;
    }
  }

  const taskId = uuidv4();
  const fps = DEFAULT_FPS;

  // 计算每个素材的帧数
  const processedAssets = assets.map((asset) => {
    let durationSec: number;
    if (asset.duration) {
      durationSec = asset.duration;
    } else if (asset.type === "image") {
      durationSec = IMAGE_DURATION_SEC;
    } else {
      durationSec = DEFAULT_VIDEO_DURATION_SEC;
    }
    return {
      type: asset.type,
      url: asset.url,
      durationInFrames: Math.round(durationSec * fps),
    };
  });

  const totalDurationInFrames = processedAssets.reduce(
    (sum, a) => sum + a.durationInFrames,
    0
  );

  const jobData: RenderJobData = {
    taskId,
    assets: processedAssets,
    musicUrl: music,
    fps,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    totalDurationInFrames,
  };

  // 初始化任务状态
  setTaskStatus(taskId, { status: "queued", progress: 0 });

  // 加入队列
  await renderQueue.add("render", jobData, {
    attempts: 2,
    backoff: { type: "exponential", delay: 5000 },
  });

  res.json({
    taskId,
    status: "queued",
  });
});

// 查询任务状态
router.get("/:taskId", (req: Request, res: Response) => {
  const { taskId } = req.params;
  const status = getTaskStatus(taskId);

  if (!status) {
    res.status(404).json({ error: "任务不存在" });
    return;
  }

  res.json({ taskId, ...status });
});

export default router;

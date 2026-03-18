import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { renderMedia, bundle, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");
const CONCURRENCY = parseInt(process.env.RENDER_CONCURRENCY || "3");
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.resolve(__dirname, "../../../public/output");

const connection = new IORedis(REDIS_PORT, REDIS_HOST, {
  maxRetriesPerRequest: null,
});

export const renderQueue = new Queue("render", { connection });

export interface RenderJobData {
  taskId: string;
  assets: Array<{
    type: "image" | "video";
    url: string;
    durationInFrames: number;
  }>;
  musicUrl: string;
  fps: number;
  width: number;
  height: number;
  totalDurationInFrames: number;
}

// 任务状态存储
const taskStatusMap = new Map<
  string,
  {
    status: "queued" | "rendering" | "done" | "failed";
    progress: number;
    url?: string;
    duration?: number;
    fileSize?: string;
    error?: string;
  }
>();

export function getTaskStatus(taskId: string) {
  return taskStatusMap.get(taskId) || null;
}

export function setTaskStatus(taskId: string, status: any) {
  taskStatusMap.set(taskId, status);
}

// 启动 Worker
export function startWorker() {
  const worker = new Worker(
    "render",
    async (job: Job<RenderJobData>) => {
      const { taskId, assets, musicUrl, fps, width, height, totalDurationInFrames } = job.data;

      setTaskStatus(taskId, { status: "rendering", progress: 0 });

      try {
        // 1. Bundle Remotion 项目
        const entryPoint = path.resolve(__dirname, "../../index.ts");
        const bundleLocation = await bundle({
          entryPoint,
          onProgress: (progress: number) => {
            // Bundle 进度占 0-20%
            setTaskStatus(taskId, {
              status: "rendering",
              progress: Math.round(progress * 20),
            });
          },
        });

        // 2. 选择合成
        const composition = await selectComposition({
          serveUrl: bundleLocation,
          id: "MainVideo",
          inputProps: {
            assets: assets.map((a) => ({
              type: a.type,
              src: a.url,
              durationInFrames: a.durationInFrames,
            })),
            musicSrc: musicUrl,
            musicVolume: 0.5,
          },
        });

        // 覆盖合成的时长和尺寸
        composition.durationInFrames = totalDurationInFrames;
        composition.fps = fps;
        composition.width = width;
        composition.height = height;

        // 3. 渲染
        const outputPath = path.join(OUTPUT_DIR, `${taskId}.mp4`);

        if (!fs.existsSync(OUTPUT_DIR)) {
          fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }

        await renderMedia({
          composition,
          serveUrl: bundleLocation,
          codec: "h264",
          outputLocation: outputPath,
          inputProps: {
            assets: assets.map((a) => ({
              type: a.type,
              src: a.url,
              durationInFrames: a.durationInFrames,
            })),
            musicSrc: musicUrl,
            musicVolume: 0.5,
          },
          onProgress: ({ progress }) => {
            // 渲染进度占 20-100%
            setTaskStatus(taskId, {
              status: "rendering",
              progress: Math.round(20 + progress * 80),
            });
          },
        });

        // 4. 获取文件信息
        const stats = fs.statSync(outputPath);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(1);
        const durationSec = totalDurationInFrames / fps;

        setTaskStatus(taskId, {
          status: "done",
          progress: 100,
          url: `/output/${taskId}.mp4`,
          duration: durationSec,
          fileSize: `${fileSizeMB}MB`,
        });

        // 清理 bundle 临时文件
        fs.rmSync(bundleLocation, { recursive: true, force: true });
      } catch (err: any) {
        setTaskStatus(taskId, {
          status: "failed",
          progress: 0,
          error: err.message || "渲染失败",
        });
        throw err;
      }
    },
    {
      connection,
      concurrency: CONCURRENCY,
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`任务 ${job?.data.taskId} 失败:`, err.message);
  });

  worker.on("completed", (job) => {
    console.log(`任务 ${job.data.taskId} 完成`);
  });

  console.log(`渲染 Worker 已启动，并发数: ${CONCURRENCY}`);
  return worker;
}

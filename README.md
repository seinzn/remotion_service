# remotion_service

基于 Remotion 的视频合成服务，支持图片/视频素材拼接 + 背景音乐，通过 API 调用生成视频。

## 快速启动

### Docker 部署（推荐）

```bash
docker-compose up --build -d
```

### 本地开发（需要本地 Redis）

```bash
npm install
npm run dev
```

## API

### 提交渲染任务

```
POST /api/render
```

```json
{
  "assets": [
    { "type": "image", "url": "https://example.com/photo1.jpg" },
    { "type": "video", "url": "https://example.com/clip.mp4" },
    { "type": "image", "url": "https://example.com/photo2.jpg" }
  ],
  "music": "https://example.com/bgm.mp3"
}
```

### 查询任务状态

```
GET /api/render/{taskId}
```

### 健康检查

```
GET /health
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | 3000 | 服务端口 |
| `REDIS_HOST` | 127.0.0.1 | Redis 地址 |
| `REDIS_PORT` | 6379 | Redis 端口 |
| `RENDER_CONCURRENCY` | 3 | 最大并发渲染数 |

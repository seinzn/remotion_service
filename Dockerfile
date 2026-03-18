FROM docker.1ms.run/node:20-bookworm

# 安装 Chromium、FFmpeg 和中文字体
RUN apt-get update && apt-get install -y \
    chromium \
    ffmpeg \
    fonts-noto-cjk \
    fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*

# Remotion 使用系统 Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV REMOTION_CHROME_EXECUTABLE=/usr/bin/chromium

WORKDIR /app

COPY package*.json ./
RUN npm install --production=false

COPY . .

# 编译 TypeScript
RUN npx tsc --skipLibCheck

EXPOSE 13926

CMD ["node", "dist/server/index.js"]

# 发布指南

## 概览

| 应用 | 仓库 | 部署方式 | 服务器目录 |
|------|------|---------|-----------|
| grounded-glow（主应用） | 新 repo，需新建 CI/CD | Docker + ECR + GitHub Actions | 待创建 |
| light-blog-fe（blog 前端） | 已有 CI/CD | push main 自动部署 | `$DEPLOY_DIR`（secrets 配置） |
| light-blog（Java 后端） | 已有 CI/CD | push main 自动部署 | `$DEPLOY_DIR`（secrets 配置） |
| japa-flow（japaflow 前端） | 已有 CI/CD | push main 自动部署 | `/home/ubuntu/japaflow` |

---

## 发布顺序

**重要：有依赖关系，必须按顺序发布。**

0. **数据库建表** — 先执行，light-blog 后端启动依赖这些表
1. **light-blog（Java 后端）** — 先发，因为新增了 `/api/japaflow/*` 接口，japa-flow 前端依赖它
2. **light-blog-fe（blog 前端）** — auth 通信逻辑改了，需要与主应用配合
3. **japa-flow（japaflow 前端）** — auth-bridge + CORS + 路由同步
4. **grounded-glow（主应用）** — 最后发，等子应用都就绪

---

## Step 0: 数据库建表（japaflow 学习进度表）

本次 light-blog 后端新增了 japaflow 学习进度模块，需要在数据库中创建 9 张表。

**环境信息（来自 light-blog 的 docker-compose.yml）：**
- MySQL 容器名：`light-blog-mysql`
- 数据库名：`techblog`（由 `MYSQL_DATABASE` 环境变量决定）
- 应用账号：`light_blog` / `light_blog_password`（由 `DB_USERNAME` / `DB_PASSWORD` 决定）

**建表脚本：** `japa-flow/jf_schema_init.sql`（已提交到 japa-flow 仓库）

> **注意：** 该脚本通过 git 提交并随 GitHub Actions 部署到服务器，但**不会自动执行**。MySQL 的 `docker-entrypoint-initdb.d` 只在首次初始化空数据库时执行，当前数据库已有数据，因此需要**手动执行一次建表**。

**手动执行步骤（仅首次需要，SSH 到服务器后）：**

```bash
# japa-flow 部署完成后，SQL 文件已在服务器上
# 从 japaflow 容器所在目录或直接从服务器上找到 SQL 文件

# 方式一：直接将 SQL 传入 MySQL 容器执行
sudo docker exec -i light-blog-mysql mysql -u light_blog -plight_blog_password techblog < /tmp/jf_schema_init.sql

# 如果文件不在服务器上，先从本地上传
scp ~/Documents/personal-projects/japa-flow/jf_schema_init.sql your-server:/tmp/
```

> 所有建表语句使用 `CREATE TABLE IF NOT EXISTS`，可安全重复执行。

**新增的表（共 9 张）：**

| 表名 | 用途 |
|------|------|
| `jf_word_learning` | 单词学习记录（状态、正确率、发音评分） |
| `jf_grammar_practice` | 语法练习记录 |
| `jf_sentence_practice` | 句子朗读练习记录 |
| `jf_exercise_result` | 课后练习结果 |
| `jf_wrong_book` | 错题本 |
| `jf_interaction_progress` | 交互进度（发音状态、跳过标记） |
| `jf_study_time` | 各模块学习时长统计 |
| `jf_favorite` | 收藏（单词/句子快照） |
| `jf_lesson_preference` | 课程偏好设置（声音、语速等） |

**验证建表成功：**
```bash
sudo docker exec light-blog-mysql mysql -u light_blog -plight_blog_password -e "USE techblog; SHOW TABLES LIKE 'jf_%';"
# 应看到 9 张 jf_ 前缀的表
```

---

## Step 1: 发布 light-blog（Java 后端）

```bash
cd ~/Documents/personal-projects/light-blog

# 检查改动
git status
git diff

# 提交
git add src/main/java/com/example/demo/japaflow/
git add src/main/java/com/example/demo/DemoApplication.java
git add src/main/java/com/example/demo/config/RedisConfig.java
git add src/main/java/com/example/demo/service/impl/ArticleServiceImpl.java
git add src/main/resources/application.properties
git add docs/JapaFlow-PRD-v0.2.0-learning-progress-api.md

git commit -m "feat: add japaflow learning progress API module"

# push 触发 GitHub Actions 自动构建部署
git push origin main
```

**验证：** GitHub Actions 跑完后，SSH 到服务器确认接口正常：
```bash
# 快速验证：返回 401 即说明接口已部署、鉴权生效
curl -s http://localhost:8081/api/japaflow/progress/summary
# 预期输出：{"code":401,"data":null,"message":"未登录或 Token 已失效"}

# 深度验证：带 token 请求，确认接口能正常返回数据
TOKEN=$(curl -s -X POST http://localhost:8081/api/users/login \
  -H 'Content-Type: application/json' \
  -d '{"account":"你的用户名","password":"你的密码"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8081/api/japaflow/progress/summary
# 预期输出：{"code":200,"data":...}
```

---

## Step 2: 发布 light-blog-fe（blog 前端）

```bash
cd ~/Documents/personal-projects/light-blog-fe

# 检查改动
git status
git diff

# 提交
git add -A
git commit -m "feat: centralize auth to main app, add auth-bridge and route sync"

# push 触发自动部署
git push origin main
```

**注意事项：**
- `NEXT_PUBLIC_MAIN_APP_URL` 在 `src/lib/constants.ts` 中 production 默认值为 `https://groundedglow.cc`，确认域名正确
- 如果需要覆盖，在 Dockerfile build-args 中添加 `NEXT_PUBLIC_MAIN_APP_URL`

**验证：** 直接访问 blog 域名（如 blog.groundedglow.cc），点击「登录」按钮应跳转到 groundedglow.cc/login

---

## Step 3: 发布 japa-flow（japaflow 前端）

**部署架构（与 light-blog 类似）：**
- GitHub Actions 构建 Docker 镜像 → 推送到 ECR（`japaflow/japaflow-fe:latest`）
- 服务器上 docker-compose 位于 `/home/ubuntu/japaflow/docker-compose.yml`
- 容器名：`japaflow-fe`，映射端口 `8091:80`（Nginx + Node.js server）
- 环境变量：`AZURE_SPEECH_KEY`、`AZURE_SPEECH_REGION`（通过 GitHub Secrets 注入）

```bash
cd ~/Documents/personal-projects/japa-flow

# 检查改动
git status
git diff

# 提交
git add auth-bridge.js index.html server.mjs styles.css app.js
git add jf_schema_init.sql
git add JapaFlow-PRD-v0.2.0-learning-progress-api.md
git add JapaFlow-PRD-v0.2.0-frontend-integration.md

git commit -m "feat: auth bridge, learning progress sync, CORS support"

# push 触发 GitHub Actions 自动构建部署
# CI 流程：构建镜像 → 推送 ECR → SCP docker-compose.yml → SSH 执行 docker compose pull + up
git push origin main
```

**CI/CD 自动执行的操作：**
1. 构建 Docker 镜像并推送到 `115908659860.dkr.ecr.ap-northeast-2.amazonaws.com/japaflow/japaflow-fe:latest`
2. 上传 `deploy/docker-compose.yml` 到服务器 `/home/ubuntu/japaflow/`
3. SSH 到服务器执行 `docker compose pull` + `docker compose up -d --force-recreate`

**验证：** 访问 japaflow 域名，应能看到登录提示 modal，点击「前往登录」跳转到 groundedglow.cc/login

**注意：** 部署完成后，如果是首次创建 japaflow 表，需要回到 Step 0 手动执行建表 SQL

---

## Step 4: 发布 grounded-glow（主应用）— 需要新建 CI/CD

### 4.1 创建 ECR 仓库

```bash
aws ecr create-repository \
  --repository-name grounded-glow/grounded-glow-fe \
  --region ap-northeast-2
```

### 4.2 创建 Dockerfile

在 grounded-glow 根目录创建 `Dockerfile`（参考 light-blog-fe 的结构，同为 Next.js standalone）：

```dockerfile
# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --prefer-offline --no-audit --progress=false

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
USER nextjs
CMD ["node", "server.js"]
```

**前提：** `next.config.ts` 中需要添加 `output: 'standalone'`。

### 4.3 创建 GitHub Actions workflow

创建 `.github/workflows/deploy.yml`：

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

env:
  IMAGE_NAME: grounded-glow/grounded-glow-fe
  AWS_REGION: ${{ secrets.AWS_REGION }}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ${{ steps.login-ecr.outputs.registry }}/${{ env.IMAGE_NAME }}:latest
            ${{ steps.login-ecr.outputs.registry }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Deploy on server
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          port: ${{ secrets.SERVER_PORT }}
          script: |
            set -e
            cd /home/ubuntu/grounded-glow
            export AWS_ACCESS_KEY_ID="${{ secrets.AWS_ACCESS_KEY_ID }}"
            export AWS_SECRET_ACCESS_KEY="${{ secrets.AWS_SECRET_ACCESS_KEY }}"
            export AWS_DEFAULT_REGION="${{ secrets.AWS_REGION }}"
            aws ecr get-login-password --region "${{ secrets.AWS_REGION }}" | sudo docker login --username AWS --password-stdin "${{ steps.login-ecr.outputs.registry }}"
            sudo docker compose pull
            sudo docker compose up -d --no-build --force-recreate
            sudo docker image prune -f
```

### 4.4 创建服务器上的 docker-compose

> **注意端口：** light-blog-fe 当前占用宿主机 3000 端口，grounded-glow 使用 3002 端口避免冲突。

SSH 到服务器，创建目录和 compose 文件：

```bash
ssh your-server

mkdir -p /home/ubuntu/grounded-glow
cat > /home/ubuntu/grounded-glow/docker-compose.yml << 'EOF'
name: grounded-glow

services:
  frontend:
    image: 115908659860.dkr.ecr.ap-northeast-2.amazonaws.com/grounded-glow/grounded-glow-fe:latest
    container_name: grounded-glow-fe
    restart: unless-stopped
    ports:
      - "3002:3000"
EOF
```

### 4.5 配置 GitHub Secrets

在 grounded-glow 的 GitHub repo Settings → Secrets 中配置：

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`（如 `ap-northeast-2`）
- `SERVER_HOST`
- `SERVER_USER`
- `SERVER_PORT`
- `SERVER_SSH_KEY`

这些值与其他项目相同，直接复用。

### 4.6 配置 Nginx（服务器上）

**当前服务器端口占用：**

| 端口 | 服务 | Nginx 配置文件 |
|------|------|---------------|
| 3000 | light-blog-fe | `/etc/nginx/sites-available/light-blog` |
| 8081 | light-blog API | `/etc/nginx/sites-available/light-blog` |
| 8090 | attention | `/etc/nginx/sites-available/attention.groundedglow.cc` |
| 8091 | japaflow | `/etc/nginx/sites-available/japaflow.groundedglow.cc` |

**本次域名指向变更：**

| 域名 | 改造前 | 改造后 | 端口 |
|------|--------|--------|------|
| `groundedglow.cc` | light-blog-fe (3000) | **grounded-glow 主应用 (3002)** | 3002 |
| `blog.groundedglow.cc` | 不存在 | **light-blog-fe (3000)** | 3000 |

**Nginx 配置归属原则：** 配置文件跟着应用走。

| 配置文件 | 管理域名 | 说明 |
|---------|---------|------|
| `/etc/nginx/sites-available/light-blog` | `blog.groundedglow.cc` | 原文件，改 server_name |
| `/etc/nginx/sites-available/grounded-glow` | `groundedglow.cc` | 新建，引用已有 SSL 证书 |

> **操作原则：** 每一步都用 `nginx -t` 验证，出错不会影响线上（Nginx 不会 reload 坏配置）。

---

**Step 1：新建 grounded-glow 配置（不动现有文件，零风险）**

```bash
sudo vi /etc/nginx/sites-available/grounded-glow
```

内容（引用已有的 `groundedglow.cc` SSL 证书，`/api/` 继续代理到 Java 后端）：

```nginx
server {
    listen 443 ssl;
    server_name groundedglow.cc www.groundedglow.cc;

    ssl_certificate /etc/letsencrypt/live/groundedglow.cc/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/groundedglow.cc/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location /api/ {
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name groundedglow.cc www.groundedglow.cc;
    return 301 https://$host$request_uri;
}
```

创建软链（暂不 reload，等 Step 2 一起做）：

```bash
sudo ln -s /etc/nginx/sites-available/grounded-glow /etc/nginx/sites-enabled/
```

---

**Step 2：修改 light-blog 配置（改 server_name，让出 groundedglow.cc）**

```bash
sudo vi /etc/nginx/sites-available/light-blog
```

改动点（共 3 处，全部是 `server_name`）：

```nginx
# 改前（HTTPS server 块）
server_name groundedglow.cc www.groundedglow.cc ;

# 改后
server_name blog.groundedglow.cc;
```

```nginx
# 改前（HTTP → HTTPS 重定向块里的 if 判断）
if ($host = groundedglow.cc) {

# 改后
if ($host = blog.groundedglow.cc) {
```

```nginx
# 改前（HTTP server 块）
server_name groundedglow.cc www.groundedglow.cc ;

# 改后
server_name blog.groundedglow.cc;
```

其余内容（`/api/` 代理 8081、`/` 代理 3000）保持不变。

---

**Step 2.5：修改 japaflow.groundedglow.cc 的 Nginx 配置**

japaflow 容器内的 `server.mjs` 代理 `/api/japaflow/*` 到 `127.0.0.1:8081`，但容器内的 `127.0.0.1` 是容器自身，不是宿主机。需要在宿主机 Nginx 层直接代理到 Java 后端。

```bash
sudo vi /etc/nginx/sites-available/japaflow.groundedglow.cc
```

在 HTTPS server 块中，**在 `location /` 之前**添加 `/api/japaflow/` 代理（注意：只代理 `/api/japaflow/`，不能用 `/api/`，否则会拦截 server.mjs 自身的 `/api/frontend-config`、`/api/audio/*` 等接口）：

```nginx
    location /api/japaflow/ {
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:8091;
        # ... 已有配置保持不变
    }
```

---

**Step 3：验证并生效**

```bash
# 检查配置语法
sudo nginx -t

# 通过后 reload（不中断现有连接）
sudo systemctl reload nginx
```

---

**Step 4：为 blog.groundedglow.cc 申请 SSL 证书**

旧的 SSL 证书是 `groundedglow.cc` 的，`blog.groundedglow.cc` 需要新证书：

```bash
sudo certbot --nginx -d blog.groundedglow.cc
```

> **Cloudflare 注意：** 如果 `blog.groundedglow.cc` 在 Cloudflare 开启了代理（橙色云朵），certbot 的 HTTP-01 验证会失败。两种解决方式：
> - 方式一：临时关闭 Cloudflare 代理（改为 DNS only / 灰色云朵），申请完再开
> - 方式二：直接使用 Cloudflare 的 SSL（Full 模式），不需要 certbot

---

**Step 5：验证 certbot 续期配置**

旧的 `groundedglow.cc` 证书续期配置可能引用了 `light-blog` 文件名，确认续期正常：

```bash
# 查看续期配置
sudo cat /etc/letsencrypt/renewal/groundedglow.cc.conf

# 确认 server 指向已更新为 grounded-glow（如果仍指向 light-blog 需要手动改）
# 查找这一行：
# server = /etc/nginx/sites-available/light-blog
# 改为：
# server = /etc/nginx/sites-available/grounded-glow

# 测试续期
sudo certbot renew --dry-run
```

### 4.7 提交并发布

```bash
cd ~/Documents/personal-projects/grounded-glow

# 确保 next.config.ts 有 output: 'standalone'
# 添加所有文件
git add -A
git commit -m "feat: main portal app with micro-frontend architecture"

# 推送到 GitHub（需要先创建远程 repo）
git remote add origin git@github.com:tangyefei/grounded-glow.git
git push -u origin main
```

---

## DNS 配置

确保以下域名解析到 AWS 服务器 IP：

| 域名 | 指向 |
|------|------|
| `groundedglow.cc` | 服务器 IP |
| `blog.groundedglow.cc` | 服务器 IP（如果子应用独立访问需要） |
| `japaflow.groundedglow.cc` | 服务器 IP（如果子应用独立访问需要） |

---

## 发布后验证清单

- [ ] `groundedglow.cc` — 主页加载正常
- [ ] `groundedglow.cc/login` — 登录页面正常
- [ ] `groundedglow.cc/blog` — iframe 加载 blog 子应用
- [ ] `groundedglow.cc/japaflow` — iframe 加载 japaflow 子应用
- [ ] 登录后访问 `/blog/dashboard/articles` — 文章列表正常加载
- [ ] 登录后访问 `/japaflow` — 学习进度能同步
- [ ] blog 子应用点击「登录」→ 跳转主应用 login → 登录后跳回
- [ ] japaflow 独立访问点「前往登录」→ 跳转主应用 login → 登录后跳回
- [ ] token 过期后操作 → 自动跳转到主应用登录页

---

## 回滚

如果某个应用部署后有问题，SSH 到服务器回滚：

```bash
# 回滚到上一个镜像（以 light-blog-fe 为例）
cd $DEPLOY_DIR
sudo docker compose pull frontend  # 如果 latest 标签已被覆盖，用 sha tag
sudo docker compose up -d --no-build frontend

# 或者指定具体版本
sudo docker run -d --name light-blog-fe-rollback \
  -p 3001:3000 \
  115908659860.dkr.ecr.ap-northeast-2.amazonaws.com/light-blog/light-blog-fe:<之前的sha_tag>
```

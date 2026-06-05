# 架构决策记录

## 背景

grounded-glow 是个人门户站点（groundedglow.cc），需要整合多个独立子应用：

- **light-blog-fe**：博客前端（Next.js App Router）
- **japa-flow**：日语学习应用（Vanilla JS + Node.js server）
- **light-blog**：共享 Java 后端（Spring Boot），同时服务 blog 和 japaflow 的 API

核心需求：**统一登录入口在主应用，子应用通过主应用获取登录态。**

---

## 技术选型

### 最终方案：iframe + postMessage

子应用通过 iframe 嵌入主应用，登录态通过 postMessage 同步。

### 为什么不用 qiankun / wujie / micro-app

这三个主流微前端框架的原理都是：fetch 子应用 HTML → 提取 script → 在沙箱中重放。

Next.js App Router 使用 RSC 流式传输，通过 inline `<script>` 标签逐步推送数据（`nextServerDataCallback`）。这些 script 被微前端框架拦截后在沙箱中执行时上下文丢失，导致：

- `Connection closed`
- `missing bootstrap script`
- `Cannot enqueue a chunk into a readable stream that is closed`

实际验证过 wujie，确认不可用。qiankun、micro-app 原理相同，同样不兼容。

这些框架适用于传统 CSR 应用（CRA、Vite + React/Vue），不支持 Next.js App Router。

### 为什么不用 Next.js Multi-zones

Multi-zones 是 Next.js 官方的多应用组合方案，本质是 `rewrites`（反向代理）：

```ts
rewrites() {
  return [{ source: '/blog/:path*', destination: 'http://blog:3001/blog/:path*' }]
}
```

优点：同域 cookie 自动共享登录态，不需要 postMessage。

不适用的原因：
1. japa-flow 不是 Next.js，Multi-zones 只支持 Next.js 互相组合
2. 子应用需要配置 `basePath`，所有路由前缀变化，独立运行也必须带前缀
3. 跨 zone 导航是整页刷新

如果将来 japa-flow 也迁移到 Next.js，可以重新评估此方案。

### 为什么不用 Module Federation

Module Federation 用于跨应用共享组件/模块，不能嵌入完整应用。适合「从 A 应用引用 B 应用的某个组件」，不适合「把整个 B 应用嵌入 A」。

### 为什么不用纯 Nginx 代理

Nginx 只做请求转发，各应用之间没有通信机制。无法实现「主应用登录后，子应用获取登录态」的需求。除非配合 shared cookie（要求同域名），但那仍然需要统一的登录跳转逻辑。

---

## 当前架构

```
groundedglow.cc（主应用 - Next.js）
├── /login, /register — 统一登录注册入口
├── /blog/* — iframe 加载 blog.groundedglow.cc
├── /japaflow/* — iframe 加载 japaflow.groundedglow.cc
└── / — 个人主页

通信协议（postMessage）：
├── AUTH_READY   — 子应用加载完成，请求主应用发送 token
├── AUTH_SYNC    — 主应用将 token + user 下发给子应用
├── AUTH_EXPIRED — 子应用 401 或用户点击登录，通知主应用跳转登录页
└── ROUTE_CHANGE — 子应用路由变化，同步到主应用地址栏
```

### 登录态流程

1. 用户在主应用 `/login` 登录 → token 存入主应用 localStorage
2. 访问 `/blog/*` 或 `/japaflow/*` → iframe 加载子应用
3. 子应用发送 `AUTH_READY` → 主应用回复 `AUTH_SYNC` 带 token
4. 子应用存入自己的 localStorage → API 请求带 `Authorization: Bearer` header
5. token 过期 → 后端返回 401 → 子应用发送 `AUTH_EXPIRED` → 主应用跳转 `/login`

### 竞态处理（light-blog-fe）

iframe 加载后子应用立即发起 API 请求，可能在 AUTH_SYNC 到达前就收到 401。

解决方案：`auth-sync.ts` 维护一个 `pending` 标记，在 AUTH_SYNC 到达前抑制 401 跳转。AUTH_SYNC 到达后清除标记并 `invalidateQueries()` 让所有请求重发。

---

## 架构优缺点

### 优点

- 子应用技术栈完全自由（Next.js + Vanilla JS 混用）
- 子应用可独立运行、独立部署
- iframe 隔离性强，CSS/JS 互不干扰
- 统一登录入口，token 由主应用管理

### 缺点

- postMessage 通信有时序复杂度（AUTH_READY/AUTH_SYNC 握手）
- iframe 内子应用是完整 document，内存开销略大
- iframe 内容对搜索引擎不可见（SEO 不友好）
- 子应用和主应用的主题/样式不共享

### 已知限制

- 子应用独立访问时（如直接访问 blog.groundedglow.cc），登录操作会跳转到主应用域名完成，之后跳回
- 子应用在 iframe 内时，浏览器地址栏通过 `history.replaceState` 同步，刷新页面能保持路径

---

## 后续可能的演进

1. **japa-flow 迁移到 Next.js** → 可改用 Multi-zones + shared cookie，去掉 iframe 和 postMessage
2. **shared cookie 替代 postMessage** → 生产环境同域名（*.groundedglow.cc）下 cookie 自动共享，可简化 auth 通信
3. **SSO 服务** → 如果应用数量增长，可以抽出独立的 auth 服务

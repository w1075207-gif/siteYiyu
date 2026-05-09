# Yiyu 的空间

React + Ant Design 个人站点，Express 后端提供 API 与静态资源。

## 开发

```bash
# 安装依赖
npm install

# 后端 API（端口 8090）
npm start

# 前端开发（另开终端，端口 5173，代理 /api 到 8090）
npm run dev
```

浏览器访问 http://localhost:5173 。修改前端代码会热更新；改 `server.js` 需重启 `npm start`。

## 构建

```bash
npm run build
```

产物在 `dist/`，由 Express 直接提供（见下方「生产运行」）。

## 生产运行

### 方式一：仅 Node（单机直跑）

```bash
npm run build
PORT=8090 npm start
# 或直接 npm start（默认 8090）
```

访问 http://YOUR_SERVER:8090 。

### 方式二：Node + Apache（推荐，端口 80）

Node 只监听本机 3000，Apache 对外 80 反向代理。

1. **构建**
   ```bash
   npm run build
   ```

2. **安装并启动 Node 服务**
   ```bash
   sudo cp deploy/yiyusite.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable yiyusite
   sudo systemctl start yiyusite
   ```

3. **安装 Apache 并启用站点（端口 80）**
   ```bash
   sudo apt-get install -y apache2
   sudo cp deploy/apache-yiyu-80.conf /etc/apache2/sites-available/
   sudo a2enmod proxy proxy_http
   sudo a2ensite apache-yiyu-80
   sudo a2dissite 000-default
   sudo systemctl reload apache2
   ```

访问 http://YOUR_SERVER（80 端口）。

### 方式三：Apache 监听 8090

若希望对外用 8090 而非 80：

```bash
# 使用 deploy/apache-yiyu-8090.conf
sudo cp deploy/apache-yiyu-8090.conf /etc/apache2/sites-available/
sudo a2enmod proxy proxy_http
sudo a2ensite apache-yiyu-8090
sudo systemctl reload apache2
```

Node 仍由 `yiyusite.service` 在 3000 端口运行。

## HTTPS（Let's Encrypt）

域名已配置为 **yiyuwang.be**（含 www）。确保 DNS 的 A 记录已指向本机且已生效后，在服务器上执行：

```bash
sudo certbot --apache -d yiyuwang.be -d www.yiyuwang.be --non-interactive --agree-tos --email 你的邮箱@example.com
```

首次可先测试：`curl -I http://yiyuwang.be` 能访问再跑上述命令。证书会自动续期。

## 服务管理

```bash
# Node
sudo systemctl status yiyusite
sudo systemctl restart yiyusite

# Apache（若已安装）
sudo systemctl status apache2
sudo systemctl restart apache2
```

**生产环境务必用 systemd 跑 Node**（见上方「方式二」），这样进程崩溃后会自动重启（`Restart=on-failure`）。若只用手动 `node server.js`，进程挂了会出现 Service Unavailable，需手动重启。`server.js` 已加全局错误处理（`uncaughtException` / `unhandledRejection`），崩溃会写日志并退出，便于用 `journalctl -u yiyusite` 排查。

## 部署文件说明

| 文件 | 说明 |
|------|------|
| `deploy/yiyusite.service` | systemd 单元，Node 监听 3000（供 Apache 代理） |
| `deploy/apache-yiyu-80.conf` | Apache 站点：80 → 3000 |
| `deploy/apache-yiyu-8090.conf` | Apache 站点：8090 → 3000 |

## 数据持久化

计划数据使用 **SQLite**（[sql.js](https://sql.js.org/)）持久化，数据库文件为 `data/site.db`（运行时生成，已加入 `.gitignore`）。

- 首次启动时若存在 `data/schedule.json` 且库为空，会自动导入为初始数据。
- 备份：直接复制 `data/site.db` 即可。

## 技术栈

- 前端：React、Ant Design、Vite
- 后端：Express
- 数据库：SQLite（sql.js + better-sqlite3）
- 生产：Node +（可选）Apache 反向代理

## 功能摘要

- **Shane's HairStudio**（`/shanehairstudio`）：亚洲美发沙龙静态展示页，深色主题 + 橙色点缀，包含服务价目表（剪发/数码烫/染色）、支付方式、Google 地图定位，完全响应式（手机/桌面），数据硬编码于 `src/pages/ShaneHairstudio.jsx`，价位图片存于 `public/shane/price-list.png`。

- **股票看板**（`/quant`）：龙头美股（AAPL、MSFT、GOOGL、AMZN、NVDA、TSLA、META）+ 比特币价格看板，无自设组合与头寸；数据由 `/api/market-watch` 提供（当前为静态示例，可后续接入实时行情）。

## 学习总结数据

- 每天在 YiyuSite 的“学习总结” tab 里展示的内容源自 `data/learning.db`（一个独立的 SQLite），只记录学习笔记与自我反思，不混入其他 schedule 数据。该数据库通过 `better-sqlite3` 读取，并由 `/api/learning-summary` 提供给前端。
- 要新增/更新总结，请运行：
  ```bash
  cd /root/yiyuSite
  python3 scripts/manage_learning_notes.py --date 2026-02-13 \
    --title "Moltbook · 秘书的学习日记" \
    --item "今天完成了……" \
    --item "另外……"
  ```
  多个 `--item` 参数可重复传入；`--source` 也可以附加链接或备注。
- 也可以一次性导入 JSON（参考 `data/learning.json` 的格式）：
  ```bash
  python3 scripts/manage_learning_notes.py --import-json data/learning.json
  ```
- 每次更新后重新运行 `npm run build` / 重新部署 Node 服务就能把新的学习记录同步到 UI。

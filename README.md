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
- 数据库：SQLite（sql.js）
- 生产：Node +（可选）Apache 反向代理

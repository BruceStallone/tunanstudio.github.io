这份指南将带你从零开始，把你基于 Vite + Rollup 开发的原生前端项目部署到 GitHub Pages，并绑定自定义域名。
第一阶段：项目配置调整
在部署到 GitHub Pages 之前，必须解决“路径问题”。
1. 修改 vite.config.js
如果你打算部署在 https://<用户名>.github.io/<项目名>/ 这种二级目录下，你需要配置 base 路径。但如果你后面要绑定独立域名，base 通常设置为 /。
code
JavaScript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  // 如果你最终用独立域名（如 www.yourdomain.com），这里写 '/'
  // 如果你只用 github 默认地址（如 username.github.io/repo/），这里写 '/repo/'
  base: '/', 
  build: {
    outDir: 'dist',
  }
});
2. 确保你的 index.html 在根目录
Vite 默认以项目根目录下的 index.html 为入口。
第二阶段：使用 GitHub Actions 实现自动化部署
这是目前最专业的方法，每次你 git push 代码，GitHub 会自动帮你构建并发布。
1. 在项目根目录创建文件夹
路径：.github/workflows/deploy.yml（注意前面的点）。
2. 写入以下配置内容：
code
Yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ] # 当 main 分支有变动时触发

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist # Vite 构建后的输出目录
          branch: gh-pages # 部署到 gh-pages 分支
第三阶段：购买域名
你需要一个独一无二的地址。
推荐注册商：
国外： Cloudflare (推荐，自带免费 SSL 和 CDN)、Namesilo、Namecheap。
国内： 阿里云、腾讯云（需要实名认证，国内访问略快）。
选购建议： 首选 .com，其次是 .net、.me 或 .io。
购买流程： 搜索域名 -> 加入购物车 -> 支付 -> 进入域名管理控制台。
第四阶段：配置域名解析 (DNS)
这一步是将你的域名指向 GitHub 的服务器。
登录你的域名管理控制台（以 Cloudflare/阿里云为例）。
找到 DNS 解析设置。
添加以下 4 条 A 记录（GitHub 的官方 IP 地址）：
类型：A，主机记录：@，记录值：185.199.108.153
类型：A，主机记录：@，记录值：185.199.109.153
类型：A，主机记录：@，记录值：185.199.110.153
类型：A，主机记录：@，记录值：185.199.111.153
再添加 1 条 CNAME 记录（为了让 www 也能访问）：
类型：CNAME，主机记录：www，记录值：<你的用户名>.github.io
第五阶段：GitHub 仓库设置
将你的代码推送到 GitHub：
code
Bash
git init
git add .
git commit -m "feat: initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
等待 Actions 运行： 点击 GitHub 仓库顶部的 Actions 选项卡，确保那个工作流跑完了（变绿）。
设置 Pages：
进入仓库的 Settings -> Pages。
Build and deployment: Source 选择 Deploy from a branch。
Branch: 选择 gh-pages 分支（这是 Actions 自动生成的），目录选择 / (root)。
绑定域名：
在同一页面的 Custom domain 框中，输入你买的域名（如 yourdomain.com），点击 Save。
GitHub 会自动在你的代码仓库生成一个 CNAME 文件。
勾选 Enforce HTTPS（可能需要等几分钟解析生效后才能勾选）。
第六阶段：进阶配置（保持域名持久化）
非常重要： 每次 Actions 部署可能会覆盖 GitHub 自动生成的 CNAME 文件。为了防止域名失效，请在你的项目 public 文件夹下新建一个名为 CNAME 的文件（无后缀），内容只写你的域名：
code
Text
yourdomain.com
因为 public 文件夹里的内容在构建时会被原封不动地复制到 dist。
总结：你的最终访问路径
开发： 运行 npm run dev (Vite 提供服务)。
更新： 执行 git push。
自动化： GitHub Actions 捕获推送 -> Node 环境安装依赖 -> npm run build (Rollup 压缩) -> 推送到 gh-pages 分支。
上线： 访问 https://yourdomain.com 即可看到结果。
常见问题排查：
白屏： 检查控制台报错。通常是 vite.config.js 里的 base 路径不对，导致 CSS/JS 引发 404。
DNS 没生效： 全球生效需要 1-24 小时，可以用终端命令 nslookup yourdomain.com 查看返回的 IP 是不是 GitHub 的。
部署后没有样式： 确保你的静态资源（图片等）放在 public 目录下，并使用绝对路径 /logo.png 引用。
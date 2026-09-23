# Vercel 部署说明

本游戏是可直接发布的静态 HTML、CSS、JavaScript 项目。根目录的 `vercel.json` 已设置框架、构建、安装及输出目录，Vercel 导入 GitHub 仓库后会读取这些参数。

## 导入设置

导入仓库：`MyLittleShrimp/Moon-Chase-Adventure-by-LittleShrimp`。

| 设置项 | 值 |
| --- | --- |
| Git Branch / 生产分支 | `main` |
| Framework Preset | `Other` |
| Root Directory | 仓库根目录，保持 `./` |
| Build Command | 空字符串，跳过构建 |
| Install Command | 空字符串，跳过安装 |
| Output Directory | `dist` |
| Environment Variables | 不需要 |

配置文件中的 `framework: null` 对应界面里的 Other。若手动填写界面，需要打开 Build Command 和 Install Command 的 Override 开关，再将输入框留空。输出目录填 `dist`；根目录不再填写 `dist`，避免叠成 `dist/dist`。

## 为什么这样配置

`dist/index.html` 就是可发布的游戏入口，全部运行素材位于 `dist/assets/`。项目没有需要安装的第三方依赖，也没有需要生成的构建产物。

`npm start` 和 `server.js` 供本地试玩使用，Vercel 直接托管 `dist/`。不要把 `npm start` 填到 Build Command 中，它会启动一个持续运行的本地服务器，无法完成构建步骤。

只发布 `dist/` 后，README、开发工具、测试页、宣传片和截图仍保留在 GitHub 仓库中，不会成为游戏网站的公开文件路径。

## 发布与更新

1. 选择已登录的 Vercel 工作区，导入上述 GitHub 仓库。
2. 确认设置与表格一致，点击 Deploy。
3. 等部署状态变为 Ready，打开 Vercel 分配的生产地址。
4. 检查开场动画、首帧封面、音乐、角色对话及小游戏。
5. 接入 Git 仓库后，后续推送到生产分支可由 Vercel 自动部署。

Vercel 会为部署提供访问地址，首次上线无需先购买自定义域名。存档依照网站地址保存在玩家浏览器中；从旧站点切换到新地址时，旧存档不会自动迁移。

## 常见问题

- **打开后 404**：检查 Output Directory 是否为 `dist`，Root Directory 是否保留仓库根目录。
- **一直停留在构建中**：确认 Build Command 没有填写 `npm start`，应跳过构建。
- **提示找不到构建脚本**：确认 Framework Preset 为 Other，并使用仓库内的 `vercel.json`。
- **手机没有声音**：浏览器通常需要先点击开始；再确认游戏的 ♪ 按钮处于开启状态。

参考：[Vercel 构建配置](https://vercel.com/docs/builds/configure-a-build)、[vercel.json 配置说明](https://vercel.com/docs/project-configuration/vercel-json)。

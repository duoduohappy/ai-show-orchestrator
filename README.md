# 演出自动化项目

独立面试作品 v0.3，支持本机运行并已准备 Render 部署配置。当前使用虚构业务数据；没有连接银行、真实 HR 决策或实体舞台设备。

## 启动和入口

要求 Node.js 24 或更高版本。执行 npm ci --ignore-scripts，然后 npm start。本机地址 http://127.0.0.1:8788/。当前工作区也可以执行 Start-Local.ps1 复用已下载的模型运行时。

默认入口为“真实演出闭环”。本机操作员密码 demo123!，Render 使用 SHOW_OPERATOR_PASSWORD。新闭环与旧版浏览器设备模拟器分开显示。

当前电脑已安装专用 OBS 33.0.1 便携环境，场景集合 Interview。OBS 凭据只在本机 .env 中，未打包进源码。其他电脑需要自行安装 OBS、开启鉴权 WebSocket，并创建专用 Interview 场景集合；配置后由准备操作创建本项目场景。

## 已实现

- AI 导演草案及格式校验；服务端 cue 时间轴、排练预检、发布锁定、自动或手动执行。
- obs-websocket-js 连接真实 OBS：场景切换、媒体状态、输出截图与回读。样板包含三段真实 MP4。
- SQLite 保存节目、操作键、指令和回执；重复请求不重复前进，失败暂停，丢失回执可通过状态回读确认，服务重启默认暂停。
- Render 云端通过 HTTP 队列接收本机网关的出站轮询；网关缓存素材并校验 SHA256，在本机控制 OBS。

预演素材由 FFmpeg 程序渲染，不是 AI 视频。灯光和调音尚未接入专业组件，实体摄像机也未接入。“机位”表示 OBS 虚拟场景。ComfyUI 适配代码保留，但未部署和验证真实生成模型。

## 测试

npm test
npm run test:live

控制器单元测试使用明确的测试夹具。evidence/real-show-e2e.json 是真实 OBS 自动演出的记录；gateway-e2e.json 是本机模拟 Render 拓扑的真实网关联调记录。

evidence/real-obs-demo.mp4 是对真实 OBS 输出进行截图采样再合成的无音频样片，不是全帧 OBS 原生录制。

## 交付说明

- docs/DEMO.md：面试演示步骤。
- docs/ARCHITECTURE.md：架构、选型、成本和边界。
- docs/TEST-REPORT.md：测试结果和证据。
- DEPLOY-RENDER.md：Render 部署配置和限制。

可选执行 npm run test:e2e 对运行中的本机服务做端到端验证；该测试会新增虚构业务或操作真实 OBS。演出测试还需要 ffmpeg。npm run backup 使用 SQLite 在线备份接口保存一致快照到 DATA_DIR/backups。

源码包不包含 node_modules、.env、运行中的数据库、OBS 安装目录或模型权重。不要将本机配置文件提交到公开仓库。

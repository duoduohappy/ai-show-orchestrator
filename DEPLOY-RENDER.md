# 演出自动化的 Render 部署

本项目已准备 render.yaml，并通过 Render 官方 JSON Schema 结构校验；尚未在 Render 上部署。配置按“本项目单独一个 Git 仓库、仓库根目录为当前目录”编写。两个项目各自导入各自的 Blueprint，不共用数据库或部署身份。

## 服务配置

运行时 Node.js 24.21.0，构建命令 npm ci --omit=dev --ignore-scripts，启动命令 npm start，健康检查 /api/health。绑定 HOST=0.0.0.0，并使用 Render 注入的 PORT。

默认 Blueprint 已切换为免费 Web Service，服务名 ai-show-orchestrator，plan=free，不挂载磁盘。SQLite 和集成日志写入 DATA_DIR=/tmp/ai-show-orchestrator。该版本用于面试展示；休眠唤醒、服务重启或重新部署后，新增单据、资料、会话、节目版本和执行记录可能丢失。管理端会重新载入完整测试数据，演出端会恢复默认样板。页面会持续显示临时数据提示。本机运行的数据库持久化能力保持不变。

Render 官方说明：https://render.com/docs/free 。免费服务闲置约十五分钟可能休眠，首次唤醒可能等待约一分钟。免费实例时数和用量限额由同一 workspace 共享；两个项目并非各自独享额度。

## 模型配置

默认模型变量为空，创建 Blueprint 时不强制填写模型密钥。你可以先免费部署并体验业务和控制界面，再在 Render 设置可从云端访问的 AI_BASE_URL、AI_MODEL、AI_API_KEY。Render 免费托管不代表模型供应商的推理调用免费。AI_PROVIDER 默认 compatible，接口需支持 /chat/completions；管理项目的资料分析使用 JSON Schema 结构化输出，需选用支持该格式的服务。

本机 127.0.0.1:8790 不能直接被 Render 访问。当前源码包不在 Render 上启动 Windows llama.cpp 或下载模型；若要自托管模型，应另外准备可访问的模型服务。未配置时页面可以展示业务流程，但 AI 请求会明确失败，不会返回伪造成功结果。

## 部署步骤

1. 将本项目源码推送到你自己的独立 Git 仓库，保留根目录 render.yaml。
2. 取消旧的付费弹窗，刷新或重新导入 Blueprint，名称可填 ai-show-orchestrator；确认实例为 Free 且没有磁盘。
3. 等待服务部署成功；需要真实 AI 时，再配置模型地址、模型名及密钥。
4. 访问 /api/health，再按本项目演示步骤验证数据和权限。
5. 检查页面上的临时数据提示；重启后重新登录，并确认基准测试数据或默认节目能恢复。不要用此配置验收长期数据保留。

PUBLIC_HOST 可用于自定义域名；未设置时采用 Render 提供的外部主机名。同源校验不接受任意网页来源。

## 本机 OBS 网关

Render 运行网页、API、SQLite 和指令队列；OBS 仍运行在你的电脑。不要把 Windows OBS 压缩包上传到 Render 运行，也不需要给本机开放公网入站端口。

Blueprint 生成 SHOW_OPERATOR_PASSWORD 与 GATEWAY_TOKEN。前者用于网页登录，后者只供本机网关使用，不能发到前端。

1. 在本机项目目录复制 .env.gateway.example 为 .env.gateway。
2. 设置 SHOW_SERVER_URL 为已部署服务的 HTTPS 地址。
3. 从 Render 复制同一份 GATEWAY_TOKEN 到本机配置。
4. 配置本机 OBS_URL、OBS_PASSWORD 和 SHOW_MEDIA_BASE_URL。
5. 启动专用 OBS Interview 场景集合，然后执行 npm run gateway。
6. 网页操作员登录后，准备场景、预检、发布并开演。

网关会从部署服务下载三段演示素材，依据 manifest.json 校验 SHA256 后缓存在本机 data/gateway-media/。轮询命令使用 Bearer 鉴权，回执需要匹配命令租约。网关断开或超时会暂停演出；恢复必须回读实际场景。

当前网关是互联网控制演示，不保证舞台级实时性。公开云部署关闭测试故障按钮。网页可以在网关离线时展示报告，但不能控制未连接的 OBS。

## 备份

可在具备服务端维护权限的终端执行 npm run backup，使用 SQLite 在线备份接口创建一致快照。本机仍可备份；免费 Render 实例没有 Shell 访问和持久磁盘，不能把此命令当成云端持久保留方案。复制运行中的主数据库文件而忽略 WAL 不是可靠备份方式。

## 可选升级

以后确需跨重启保留新增记录，可以改为支持持久磁盘的付费服务，挂载 /var/data 并设置 DATA_DIR=/var/data，同时移除 DEMO_MODE=ephemeral。当前默认配置不会创建该付费磁盘。

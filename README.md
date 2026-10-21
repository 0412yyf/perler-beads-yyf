# 拼豆底稿生成器（本地部署版）

基于开源项目 [Zippland/perler-beads](https://github.com/Zippland/perler-beads) 修改的本地工具版：修复透明图缺失、新增画布尺寸调整与图片裁剪，支持本地运行出图。

## 环境要求

- [Node.js](https://nodejs.org/) 18.18 或更高版本（建议 20 LTS）

## 本地部署

```bash
# 1. 克隆仓库
git clone https://github.com/0412yyf/perler-beads-yyf.git
cd perler-beads-yyf

# 2. 安装依赖
npm install

# 3. 启动开发模式
npm run dev
```

浏览器打开 <http://localhost:3000> 即可使用。

## 生产模式（可选）

日常使用推荐生产模式，速度更快、不热更新：

```bash
npm run build
npm run start
```

同样访问 <http://localhost:3000>。

## 常用功能

| 功能 | 说明 |
|------|------|
| 图片转拼豆图纸 | 上传图片 → 可先裁剪 → 自动映射色号 |
| 画布尺寸调整 | 生成后按目标板子尺寸增减行列（九宫格锚点） |
| 导出 | 带色号图纸 PNG / 采购清单 / CSV 数据 |

## 自定义品牌

水印、标题、来源标识统一在 `src/utils/brandConfig.ts` 中配置，改一处全局生效；导出图纸二维码可放置 `public/brand_qrcode.png` 后在 `BRAND_QRCODE_PATH` 中启用。

## 许可

本项目基于 AGPL-3.0 协议开源，沿用原项目许可。

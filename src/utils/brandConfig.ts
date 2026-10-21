// ============================================
// 品牌配置 — 改成你自己的小红书账号名即可全局生效
// ============================================
// 使用说明：
// 1. 把 BRAND_NAME 改为你的小红书昵称（不带 @）
// 2. 把 public/website_qrcode.png 替换为你自己的二维码图片
// 3. 导出图纸上的水印、标题、来源标识会自动同步更新

export const BRAND_NAME = '歪歪飞拼好豆';

// 导出图纸主标题（网格上方的大标题）
export const BRAND_TITLE = BRAND_NAME;

// 网格左上角的简短水印
export const BRAND_WATERMARK = `@${BRAND_NAME}`;

// 采购清单里的来源标识
export const BRAND_SOURCE_TEXT = `图纸来源：小红书@${BRAND_NAME}`;

// 浏览器标签页标题
export const BRAND_PAGE_TITLE = `${BRAND_NAME}拼豆底稿生成器 | Perler Beads Generator`;

// 完成庆祝卡片（可保存分享的图片）上的品牌行
export const BRAND_CARD_TITLE = `${BRAND_NAME}拼豆底稿生成器`;

// 完成庆祝卡片上的来源行（原为旧版网站网址）
export const BRAND_CARD_SOURCE = `小红书 @${BRAND_NAME}`;

// 导出图纸右上角二维码图片路径（放在 public/ 目录下；留空 '' 则导出图完全不带二维码）
// 想加自己的小红书二维码：把图片存为 public/brand_qrcode.png，然后把值改为 "/brand_qrcode.png"
export const BRAND_QRCODE_PATH = '';


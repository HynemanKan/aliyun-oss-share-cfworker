# 阿里云OSS文件分享 Cloudflare Worker实现

<p align="center">
 <a href="README_EN.md">English</a> | 中文 
</p>

基于 Cloudflare Worker 的阿里云 OSS 文件分享系统，提供简单易用的文件分享功能，支持密码保护和链接过期时间设置。

## 功能特点

- 基于 Cloudflare Worker 部署，无需服务器
- 支持阿里云 OSS 对象存储
- 文件分享链接支持密码保护
- 自定义分享链接过期时间
- 支持 TOTP 双因素认证登录，后快捷创建分享链接
- 响应式 Vue 3 前端界面
- 使用 TypeScript 开发，类型安全

## 技术栈

- 前端：Vue 3 + TypeScript + Naive UI
- 后端：Cloudflare Worker + TypeScript
- 存储：阿里云 OSS
- 构建工具：Vite
- 部署工具：Wrangler

## 安装与配置

### 前提条件

- Node.js 环境
- Yarn 包管理器
- 阿里云 OSS 账号和 Bucket
- Cloudflare 账号

### 安装依赖

```bash
yarn
```

### 配置 Wrangler

1. 复制 `wrangler.example.jsonc` 为 `wrangler.jsonc`

```bash
cp wrangler.example.jsonc wrangler.jsonc
```

2. 编辑 `wrangler.jsonc` 文件，配置以下参数：

```jsonc
{
  // ... 其他配置 ...
  
  "kv_namespaces": [
    {
      "binding": "OSS_SHARE_ID",
      "id": "你的KV命名空间ID"
    }
  ],
  
  "vars": {
    "ALIYUN_OSS_END_POINT": "oss-<region>.aliyuncs.com",  // 替换为你的阿里云OSS地域节点
    "ALIYUN_OSS_BUCKET": "你的Bucket名称",
    "ALIYUN_OSS_REGION": "你的地域",
    "DOWNLOAD_LINK_TIMEOUT": "3600"  // 下载链接有效期（秒）
  }
}
```

3. 设置敏感信息为 Cloudflare Worker 密钥（不要直接写在配置文件中），本地调试放置在 `.dev.vars` 文件中，遵循dotenv格式

```bash
wrangler secret put ADMIN_PASSWORD
# 输入管理员密码

wrangler secret put TOTP_SECRET
# 输入TOTP密钥（用于双因素认证）

wrangler secret put ALIYUN_OSS_AK
# 输入阿里云AccessKey ID

wrangler secret put ALIYUN_OSS_AS
# 输入阿里云AccessKey Secret
```

### 创建 KV 命名空间

```bash
wrangler kv:namespace create OSS_SHARE_ID
```

将输出的 ID 复制到 `wrangler.jsonc` 的 `kv_namespaces` 配置中。

## 开发与部署

### 本地开发

```bash
yarn dev
```

### 本地预览（包含 Worker 功能）

```bash
yarn preview
```

### 构建并部署到 Cloudflare

```bash
yarn deploy
```

## 使用方法

1. 管理员登录：访问应用首页，使用配置的管理员密码和 TOTP 验证码登录
2. 创建分享链接：上传文件到阿里云 OSS，然后在应用中创建分享链接，设置密码和过期时间
3. 分享给他人：将生成的链接分享给他人，对方需要输入密码才能访问和下载文件
4. 文件下载：用户通过链接访问，输入密码后可以查看文件信息并下载

## 定时任务

系统配置了定时任务（每6小时执行一次），用于清理过期的分享链接：

```
"triggers": {
  "crons": [
    "0 */6 * * *"
  ]
}
```

## 注意事项

- 敏感信息（密码、密钥等）应使用 Cloudflare Worker 的 Secret 功能存储，不要硬编码在配置文件中
- 确保阿里云 OSS 的 Bucket 权限配置正确，建议使用专门的 AccessKey 并限制其权限

## 开发者

如需扩展支持其他对象存储服务，可以实现 `OssStorage` 接口：

```typescript
export interface OssStorage {
  getFileInfo(uri: string): Promise<FileInfo>
}
```

然后在 `file.ts` 控制器中添加相应的处理逻辑。


## 贡献
欢迎贡献代码和建议。请在 GitHub 上创建 Issue 或 Pull Request。

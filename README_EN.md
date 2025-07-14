# Aliyun OSS File Sharing with Cloudflare Worker

<p align="center">
 English | <a href="README.md">中文 </a>
</p>

A file sharing system for Aliyun OSS based on Cloudflare Worker, providing simple and easy-to-use file sharing functionality with password protection and link expiration settings.

## Features

- Deployed on Cloudflare Worker, no server required
- Support for Aliyun OSS object storage
- Password protection for file sharing links
- Customizable sharing link expiration time
- TOTP two-factor authentication login for quick creation of sharing links
- Responsive Vue 3 frontend interface
- Developed with TypeScript for type safety

## Tech Stack

- Frontend: Vue 3 + TypeScript + Naive UI
- Backend: Cloudflare Worker + TypeScript
- Storage: Aliyun OSS
- Build Tool: Vite
- Deployment Tool: Wrangler

## Installation and Configuration

### Prerequisites

- Node.js environment
- Yarn package manager
- Aliyun OSS account and Bucket
- Cloudflare account

### Install Dependencies

```bash
yarn
```

### Configure Wrangler

1. Copy `wrangler.example.jsonc` to `wrangler.jsonc`

```bash
cp wrangler.example.jsonc wrangler.jsonc
```

2. Edit the `wrangler.jsonc` file and configure the following parameters:

```jsonc
{
  // ... other configurations ...
  
  "kv_namespaces": [
    {
      "binding": "OSS_SHARE_ID",
      "id": "your KV namespace ID"
    }
  ],
  
  "vars": {
    "ALIYUN_OSS_END_POINT": "oss-<region>.aliyuncs.com",  // Replace with your Aliyun OSS region endpoint
    "ALIYUN_OSS_BUCKET": "your Bucket name",
    "ALIYUN_OSS_REGION": "your region",
    "DOWNLOAD_LINK_TIMEOUT": "3600"  // Download link validity period (seconds)
  }
}
```

3. Set sensitive information as Cloudflare Worker secrets (don't write them directly in the configuration file). For local debugging, place them in the `.dev.vars` file following the dotenv format

```bash
wrangler secret put ADMIN_PASSWORD
# Enter administrator password

wrangler secret put TOTP_SECRET
# Enter TOTP secret key (for two-factor authentication)

wrangler secret put ALIYUN_OSS_AK
# Enter Aliyun AccessKey ID

wrangler secret put ALIYUN_OSS_AS
# Enter Aliyun AccessKey Secret
```

### Create KV Namespace

```bash
wrangler kv:namespace create OSS_SHARE_ID
```

Copy the output ID to the `kv_namespaces` configuration in `wrangler.jsonc`.

## Development and Deployment

### Local Development

```bash
yarn dev
```

### Local Preview (including Worker functionality)

```bash
yarn preview
```

### Build and Deploy to Cloudflare

```bash
yarn deploy
```

## Usage

1. Administrator Login: Visit the application homepage, log in using the configured administrator password and TOTP verification code
2. Create Sharing Links: Upload files to Aliyun OSS, then create sharing links in the application, setting passwords and expiration times
3. Share with Others: Share the generated links with others; recipients need to enter a password to access and download files
4. File Download: Users access through the link, and after entering the password, they can view file information and download

## Scheduled Tasks

The system is configured with a scheduled task (executed every 6 hours) to clean up expired sharing links:

```
"triggers": {
  "crons": [
    "0 */6 * * *"
  ]
}
```

## Notes

- Sensitive information (passwords, keys, etc.) should be stored using Cloudflare Worker's Secret feature, not hardcoded in configuration files
- Ensure that the Aliyun OSS Bucket permissions are configured correctly; it's recommended to use a dedicated AccessKey with limited permissions

## For Developers

To extend support for other object storage services, you can implement the `OssStorage` interface:

```typescript
export interface OssStorage {
  getFileInfo(uri: string): Promise<FileInfo>
}
```

Then add the corresponding handling logic in the `file.ts` controller.

## Contribution
Contributions of code and suggestions are welcome. Please create Issues or Pull Requests on GitHub.

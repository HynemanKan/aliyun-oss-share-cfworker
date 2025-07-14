// src/worker-impl.ts

// 引入我们自己的 polyfill
import * as httpPolyfill from './http-polyfill';

// 手动注入全局 http 模块（模拟 Node.js 行为）
declare global {
    var http: typeof httpPolyfill;
}

globalThis.http = httpPolyfill;



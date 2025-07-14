// src/http-polyfill.ts

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

interface RequestOptions {
    method?: HttpMethod;
    hostname: string;
    port?: number;
    path: string;
    protocol?: string;
    headers?: Record<string, string>;
    body?: string;
}

interface IncomingMessage {
    statusCode: number;
    headers: Headers;
    on(event: string, callback: (chunk?: any) => void): void;
}

export const request = (
    options: RequestOptions,
    callback: (res: IncomingMessage) => void
) => {
    const url = new URL(`${options.protocol || 'https:'}//${options.hostname}:${options.port || (options.protocol === 'https:' ? 443 : 80)}${options.path}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s 超时

    fetch(url.toString(), {
        method: options.method || 'GET',
        headers: options.headers || {},
        body: options.body,
        signal: controller.signal,
    })
        .then(async (response) => {
            clearTimeout(timeoutId);

            const reader = response.body?.getReader();
            let done = false;

            const incomingMessage: IncomingMessage = {
                statusCode: response.status,
                headers: response.headers,
                on(event, callback) {
                    if (event === 'data' && reader) {
                        (async () => {
                            while (!done) {
                                const { value, done: isDone } = await reader.read();
                                if (isDone) break;
                                callback(value);
                            }
                        })();
                    } else if (event === 'end') {
                        callback();
                    }
                },
            };

            callback(incomingMessage);
        })
        .catch((err) => {
            console.error('Fetch error:', err);
        });
};

export default { request };

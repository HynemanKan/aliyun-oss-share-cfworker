import OSS from "ali-oss"
import {OssStorage, type FileInfo, UploadInfo} from "./types";


export class AilyunOss implements OssStorage {
    private officialClient:OSS
    constructor(private readonly env:{
        ALIYUN_OSS_END_POINT: string;
        ALIYUN_OSS_BUCKET: string;
        ALIYUN_OSS_REGION: string;
        ALIYUN_OSS_AK: string;
        ALIYUN_OSS_AS: string;
    },private readonly linkTimeout:number) {
        this.officialClient = new OSS({
            accessKeySecret:env.ALIYUN_OSS_AS,
            accessKeyId:env.ALIYUN_OSS_AK,
            region:env.ALIYUN_OSS_REGION,
            bucket:env.ALIYUN_OSS_BUCKET,
            endpoint:env.ALIYUN_OSS_END_POINT,
            secure:true,
            authorizationV4: true,
        })
    }

    async getFileInfo(uri: string):Promise<FileInfo> {
        try {
            const now = new Date();
            const ossDate = now.toISOString().replace(/\.\d{3}Z$/, 'Z');
            const headers: Record<string, string> = {
                'x-oss-date': ossDate,
                'x-oss-content-sha256': 'UNSIGNED-PAYLOAD',
            };

            const authorization = this.officialClient.authorizationV4(
                'HEAD',
                { headers, queries: { objectMeta: '' } },
                this.env.ALIYUN_OSS_BUCKET,
                uri,
                ['x-oss-content-sha256']
            );

            const url = `https://${this.env.ALIYUN_OSS_BUCKET}.${this.env.ALIYUN_OSS_END_POINT}/${uri}?objectMeta`;
            const response = await fetch(url, {
                method: 'HEAD',
                headers: {
                    ...headers,
                    'Authorization': authorization,
                },
            });

            if (!response.ok) {
                throw new Error(`HEAD request failed: ${response.status} ${response.statusText}`);
            }

            const strCreateTime = response.headers.get('last-modified');
            const updateTime = strCreateTime ? new Date(strCreateTime).valueOf() : now.valueOf();
            const fileSize = Number(response.headers.get('content-length'));
            const urlSplit = uri.split('/');
            const fileName = urlSplit[urlSplit.length - 1];

            const downloadUrl = await this.officialClient.signatureUrlV4("GET", this.linkTimeout, {
                headers: {}
            }, uri);

            return {
                updateTime,
                fileSize,
                fileName,
                downloadLink: downloadUrl,
                timeout: this.linkTimeout,
            };
        } catch(err) {
            console.log(err);
            throw new Error("no such file");
        }
    }

    async getTempUploadLink(uri: string): Promise<UploadInfo> {
        console.log({
            "host":this.env.ALIYUN_OSS_END_POINT,
            "content-type": 'application/octet-stream'
        });
        try{
            const url = await this.officialClient.signatureUrlV4(
                "PUT",1600,{
                    headers:{
                        "host":this.env.ALIYUN_OSS_END_POINT,
                        "content-type": 'application/octet-stream'
                    }
                },uri
            )
            return {
                uploadLink:url,
                timeout:this.linkTimeout,
            }
        }catch(err){
            throw new Error("get upload temp url error");
        }
    }



}

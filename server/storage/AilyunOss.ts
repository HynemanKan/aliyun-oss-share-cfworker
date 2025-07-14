import OSS from "ali-oss"
import {OssStorage,type FileInfo} from "./types";
import {OssClient} from "../client/AliyunOssClient";



export class AilyunOss implements OssStorage {
    private officialClient:OSS
    private client:OssClient
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
        })
        this.client = new OssClient(
            env.ALIYUN_OSS_AK,
            env.ALIYUN_OSS_AS,
            env.ALIYUN_OSS_REGION,
            env.ALIYUN_OSS_BUCKET,
            env.ALIYUN_OSS_END_POINT
        );
    }

    async getFileInfo(uri: string):Promise<FileInfo> {
        try {
            const res = await this.client.getMeta(uri);
            console.log(res);
            const url = this.officialClient.signatureUrl(uri,{
                expires:this.linkTimeout
            })
            return {
                ... res,
                downloadLink: url,
                timeout: this.linkTimeout,
            };
        }catch(err){
            console.log(err);
            throw new Error("no such file");
        }
    }


}

import OSS from "ali-oss"
import {OssStorage, type FileInfo, UploadInfo} from "./types";
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
            secure:true,
            authorizationV4: true,
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
            // const url = await  this.officialClient.signatureUrlV4(uri,{
            //     expires:this.linkTimeout,
            //
            // })

            const url = await this.officialClient.signatureUrlV4("GET",this.linkTimeout,{
                headers: {

                }
            },uri);
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

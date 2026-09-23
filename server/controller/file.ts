import {router} from "../router";
import {ARG_ERROR, AUTH_ERROR, SUCCESS} from "../utils/responseBody";

import {fileSignSchema} from "../schema/FileSignSchema";
import {fileSchema, preUploadSchema} from "../schema/fileSchema";
import {AilyunOss} from "../storage/AilyunOss";


router.post('/api/v1/file/preUpload',async ({req,env}) => {
    const typeCheckRes = preUploadSchema.validate(await req.json());
    if(typeCheckRes.error){
        return Response.json({
            ...ARG_ERROR,
            message:typeCheckRes.error.message,
        })
    }
    const data = typeCheckRes.value;
    const path = data.path;

    const client = new AilyunOss(env,Number(env.DOWNLOAD_LINK_TIMEOUT));
    const res =  await client.getTempUploadLink(path);
    return Response.json({
        ...SUCCESS,
        ...res
    });
})


router.post('/api/v1/file/sign', async ({req,env}) => {
    const typeCheckRes = fileSignSchema.validate(await req.json());
    if(typeCheckRes.error){
        return Response.json({
            ...ARG_ERROR,
            message:typeCheckRes.error.message,
        });
    }
    const data = typeCheckRes.value;
    const file_id = crypto.randomUUID();
    await env.OSS_SHARE_ID.put(file_id,JSON.stringify(data));
    return Response.json({
        ...SUCCESS,
        fileToken:file_id,
    });
})

router.post('/api/v1/file', async ({req,env}) => {
    const typeCheckRes = fileSchema.validate(await req.json());
    if(typeCheckRes.error){
        console.log(typeCheckRes.error.message);
        return Response.json({
            ...ARG_ERROR,
            message:typeCheckRes.error.message,
        });
    }
    const data = typeCheckRes.value;
    const kvData = await env.OSS_SHARE_ID.get(data.token, "text");
    if(!kvData){
        console.warn("get file info failed",data.token)
        return Response.json({
            ...ARG_ERROR,
            "msg": "link is expired"
        })
    }
    let decodeData:any;
    try{
         decodeData= JSON.parse(kvData);
    }catch(e){
        return Response.json({
            ...ARG_ERROR,
            "msg": "link is broken"
        })
    }
    const fileInfoCheckRes = fileSignSchema.validate(decodeData);
    if(fileInfoCheckRes.error){
        console.warn("file info decode failed",data.token,kvData);
        return Response.json({
            ...ARG_ERROR,
            "msg": "link is expired"
        });
    }
    const fileInfo = fileInfoCheckRes.value;
    if(data.password != fileInfo.password){
        console.log("password is invalid",data.token)
        return Response.json({
            ...AUTH_ERROR,
            "msg": "password not match"
        });
    }
    if(Date.now() >fileInfo.timeExpired){
        env.OSS_SHARE_ID.delete(data.token);
        console.log("remove expired kvSet")
        return Response.json({
            ...ARG_ERROR,
            "msg": "link is expired"
        });
    }
    let fileDetail;
    if(fileInfo.ossType == "aliyun"){
        const client = new AilyunOss(env,Number(env.DOWNLOAD_LINK_TIMEOUT));
        fileDetail = await client.getFileInfo(fileInfo.fileUri);
    }
    if(!fileDetail){
        return Response.json({
            ...ARG_ERROR,
            "msg": "oss type unsupported"
        })
    }
    return Response.json({
        ...SUCCESS,
        fileInfo:fileDetail,
    })
})

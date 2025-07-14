import crypto from "crypto";

const toUTC_ISO8601 = (time:Date)=>{
    return `${toUTC_Date(time)}T`+
        time.getUTCHours().toString().padStart(2,"0")+
        time.getUTCMinutes().toString().padStart(2,"0")+
        time.getUTCSeconds().toString().padStart(2,"0")+ `Z`;
}
const toUTC_Date = (time:Date)=>{
    return `${time.getUTCFullYear()}`+
    (time.getUTCMonth()+1).toString().padStart(2,"0")+
        time.getUTCDate().toString().padStart(2,"0")
}



const buildCanonicalRequest = (val: {
    method: string,
    bucket?: string,
    fileUri?: string,
    query: { [key: string]: string },
    headers: { [key: string]: string },
    additionalHeaders:string[],
    timestamp: Date
}) => {
    let canonicalUri: string = "/";
    if (val.bucket) {
        canonicalUri += val.bucket + "/";
        if (val.fileUri) {
            canonicalUri +=  encodeURIComponent(val.fileUri);
        }
    }
    const encodeQuery: { [key: string]: string } = {};
    for (let queryKey in val.query) {
        encodeQuery[encodeURIComponent(queryKey)] = encodeURIComponent(val.query[queryKey]);
    }
    const queryPair: string[] = [];
    console.log(encodeQuery);
    for (let encodeQueryKey of Object.keys(encodeQuery).sort()) {
        console.log(encodeQuery[encodeQueryKey]);
        if (encodeQuery[encodeQueryKey].length == 0) {
            queryPair.push(`${encodeQueryKey}`);
        } else {
            queryPair.push(`${encodeQueryKey}=${encodeQuery[encodeQueryKey]}`);
        }
    }
    const canonicalQuery = queryPair.join("&");
    val.headers["x-oss-date"] = toUTC_ISO8601(val.timestamp);
    val.additionalHeaders.push("x-oss-content-sha256");
    val.additionalHeaders.sort()
    const additionalHeaders = val.additionalHeaders.join(";");
    val.headers["x-oss-content-sha256"] = "UNSIGNED-PAYLOAD";
    const encodeHeader: string[] = [];
    for (let headerKey of Object.keys(val.headers).sort()){
        encodeHeader.push(`${headerKey.toLowerCase()}:${val.headers[headerKey].trim()}\n`);
    }
    const canonicalHeader = encodeHeader.join("");
    return `${val.method.toUpperCase()}\n` +
        `${canonicalUri}\n` +
        `${canonicalQuery}\n` +
        `${canonicalHeader}\n` +
        `${additionalHeaders}\n` +
        `UNSIGNED-PAYLOAD`
}

const buildStringToSign = (val: {
    timestamp: Date,
    region:string,
    canonicalRequest:string
}) => {
    const timeStamp = toUTC_ISO8601(val.timestamp);
    const signDate = toUTC_Date(val.timestamp);
    const scope = `${signDate}/${val.region}/oss/aliyun_v4_request`;
    const hashVal = crypto.createHash('sha256').update(val.canonicalRequest).digest('hex')
    return `OSS4-HMAC-SHA256\n${timeStamp}\n${scope}\n${hashVal}`;
}

const genSign = (val:{
    sk:string,
    timestamp:Date,
    region:string,
    stringToSign:string
})=>{
    const signDate = toUTC_Date(val.timestamp);
    const signingDate = crypto.createHmac('sha256', `aliyun_v4${val.sk}`).update(signDate).digest();
    const signingRegion = crypto.createHmac('sha256', signingDate).update(val.region).digest();
    const signingOss = crypto.createHmac('sha256', signingRegion).update("oss").digest();
    const signingKey = crypto.createHmac('sha256', signingOss).update('aliyun_v4_request').digest();
    return  crypto.createHmac('sha256', signingKey).update(val.stringToSign).digest('hex');
}

export  class OssClient {
    private readonly host;
    constructor(
        private readonly ak:string,
        private readonly as:string,
        private readonly region:string,
        private readonly bucket:string,
        private readonly endpoint:string,
    ){
        this.host = `https://${bucket}.${endpoint}`
    }

    public async getMeta(uri:string){
        const signTime = new Date(Date.now());
        const header = {};
        const query = {
            "objectMeta":""
        }
        const additionalHeader:string[]=[];
        const canonicalRequest = buildCanonicalRequest({
            method: 'HEAD',
            bucket:this.bucket,
            fileUri:uri,
            query:query,
            headers: header,
            additionalHeaders: additionalHeader,
            timestamp:signTime,
        })
        const stringToSign = buildStringToSign({
            timestamp:signTime,
            region:this.region,
            canonicalRequest:canonicalRequest,
        })
        const sign = genSign({
            sk:this.as,
            timestamp:signTime,
            region:this.region,
            stringToSign:stringToSign,
        })
        const url = new URL(uri+"?objectMeta",this.host);
        const signDate = toUTC_Date(signTime);
        const authorizationString = `OSS4-HMAC-SHA256`+
            ` Credential=${this.ak}/${signDate}/${this.region}/oss/aliyun_v4_request,`+
            ` AdditionalHeaders=${additionalHeader.join(";")}, Signature=${sign}`
        const response = await fetch(url,{
            method:'HEAD',
            headers:{
                ...header,
                Authorization:authorizationString,
            },
        })
        if(!response.ok){
            throw Error(`Unexpected response from ${uri}`);
        }
        let updateTime:Date;
        const strCreateTime =response.headers.get("last-modified");
        if(strCreateTime){
            updateTime = new Date(strCreateTime);
        }else{
            updateTime = new Date();
        }
        const size = Number(response.headers.get("content-length"));
        const urlSplit = uri.split("/");
        return {
            updateTime:updateTime.valueOf(),
            fileSize:size,
            fileName:urlSplit[urlSplit.length-1],
        };
    }
}

import {verify, sign, JwtPayload} from "jsonwebtoken"
import {RouterRequest} from "@tsndr/cloudflare-worker-router";
export const jwtSign = (secret:string)=>{
    return sign({
        data:"admin"
    },secret,{
        algorithm:"HS256",
        expiresIn:"1D"
    })
}

export const jwtVerify = (token:string,secret:string):{jwt:string|JwtPayload|null,verify:boolean}=>{
    try{
        const jwt =verify(token,secret)
        return {
            jwt,
            verify:true
        }
    }catch(err){
        return {
            jwt:null,
            verify:true
        }
    }
}

export const authCheck = (req: RouterRequest<{}>,secret:string):{auth:boolean,msg:string,jwt: string | JwtPayload | null}=>{
    const data = req.headers.get("authorization");
    if(!data || data.length==0){
        return {
            auth:false,
            msg:"authorization not found.",
            jwt:null
        };
    }
    const parts = data.split(" ");
    if(parts.length!=2||parts[0] != "Bearer"){
        return {
            auth:false,
            msg:"authorization format error",
            jwt:null
        };
    }
    const {jwt,verify} = jwtVerify(parts[1],secret);
    if(!verify){
        return {
            auth:false,
            msg:"authorization failed.",
            jwt:null
        };
    }
    return {
        auth:true,
        msg:"authorization successfully",
        jwt:jwt,
    }
}

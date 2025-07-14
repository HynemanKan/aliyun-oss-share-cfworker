import { authAxios } from "@/api/_api";
import axios from "axios";

export const createShareLink = (fileUri:string,timeExpired:number,password:string,ossType:string)=>{
    return new Promise<string>((resolve, reject)=>{
        authAxios.post("/api/v1/file/sign",{
            fileUri,timeExpired,password,ossType
        }).then(data=>{
            if(data.data["code"]=="success"){
                const fileToken = data.data["fileToken"]
                if(fileToken){
                    resolve(fileToken);
                    return;
                }
            }
            reject(data.data["message"])
        }).catch(reject);
    })
}

export type FileInfo={
    fileSize:number
    fileName:string
    updateTime:number
    downloadLink:string
    timeout:number
}
export const getFileInfo = (token:string,password:string)=>{
    return new Promise<FileInfo>((resolve, reject)=>{
        axios.post("/api/v1/file",{
            token,password
        }).then(data=>{
            if(data.data["code"]=="success"){
                const file:FileInfo = data.data["fileInfo"]
                if(file){
                    resolve(file);
                    return;
                }
                console.log("file fail")
                reject(data.data["code"])
            }else{
                reject(data.data["code"])
            }
        }).catch(reject)
    })
}
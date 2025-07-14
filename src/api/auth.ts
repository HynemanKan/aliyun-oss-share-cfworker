import {authAxios, setToken} from "@/api/_api";
import axios from "axios";

export const authCheck = ()=>{
    return new Promise<void>((resolve, reject) => {
        authAxios.get("/api/v1/auth")
            .then(data=>{
                const res = data.data;
                //console.log(data,res);
                if(res["code"]=="success"){
                    resolve();
                    return;
                }
                reject("CALL API FAIL")
            }).catch(err=>{
                console.log(err);
                reject(err);
        })
    });
}

export const doLogin = (password:string,totp:string)=>{
    return new Promise<void>((resolve, reject)=>{
        axios.post("/api/v1/auth",{
            password,
            totp
        }).then(data=>{
            if(data.data["code"]=="success"){
                const token = data.data["token"]
                if(token){
                    setToken(token);
                    resolve();
                    return;
                }
            }
            reject(data.data["message"])
        }).catch(reject);
    })
}

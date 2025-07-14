import { authenticator } from 'otplib';

export const totpVerify = (token:string,secret:string)=>{
    console.log("token",token,secret);
    return authenticator.verify({ token, secret });
}

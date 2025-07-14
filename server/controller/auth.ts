import {router} from "../router";
import {ARG_ERROR, AUTH_ERROR,SUCCESS} from "../utils/responseBody";
import {totpVerify} from "../utils/totpUtils";
import {authCheck, jwtSign} from "../utils/wjtUtils";
import {authSchema} from "../schema/AuthSchema";

router.get('/api/v1/auth', ({req,env}) => {
    const {auth} = authCheck(req,env.SERVICE_SECRET)
    if(!auth){
        return Response.json(AUTH_ERROR);
    }
    return Response.json(SUCCESS);
})

router.post('/api/v1/auth',  async ({req, env}) => {
    const typeCheckRes = authSchema.validate(await req.json());
    if(typeCheckRes.error){
        return Response.json({
            ...ARG_ERROR,
            message:typeCheckRes.error.message,
        });
    }
    const data = typeCheckRes.value;
    if(data.password != env.ADMIN_PASSWORD){
        console.log("password is invalid")
        return Response.json(AUTH_ERROR);
    }
    if(!totpVerify(data.totp,env.TOTP_SECRET)){
        console.log("totp challenge fail")
        return Response.json(AUTH_ERROR);
    }
    return Response.json({
        ...SUCCESS,
        token:jwtSign(env.SERVICE_SECRET)

    })
})

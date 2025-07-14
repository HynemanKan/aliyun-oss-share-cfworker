import {Router} from "@tsndr/cloudflare-worker-router";
import {authCheck} from "./utils/wjtUtils";
import {AUTH_ERROR} from "./utils/responseBody";

export const router = new Router<Env, {}, {}>()

router.cors()

router.use(({req,env})=>{
    const url = new URL(req.url);
    if(url.pathname.endsWith("/api/v1/auth"))return;
    if(url.pathname.endsWith("/api/v1/file"))return;
    const {auth} = authCheck(req,env.SERVICE_SECRET)
    if(!auth){
        return Response.json(AUTH_ERROR);
    }
})



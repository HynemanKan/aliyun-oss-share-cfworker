
import {router} from "./router";
import "./controller/auth"
import "./controller/file"
import {fileSignSchema} from "./schema/FileSignSchema";

const cleanExpired = async (kv:KVNamespace)=>{
	let cursor:string|null = null;
	const needDel:string[] = [];
	while (true){
		const listRes:KVNamespaceListResult<never> = await kv.list({
			limit:20,
			cursor:cursor
		})
		for(let key of listRes.keys){
			const val = await kv.get(key.name);
			if(!val)continue;
			try{
				const data = JSON.parse(val);
				const res = fileSignSchema.validate(data);
				if(res.error)continue;
				if (Date.now()>res.value.timeExpired){
					needDel.push(key.name);
				}
			}catch(err){
				console.log("skipped key:",key.name);
			}
		}
		if(listRes.list_complete){
			break;
		}else {
			cursor = listRes.cursor;
		}
	}
	for (let key of needDel) {
		await kv.delete(key);
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		return router.handle(request, env, ctx)
	},
	async scheduled(
		controller: ScheduledController,
		env: Env,
		ctx: ExecutionContext,
	) {
		await cleanExpired(env.OSS_SHARE_ID);
	},
} satisfies ExportedHandler<Env>;

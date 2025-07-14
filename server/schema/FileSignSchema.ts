import Joi from "joi";

export const fileSignSchema = Joi.object<{
    fileUri:string,
    timeExpired:number,
    password:string,
    ossType:string
}>({
    fileUri: Joi.string().required(),
    timeExpired:Joi.number().required(),
    password: Joi.string().required(),
    ossType: Joi.string().required(),
})

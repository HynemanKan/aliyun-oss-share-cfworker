import Joi from "joi";

export const fileSchema = Joi.object<{
    token:string,
    password:string,
}>({
    token: Joi.string().required(),
    password: Joi.string().required(),
})

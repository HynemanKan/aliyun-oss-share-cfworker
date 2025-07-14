import axios from "axios"

export const authAxios = axios.create();

const _LOCAL_STORAGE_TOKEN_NAME = "auth_token";

authAxios.interceptors.request.use(config=>{
    const token = localStorage.getItem(_LOCAL_STORAGE_TOKEN_NAME);
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }else{
        return Promise.reject("TOKEN_NOT_FOUND")
    }
    return config;
},error => {return Promise.reject(error)});

export const setToken:(s:string)=>void=( s:string)=>{
    localStorage.setItem(_LOCAL_STORAGE_TOKEN_NAME,s);
}
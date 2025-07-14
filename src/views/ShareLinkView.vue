<template>
    <n-flex style="margin: 10px">
        <n-text style="font-size: 24px">
            OSS Share
        </n-text>
    </n-flex>
    <n-flex v-if="panel=='auth'" justify="center" vertical style="height: calc(100% - 40px)">
        <n-flex justify="center">
            <n-card title="auth" style="width: 700px">
                <n-flex vertical>
                    <n-flex>
                        <n-input
                                type="password"
                                show-password-on="click"
                                v-model:value="password"
                        />
                    </n-flex>
                    <n-flex justify="right">
                        <n-button type="success" @click="tryGetFile">
                            auth
                        </n-button>
                    </n-flex>
                </n-flex>
            </n-card>
        </n-flex>
    </n-flex>
    <n-flex v-else-if="panel=='expired'" justify="center" vertical style="height: calc(100% - 40px)">
        <n-flex justify="center">
            <n-gradient-text type="danger" size="50">
                link is expired
            </n-gradient-text>
        </n-flex>
    </n-flex>
    <n-flex v-else-if="panel=='download'" justify="center" vertical style="height: calc(100% - 40px)">
        <n-flex justify="center">
            <n-card content-style="padding: 0" style="width: 75vw">
                <n-flex>
                    <n-text style="font-size: 24px;margin: 10px 0 0 15px">{{fileInfo.fileName}}</n-text>
                </n-flex>
                <n-flex style="margin: 0 15px;">
                    <n-text depth="3">
                        <n-time :time="fileInfo.updateTime"/>
                    </n-text>
                    <n-text depth="3">
                        {{ fileSizeReadable(fileInfo.fileSize) }}
                    </n-text>
                </n-flex>
                <n-card style="width: calc(100% - 30px);margin: 15px;height: 60vh">
                    <n-flex justify="center" vertical style="height: 100%;">
                        <n-flex justify="center">
                            <n-icon :size="60">
                                <insert-drive-file-round/>
                            </n-icon>
                        </n-flex>
                        <n-flex justify="center">
                            {{fileInfo.fileName}}
                        </n-flex>
                    </n-flex>
                </n-card>
                <n-flex style="margin: 0 15px 10px 0" justify="right">
                    <n-text v-if="!linkTimeout" depth="3" style="line-height: 40px">
                        download link will be expired in
                        <n-countdown :duration="fileInfo.timeout*1000" @finish="linkTimeout=true"/>
                    </n-text>
                    <n-text v-else depth="3">
                        download link expired
                    </n-text>
                    <n-button
                        type="success"
                        :disabled="linkTimeout"
                        tag="a"
                        :href="fileInfo.downloadLink"
                        target="_blank"
                    >
                        <template #icon>
                            <n-icon>
                                <file-download-round/>
                            </n-icon>
                        </template>
                        download
                    </n-button>
                </n-flex>
            </n-card>
        </n-flex>
    </n-flex>
</template>

<style>

</style>
<script setup lang="ts">
import {onMounted, ref} from "vue";
import {NFlex, NCard, NText,NTime, NInput, NButton, NGradientText,NIcon,NCountdown, useNotification} from "naive-ui";
import {FileDownloadRound,InsertDriveFileRound} from "@vicons/material"
import {useRoute} from "vue-router";
import type {FileInfo} from "@/api/shareLink";
import {getFileInfo} from "@/api/shareLink";
const password = ref<string>("");
const route = useRoute();
const panel = ref<"auth"|"expired"|"download">("auth");

const notification = useNotification();
const linkTimeout = ref<boolean>(false);
const fileInfo=ref<FileInfo>({
    fileName:"",
    fileSize:0,
    downloadLink:"",
    timeout:0,
    updateTime:0
})

const tryGetFile = ()=>{
    if(password.value.length==0){
      notification.error({
        title:"input error",
        description:"password is not allowed to be empty",
        duration:1500
      })
      return;
    }
    getFileInfo(""+route.query["token"],password.value)
        .then(file=>{
            fileInfo.value=file
            panel.value='download'
        }).catch(err=>{
            console.log("auth fail", err)
            if(err=="VALUE_ERR"){
                panel.value='expired'
                return;
            }
            notification.error({
                title:"file read failed",
                description:"password not match or link is expired",
                duration:1500
            })
        })

}

const fileSizeReadable = (val:number)=>{
    if(val >1024*1024*1024*5){
        return (val/(1024*1024*1024*5)).toFixed(2)+"GB"
    }
    if(val >1024*1024*5){
        return (val/(1024*1024*5)).toFixed(2)+"MB"
    }
    if(val >1024*5){
        return (val/(1024*5)).toFixed(2)+"KB"
    }
    return val+"B"
}

onMounted(()=>{
    console.log(route.query)
    if(!route.query["token"]){
        panel.value='expired'
    }
    if(route.query["exp"]){
        if( Date.now() > Number(route.query["exp"])){
            console.log("expired",Number(route.query["exp"]),Date.now())
            panel.value='expired'
        }
    }else{
        console.log("no exp")
        panel.value='expired'
    }
    if(route.query["password"]){
        password.value = ""+ route.query["password"]
    }

})

</script>

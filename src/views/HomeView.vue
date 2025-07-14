<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {computed, onMounted, ref} from "vue";
import {
    NFlex, NGradientText, NSwitch,
    NText, NCard, useNotification,
    NFormItem, NForm, NButton,
    NInput, NDatePicker, NIcon,
    NModal, NQrCode
} from "naive-ui";
import {ShareFilled} from "@vicons/material"
import {authCheck} from "@/api/auth";
import {createShareLink} from "@/api/shareLink";

const router = useRouter()
const route = useRoute()
const adminOn = ref<boolean>(false)
const modeChecking = ref<boolean>(false);
const notification = useNotification();
const trySwitchAdminMode = (newVal:boolean)=>{
  if(!newVal)return;
  adminOn.value=false;
  modeChecking.value=true;
  authCheck()
    .then(()=>{
      adminOn.value=true;
      modeChecking.value=false;
    }).catch(()=>{
      notification.error({
          title:"admin not active",
          description:"jump to auth page",
          duration:1000
      });
      setTimeout(()=>{
          router.push('/login')
      },1500)
    })
}

const shareForm = ref({
    fileUri:"",
    timeExpired:Date.now()/1,
    password:"",
    ossType:"aliyun"
})

const showLinkModal = ref<boolean>(false);


const trySignUrl = ()=>{
    createShareLink(
        shareForm.value.fileUri,
        shareForm.value.timeExpired,
        shareForm.value.password,
        shareForm.value.ossType
    ).then((token)=>{
        console.log(token)
        fileToken.value=token;
        showLinkModal.value=true
    }).catch((err)=>{
        console.log(err)
        notification.error({
            title:"error",
            description:"api error"
        })
    })
}
const fileToken = ref<string>("");
const withPassword = ref<boolean>(false);
const shareLink= computed(()=>{
    const pageUrl = window.location.protocol+"//"+window.location.host+window.location.pathname
    const vuePath = "#/share"
    const args:{[key:string]:string} = {
        token:fileToken.value,
        exp:""+shareForm.value.timeExpired
    }
    if(withPassword.value){
        args["password"]=shareForm.value.password
    }
    const kvPairs:string[]=[]
    Object.keys(args).forEach((key)=>{
        kvPairs.push(key+"="+encodeURIComponent(args[key]))
    })
    return pageUrl+vuePath+"?"+kvPairs.join("&");
})

const toCopyBoard = (val:string)=>{
    navigator.clipboard.writeText(val);
    notification.success({
        title:"save to clipboard",
        duration:1000
    })
}

const nohistoryTime = (num:number)=>{
    return num < Date.now()
}

onMounted(()=>{
    if(route.query["admin"]=='t'){
        modeChecking.value=true;
        authCheck().then(()=>{
            modeChecking.value=false;
            adminOn.value=true;
        }).catch(err=>{
            notification.error({
                title:"admin not active",
                description:"jump to auth page",
                duration:1000
            });
            setTimeout(()=>{
                router.push('/login')
            },1500)
        })
    }
})

</script>

<template>
<div style="height: 100%;width: 100%">
  <n-flex justify="space-between" style="margin: 10px">
      <n-text style="font-size: 24px">
          {{adminOn?"OSS Share":""}}
      </n-text>
      <n-flex >
          <n-text>
              admin Mode
          </n-text>
          <n-switch
            v-model:value="adminOn"
            @update:value="trySwitchAdminMode"
            :loading="modeChecking"
          />
      </n-flex>
  </n-flex>
  <n-flex v-if="!adminOn" justify="center" style="height: calc(100% - 40px)">
    <n-flex vertical justify="center">
        <n-gradient-text type="primary" font-size="100px">
            OSS Share
        </n-gradient-text>
    </n-flex>
  </n-flex>
  <n-flex v-else justify="center" style="height: calc(100% - 40px)">
      <n-flex vertical justify="center">
          <n-card title="create share link" style="width: 600px;height: 500px">
              <n-flex vertical justify="space-between" style="height: 100%;">
                  <n-form size="large">
                      <n-form-item label="fileUrl" path="">
                          <n-input
                              placeholder="fileUrl"
                              v-model:value="shareForm.fileUri"
                          />
                      </n-form-item>
                      <n-form-item label="timeExpired" path="totp">
                          <n-date-picker
                              type="datetime"
                              placeholder="timeExpired"
                              v-model:value="shareForm.timeExpired"
                              clearable
                              :is-date-disabled="nohistoryTime"
                          />
                      </n-form-item>
                      <n-form-item label="access password">
                          <n-input
                              placeholder="access password"
                              type="password"
                              show-password-on="click"
                              v-model:value="shareForm.password"
                          />
                      </n-form-item>
                  </n-form>
                  <n-flex justify="right">
                      <n-button type="primary" @click="trySignUrl">
                          <template #icon>
                              <n-icon>
                                  <share-filled/>
                              </n-icon>
                          </template>
                          create
                      </n-button>
                  </n-flex>
              </n-flex>
          </n-card>
      </n-flex>
  </n-flex>
</div>
<n-modal
    v-model:show="showLinkModal"
    preset="card"
    title="share"
    style="width: 700px;height: 500px"
>
    <n-flex vertical style="height:100%">
        <n-flex justify="center">
            <n-qr-code
                :size="200"
                :value="shareLink"
            />
        </n-flex>
        <n-flex>
            <n-text>share with password</n-text>
            <n-switch
                v-model:value="withPassword"
            />
        </n-flex>
        <n-flex style="margin-top:10px">
            <n-text style="width: 75px">link:</n-text>
            <n-text style="word-break: break-all;width: calc(100% - 175px)">
                {{shareLink}}
            </n-text>
            <n-button type="primary" @click="toCopyBoard(shareLink)">copy</n-button>
        </n-flex>
    </n-flex>
</n-modal>
</template>

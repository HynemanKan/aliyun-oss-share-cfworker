<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {computed, onMounted, ref} from "vue";
import {
  NFlex, NGradientText, NSwitch,
  NText, NCard, useNotification,
  NFormItem, NForm, NButton,
  NInput, NDatePicker, NIcon,
  NModal, NQrCode,NTabs,NTabPane,NUpload,NUploadDragger,
  type UploadCustomRequestOptions
} from "naive-ui";
import {ShareFilled,FileUploadFilled,AttachFileFilled} from "@vicons/material"
import {authCheck} from "@/api/auth";
import {createShareLink, createUploadLink} from "@/api/shareLink";
import axios from "axios";

const router = useRouter()
const route = useRoute()
const adminOn = ref<boolean>(false)
const modeChecking = ref<boolean>(false);
const notification = useNotification();
const trySwitchAdminMode = (newVal: boolean) => {
  if (!newVal) return;
  adminOn.value = false;
  modeChecking.value = true;
  authCheck()
      .then(() => {
        adminOn.value = true;
        modeChecking.value = false;
      }).catch(() => {
    notification.error({
      title: "admin not active",
      description: "jump to auth page",
      duration: 1000
    });
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  })
}

const shareForm = ref({
  fileUri: "",
  timeExpired: Date.now() / 1,
  password: "",
  ossType: "aliyun"
})

const showLinkModal = ref<boolean>(false);
const showUploadModal = ref<boolean>(false);
const uploadUrl = ref<string>("");

const tryUpload = ()=>{
  createUploadLink(shareForm.value.fileUri).then(url=>{
    console.log(url)
    uploadUrl.value = url;
    showUploadModal.value = true;
  })
}
const doUpload = async (options:UploadCustomRequestOptions)=>{
  startUpload()
  if(!options.action||!options.file){
    return;
  }
  try{
    const xhr = new XMLHttpRequest()
    xhr.open("PUT",options.action)
    xhr.setRequestHeader("Content-type",'application/octet-stream')
    xhr.onload = ()=>{
      console.log(xhr.status,xhr.response);
      handleFinish(xhr.status === 200 || xhr.status === 204);
    }
    xhr.onerror = ()=>{
      console.log("error")
      notification.error({
        title: "upload failed",
        duration: 1000
      })
    }

    xhr.send(options.file.file)
  }catch(error){
    console.log("error",error)
    notification.error({
      title: "upload failed",
      duration: 1000
    })
  }
}
const handleFinish = (success:boolean)=>{
  if(success){
    notification.success({
      title: "upload success",
      duration: 1000
    })
  }else{
    notification.error({
      title: "upload failed",
      duration: 1000
    })
  }
  showUploadModal.value = false;
}

const startUpload = ()=>{
  notification.success({
    title: "upload start",
    duration: 1000
  })
}


const trySignUrl = () => {
  createShareLink(
      shareForm.value.fileUri,
      shareForm.value.timeExpired,
      shareForm.value.password,
      shareForm.value.ossType
  ).then((token) => {
    console.log(token)
    fileToken.value = token;
    showLinkModal.value = true
  }).catch((err) => {
    console.log(err)
    notification.error({
      title: "error",
      description: "api error"
    })
  })
}
const fileToken = ref<string>("");
const withPassword = ref<boolean>(false);
const shareLink = computed(() => {
  const pageUrl = window.location.protocol + "//" + window.location.host + window.location.pathname
  const vuePath = "#/share"
  const args: { [key: string]: string } = {
    token: fileToken.value,
    exp: "" + shareForm.value.timeExpired
  }
  if (withPassword.value) {
    args["password"] = shareForm.value.password
  }
  const kvPairs: string[] = []
  Object.keys(args).forEach((key) => {
    kvPairs.push(key + "=" + encodeURIComponent(args[key]))
  })
  return pageUrl + vuePath + "?" + kvPairs.join("&");
})

const toCopyBoard = (val: string) => {
  navigator.clipboard.writeText(val);
  notification.success({
    title: "save to clipboard",
    duration: 1000
  })
}

const nohistoryTime = (num: number) => {
  return num < Date.now()
}

onMounted(() => {
  if (route.query["admin"] == 't') {
    modeChecking.value = true;
    authCheck().then(() => {
      modeChecking.value = false;
      adminOn.value = true;
    }).catch(err => {
      notification.error({
        title: "admin not active",
        description: "jump to auth page",
        duration: 1000
      });
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    })
  }
})

</script>

<template>
  <div style="height: 100%;width: 100%">
    <n-flex justify="space-between" style="margin: 10px">
      <n-text style="font-size: 24px">
        {{ adminOn ? "OSS Share" : "" }}
      </n-text>
      <n-flex>
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
        <n-card style="width: 600px;height: 500px">
          <n-tabs
              class="card-tabs"
              default-value="share"
              size="large"
              animated
              pane-wrapper-style="margin: 0 -4px"
              pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;"
          >
            <n-tab-pane name="share" style="height: 420px">
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
            </n-tab-pane>
            <n-tab-pane name="upload" style="height: 420px;">
              <n-flex vertical justify="space-between" style="height: 100%;">
                <n-form size="large">
                  <n-form-item label="fileUrl" path="">
                    <n-input
                        placeholder="fileUrl"
                        v-model:value="shareForm.fileUri"
                    />
                  </n-form-item>
                </n-form>
                <n-flex justify="right">
                  <n-button type="primary" @click="tryUpload">
                    <template #icon>
                      <n-icon>
                        <file-upload-filled/>
                      </n-icon>
                    </template>
                    create
                  </n-button>
                </n-flex>
              </n-flex>
            </n-tab-pane>
          </n-tabs>
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
          {{ shareLink }}
        </n-text>
        <n-button type="primary" @click="toCopyBoard(shareLink)">copy</n-button>
      </n-flex>
    </n-flex>
  </n-modal>
  <n-modal :show="showUploadModal">
    <n-card style="width: 700px;height: 500px">
      <n-upload
          style="height: 100%"
          :action="uploadUrl"
          :custom-request="doUpload"
          method="put"
      >
        <n-upload-dragger style="height: 450px">
          <div style="margin-bottom: 12px">
            <n-icon size="48" :depth="3">
              <attach-file-filled/>
            </n-icon>
          </div>
          <n-text style="font-size: 16px">
            点击或者拖动文件到该区域来上传
          </n-text>
        </n-upload-dragger>
      </n-upload>
    </n-card>
  </n-modal>
</template>

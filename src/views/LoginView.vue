<template>
  <n-flex justify="center" vertical style="width: 100%;height: 100%;">
      <n-flex justify="center">
          <n-card title="Admin Auth" style="width: 600px;height: 400px">
              <n-flex vertical justify="space-between" style="height: 100%;">
                  <n-form size="large">
                      <n-form-item label="accessToken" path="">
                          <n-input
                                  type="password"
                                  placeholder="accessToken"
                                  show-password-on="click"
                                  v-model:value="loginForm.password"
                          />
                      </n-form-item>
                      <n-form-item label="TOTP" path="totp">
                          <n-input
                                  type="password"
                                  placeholder="totp"
                                  show-password-on="click"
                                  v-model:value="loginForm.totp"
                          />
                      </n-form-item>
                  </n-form>
                  <n-flex justify="right">
                      <n-button type="primary" @click="tryLogin">
                          auth
                      </n-button>
                  </n-flex>
              </n-flex>
          </n-card>
      </n-flex>
  </n-flex>
</template>

<script setup lang="ts">

import {NFlex, NCard, NForm, NFormItem, NInput, NButton, useNotification} from "naive-ui";
import {ref} from "vue";
import {doLogin} from "@/api/auth";
import {useRouter} from "vue-router";

const router = useRouter()
const notification = useNotification();

const loginForm = ref({
    totp:"",
    password:""
})

const tryLogin = ()=>{
    doLogin(loginForm.value.password,loginForm.value.totp)
        .then(()=>{
            notification.success({
                title:"success",
                description:"redirect",
                duration:1500,
            })
            setTimeout(()=>{
                router.push("/?admin=t")
            },2000)
        }).catch(err=>{
          console.log(err);
            notification.error({
                title:"login fail",
                description:"login fail",
                duration:1500,
            })
    })
}

</script>

<style scoped>

</style>

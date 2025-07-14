<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import {
    NModalProvider, NConfigProvider, NDialogProvider,
    NNotificationProvider, NMessageProvider,darkTheme,
    NFlex,NGlobalStyle,NText
} from "naive-ui";
</script>

<template>
    <n-config-provider :theme="darkTheme">
        <n-global-style />
        <n-notification-provider>
            <n-dialog-provider>
                <n-modal-provider>
                    <n-message-provider>
                        <n-flex justify="space-between" vertical style="gap:0">
                            <div style="height: calc( 100vh - 30px )">
                                <RouterView />
                            </div>
                            <n-flex justify="center" style="margin: 3px 0">
                                <n-text depth="3">
                                    OSS Share Helper 0.1&nbsp;&nbsp;·&nbsp;&nbsp;Made by HynemanKan
                                </n-text>
                            </n-flex>
                        </n-flex>
                    </n-message-provider>
                </n-modal-provider>
            </n-dialog-provider>
        </n-notification-provider>
    </n-config-provider>
</template>

<style scoped>
</style>

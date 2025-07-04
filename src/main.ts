import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'ant-design-vue/dist/reset.css'
import Antd from 'ant-design-vue'
import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia()
//全局引入
app.use(Antd)
app.use(pinia)

app.use(router)

app.mount('#app')

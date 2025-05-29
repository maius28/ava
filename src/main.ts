import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'ant-design-vue/dist/reset.css'
import Antd from 'ant-design-vue'

const app = createApp(App)

//全局引入
app.use(Antd)

app.use(router)

app.mount('#app')

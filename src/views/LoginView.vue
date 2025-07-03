<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>系统登录</h2>
        <p>请输入您的账号和密码</p>
      </div>

      <a-form :model="loginForm" @finish="handleLogin" layout="vertical">
        <a-form-item name="username" :rules="[{ required: true, message: '请输入用户名' }]">
          <a-input v-model:value="loginForm.username" size="large" placeholder="用户名">
            <template #prefix><user-outlined /></template>
          </a-input>
        </a-form-item>

        <a-form-item name="password" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password v-model:value="loginForm.password" size="large" placeholder="密码">
            <template #prefix><lock-outlined /></template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-checkbox v-model:checked="loginForm.remember">记住我</a-checkbox>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" :loading="loading" block>
            登录
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { login, type LoginParams } from '@/api/auth';

const router = useRouter();
const loading = ref(false);

// 登录表单数据
const loginForm = reactive<LoginParams>({
  username: '',
  password: ''
});

// 记住我选项
const rememberMe = ref(false);

// 处理登录
const handleLogin = async () => {
  loading.value = true;

  try {
    const response = await login({
      username: loginForm.username,
      password: loginForm.password
    });

    if (response.code === 200) {
      // 登录成功
      message.success(response.message || '登录成功');

      // 存储token
      const token = response.data?.token;
      if (token) {
        localStorage.setItem('token', token);

        // 存储用户信息
        if (rememberMe.value) {
          localStorage.setItem('userInfo', JSON.stringify(response.data?.user));
        } else {
          sessionStorage.setItem('userInfo', JSON.stringify(response.data?.user));
        }
      }

      // 跳转到首页
      router.push('/dashboard');
    } else {
      // 登录失败
      message.error(response.message || '登录失败');
    }
  } catch (error) {
    console.error('登录失败:', error);
    message.error('登录出错，请稍后再试');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
}

.login-card {
  width: 400px;
  padding: 36px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.5s ease-in-out;
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
}

.login-header h2 {
  margin-bottom: 8px;
  font-size: 28px;
  color: #1a237e;
}

.login-header p {
  color: #666;
  font-size: 14px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
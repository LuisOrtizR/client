<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import api from '../api/api';

const router = useRouter();
const loading = ref(false);
const form = ref({ email: '', password: '' });

const handleLogin = async () => {
  if (!form.value.email || !form.value.password) {
    message.warning('Completa todos los campos');
    return;
  }

  loading.value = true;

  try {
    const res = await api.post('/auth/login', {
      email: form.value.email,
      password: form.value.password
    });

    localStorage.setItem('adminToken', res.data.access_token);
    localStorage.setItem(
      'adminTokenExpiry',
      (Date.now() + parseInt(res.data.expiresIn) * 1000).toString()
    );

    message.success('¡Bienvenido al Dashboard!');
    router.push('/admin');
  } catch (err: any) {
    console.error(err);
    message.error(err.response?.data?.message || 'Error al iniciar sesión');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div style="display:flex; justify-content:center; align-items:center; height:100vh; background:#f0f2f5;">
    <a-card style="width:380px; text-align:center;">
      <h2>Login Admin</h2>
      <a-form layout="vertical" @submit.prevent="handleLogin">
        <a-form-item label="Email">
          <a-input v-model:value="form.email" placeholder="Ingresa tu email" />
        </a-form-item>
        <a-form-item label="Contraseña">
          <a-input-password v-model:value="form.password" placeholder="Ingresa tu contraseña" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" block :loading="loading" @click="handleLogin">
            Entrar
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<style scoped>
h2 {
  margin-bottom: 24px;
  color: #1890ff;
}
</style>
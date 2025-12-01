<template>
  <a-layout style="min-height: 100vh; background: #f0f2f5;">
    <a-row justify="center" style="padding: 50px 20px">
      <a-col :xs="24" :sm="22" :md="18" :lg="14">
        <a-card bordered style="border-radius:16px; text-align:center;">
          <h1 class="title">Contacto</h1>
          <p class="subtitle">¿Tienes alguna pregunta o proyecto? ¡Envíame un mensaje!</p>

          <a-form layout="vertical" @submit.prevent="handleSubmit" style="text-align:left;">
            <a-form-item label="Nombre" :rules="[{ required: true, message: 'Por favor ingresa tu nombre' }]">
              <a-input v-model:value="form.name" placeholder="Tu nombre" />
            </a-form-item>

            <a-form-item label="Email" :rules="[{ required: true, type: 'email', message: 'Por favor ingresa un email válido' }]">
              <a-input v-model:value="form.email" placeholder="Tu email" />
            </a-form-item>

            <a-form-item label="Mensaje" :rules="[{ required: true, message: 'Por favor escribe tu mensaje' }]">
              <a-textarea v-model:value="form.message" rows="4" placeholder="Tu mensaje" />
            </a-form-item>

            <a-form-item>
              <a-button type="primary" html-type="submit" block :loading="loading">
                Enviar Mensaje
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>
  </a-layout>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import api from '../api/api';

const form = reactive({
  name: '',
  email: '',
  message: ''
});

const loading = ref(false);

const handleSubmit = async () => {
  if (!form.name || !form.email || !form.message) {
    message.warning('Por favor completa todos los campos');
    return;
  }

  loading.value = true;

  try {
    const res = await api.post('/contact', form);

    // ✅ Cambiado para reflejar la estructura real del backend
    if (res && res.data && res.data.contact?.id) {
      message.success('Mensaje enviado correctamente!');
      form.name = '';
      form.email = '';
      form.message = '';
    } else {
      message.error('Hubo un problema al enviar el mensaje');
    }
  } catch (err: any) {
    console.error(err);
    if (err.response?.data?.message) {
      message.error(`Error del servidor: ${err.response.data.message}`);
    } else {
      message.error('Error al enviar el mensaje');
    }
  } finally {
    loading.value = false;
  }
};
</script>


<style scoped>
.title {
  color: #1890ff;
  font-weight: 600;
  font-size: 2rem;
  margin-bottom: 10px;
}

.subtitle {
  color: #262626;
  font-size: 1rem;
  margin-bottom: 30px;
}

a-card:hover {
  transform: translateY(-3px);
  transition: transform 0.3s;
}

a-input, a-textarea {
  border-radius: 8px;
}

a-button {
  border-radius: 8px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .title {
    font-size: 1.6rem;
  }
  .subtitle {
    font-size: 0.95rem;
  }
}
</style>

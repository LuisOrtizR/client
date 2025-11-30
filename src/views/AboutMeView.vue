<template>
  <a-layout style="min-height: 100vh; background: #f0f2f5;">
    <a-row justify="center" style="padding: 50px 20px">
      <a-col :xs="24" :sm="22" :md="20" :lg="18">
        <a-card bordered>
          <!-- Título -->
          <h1 class="title">Sobre Mí</h1>

          <!-- Mensajes de carga o error -->
          <div v-if="loading" class="status-message">Cargando información...</div>
          <div v-else-if="error" class="status-message error">Error al cargar la información</div>

          <!-- Contenido principal -->
          <div v-else>
            <!-- Layout: Imagen principal y descripción -->
            <a-row :gutter="24" align="middle" v-if="about.description || (about.images && about.images.length)">
              <a-col :xs="24" :md="8" v-if="about.images && about.images.length">
                <a-image
                  :src="getFileUrl(about.images[0])"
                  width="100%"
                  style="border-radius: 10px;"
                  preview
                />
              </a-col>

              <a-col :xs="24" :md="about.images && about.images.length ? 16 : 24">
                <p class="description">{{ about.description || 'No hay descripción disponible.' }}</p>
              </a-col>
            </a-row>

            <!-- CV -->
            <div v-if="about.cv" class="section">
              <h3 class="subtitle">Mi CV</h3>
              <a-button type="primary" :href="getFileUrl(about.cv)" target="_blank">
                Descargar CV
              </a-button>
              <a-divider />
              <iframe
                :src="getFileUrl(about.cv)"
                width="100%"
                height="500"
                style="border:1px solid #d9d9d9; border-radius:6px;"
              ></iframe>
            </div>

            <!-- Carousel de imágenes restantes -->
            <div v-if="about.images && about.images.length > 1" class="section">
              <h3 class="subtitle">Galería</h3>
              <a-carousel autoplay dots>
                <div v-for="img in about.images.slice(1)" :key="img" class="carousel-item">
                  <a-image
                    :src="getFileUrl(img)"
                    width="80%"
                    style="border-radius:8px; max-height:400px; object-fit:cover;"
                    preview
                  />
                </div>
              </a-carousel>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

interface AboutMe {
  description: string;
  cv?: string;
  images?: string[];
}

const about = ref<AboutMe>({ description: '' });
const loading = ref(true);
const error = ref(false);

// Genera URL de archivos
const getFileUrl = (filename: string) => {
  return filename ? `http://localhost:3000/uploads/aboutme/${filename}?t=${Date.now()}` : '';
};

// Cargar datos del backend
const loadAboutMe = async () => {
  loading.value = true;
  error.value = false;
  try {
    const res = await axios.get('http://localhost:3000/about-me');
    if (res.data) about.value = res.data;
  } catch (err) {
    console.error('Error al cargar AboutMe:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(loadAboutMe);
</script>

<style scoped>
.title {
  color: #1890ff;
  text-align: center;
  margin-bottom: 30px;
  font-weight: 600;
}

.subtitle {
  color: #1890ff;
  margin-bottom: 15px;
  font-weight: 500;
}

.description {
  font-size: 17px;
  line-height: 2;
  color: #444;
  text-align: justify; /* Para que no quede pegado a la imagen */
  padding-left: 10px;
}

.section {
  margin-top: 30px;
}

.carousel-item {
  text-align: center;
}

.status-message {
  text-align: center;
  margin: 50px 0;
  font-size: 16px;
  color: #555;
}

.status-message.error {
  color: red;
}
</style>

<template>
  <a-layout style="min-height: 100vh; background: #f0f2f5;">
    <a-row justify="center" style="padding: 50px 20px">
      <a-col :xs="24" :sm="22" :md="20" :lg="18">
        <a-card bordered>
          <h1 class="title">Mis Proyectos</h1>

          <div v-if="loading" class="status-message">Cargando proyectos...</div>
          <div v-else-if="error" class="status-message error">Error al cargar los proyectos</div>

          <div v-else>
            <a-row :gutter="[24, 24]">
              <a-col
                v-for="project in projects"
                :key="project.id"
                :xs="24"
                :sm="12"
                :md="8"
              >
                <a-card hoverable style="border-radius:10px;">
                  <!-- Imagen principal -->
                  <a-image
                    v-if="project.image"
                    :src="getFileUrl(project.image)"
                    width="100%"
                    style="border-radius:8px; max-height:200px; object-fit:cover;"
                    preview
                  />

                  <h3 class="card-title">{{ project.title }}</h3>
                  <p class="description">{{ project.description }}</p>
                  <p class="techstack">
                    <strong>Tecnologías:</strong> {{ project.techStack }}
                  </p>

                  <!-- Carousel de imágenes -->
                  <a-carousel
                    v-if="project.gallery?.length"
                    autoplay
                    dots
                    style="margin-top:10px;"
                  >
                    <div
                      v-for="img in project.gallery"
                      :key="img"
                      class="carousel-item"
                    >
                      <a-image
                        :src="getFileUrl(img)"
                        width="100%"
                        style="border-radius:8px; max-height:150px; object-fit:cover;"
                        preview
                      />
                    </div>
                  </a-carousel>

                  <a-button
                    v-if="project.link"
                    type="primary"
                    block
                    :href="project.link"
                    target="_blank"
                    style="margin-top:10px;"
                  >
                    Ver Proyecto
                  </a-button>
                </a-card>
              </a-col>
            </a-row>
          </div>

        </a-card>
      </a-col>
    </a-row>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Cambia esto por tu dominio final o variable de entorno
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Tipado del proyecto
interface Project {
  id: number;
  title: string;
  description: string;
  techStack: string;
  link?: string;
  image?: string;
  gallery?: string[];
}

const projects = ref<Project[]>([]);
const loading = ref(true);
const error = ref(false);

// Obtiene URL del archivo
const getFileUrl = (file: string) => `${API_URL}/uploads/projects/${file}`;

// Carga del backend
const loadProjects = async () => {
  try {
    const res = await axios.get(`${API_URL}/projects`);
    projects.value = res.data || [];
  } catch (e) {
    console.error(e);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(loadProjects);
</script>

<style scoped>
.title {
  color: #1890ff;
  font-weight: 600;
  text-align: center;
  margin-bottom: 30px;
}
.card-title {
  font-size: 1.2rem;
  font-weight: 500;
  margin-top: 10px;
  color: #096dd9;
}
.description {
  color: #444;
  
  text-align: justify;
  line-height: 1.5;
  margin-top: 5px;
}
.techstack {
  color: #595959;
  margin-top: 5px;
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
.status-message.error { color: red; }
</style>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  message,
  Modal,
  Spin,
  Upload,
} from 'ant-design-vue';
import {
  ProjectOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  LinkOutlined,
  CloseCircleOutlined,
  InboxOutlined,
} from '@ant-design/icons-vue';
import axios from 'axios';

interface Project {
  id: number;
  title: string;
  description: string;
  techStack: string;
  image?: string;
  gallery?: string[];
  link?: string;
  createdAt: string;
}

const BASE_URL = 'http://localhost:3000/projects';
const UPLOADS_URL = 'http://localhost:3000/uploads/projects';

const projects = ref<Project[]>([]);
const loading = ref<boolean>(false);
const selectedProject = ref<Project | null>(null);
const searchTerm = ref<string>('');
const isModalOpen = ref<boolean>(false);
const isEditing = ref<boolean>(false);

const formData = ref<Partial<Project>>({
  title: '',
  description: '',
  techStack: '',
  link: '',
});

// Control de archivos
const imageFile = ref<File | null>(null);
const galleryFiles = ref<File[]>([]);
const imagePreview = ref<string>('');
const galleryPreviews = ref<string[]>([]);

const loadProjects = async () => {
  loading.value = true;
  try {
    const res = await axios.get<Project[]>(BASE_URL);
    projects.value = res.data.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  } catch {
    message.error('Error al cargar los proyectos');
  } finally {
    loading.value = false;
  }
};

const filteredProjects = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  return projects.value.filter((p) => {
    if (!term) return true;
    return (
      p.title.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.techStack.toLowerCase().includes(term)
    );
  });
});

const selectProject = (project: Project) => {
  selectedProject.value = project;
};

const openCreateModal = () => {
  isEditing.value = false;
  formData.value = {
    title: '',
    description: '',
    techStack: '',
    link: '',
  };
  imageFile.value = null;
  galleryFiles.value = [];
  imagePreview.value = '';
  galleryPreviews.value = [];
  isModalOpen.value = true;
};

const openEditModal = (project: Project) => {
  isEditing.value = true;
  formData.value = { ...project };
  imageFile.value = null;
  galleryFiles.value = [];
  imagePreview.value = project.image ? `${UPLOADS_URL}/${project.image}` : '';
  galleryPreviews.value = project.gallery?.map(img => `${UPLOADS_URL}/${img}`) || [];
  isModalOpen.value = true;
};

const handleImageChange = (file: File) => {
  imageFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
  return false; // Prevenir auto-upload
};

const handleGalleryChange = (file: File) => {
  galleryFiles.value.push(file);
  const reader = new FileReader();
  reader.onload = (e) => {
    galleryPreviews.value.push(e.target?.result as string);
  };
  reader.readAsDataURL(file);
  return false; // Prevenir auto-upload
};

const removeGalleryImage = (index: number) => {
  galleryFiles.value.splice(index, 1);
  galleryPreviews.value.splice(index, 1);
};

const removeMainImage = () => {
  imageFile.value = null;
  imagePreview.value = '';
};

const saveProject = async () => {
  if (!formData.value.title || !formData.value.description) {
    return message.warning('El título y la descripción son obligatorios');
  }

  loading.value = true;
  
  try {
    const formDataToSend = new FormData();
    
    // Añadir campos de texto
    formDataToSend.append('title', formData.value.title || '');
    formDataToSend.append('description', formData.value.description || '');
    formDataToSend.append('techStack', formData.value.techStack || '');
    if (formData.value.link) formDataToSend.append('link', formData.value.link);
    
    // Añadir imagen principal si existe
    if (imageFile.value) {
      formDataToSend.append('image', imageFile.value);
    }
    
    // Añadir imágenes de galería
    galleryFiles.value.forEach((file) => {
      formDataToSend.append('gallery', file);
    });

    if (isEditing.value && selectedProject.value) {
      await axios.put(`${BASE_URL}/${selectedProject.value.id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('Proyecto actualizado');
    } else {
      await axios.post(BASE_URL, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('Proyecto creado');
    }
    
    isModalOpen.value = false;
    selectedProject.value = null;
    await loadProjects();
  } catch (error: any) {
    console.error('Error:', error);
    message.error('Error al guardar el proyecto');
  } finally {
    loading.value = false;
  }
};

const deleteProject = async (id: number) => {
  Modal.confirm({
    title: '¿Eliminar proyecto?',
    content: 'Esta acción eliminará el proyecto y todas sus imágenes.',
    okText: 'Eliminar',
    cancelText: 'Cancelar',
    okType: 'danger',
    onOk: async () => {
      try {
        await axios.delete(`${BASE_URL}/${id}`);
        message.success('Proyecto eliminado');
        if (selectedProject.value?.id === id) selectedProject.value = null;
        await loadProjects();
      } catch {
        message.error('Error al eliminar');
      }
    },
  });
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

onMounted(() => {
  loadProjects();
});
</script>

<template>
  <div class="projects-container">
    <!-- HEADER -->
    <div class="projects-header">
      <div class="flex items-center gap-3">
        <ProjectOutlined style="font-size:24px; color:#52c41a;" />
        <h1 class="projects-title">Gestión de Proyectos</h1>
      </div>
      <div class="flex items-center gap-2">
        <a-button type="primary" size="large" @click="openCreateModal">
          <PlusOutlined /> Nuevo Proyecto
        </a-button>
        <a-button @click="loadProjects" :loading="loading" size="large">
          <ProjectOutlined /> Recargar
        </a-button>
      </div>
    </div>

    <div class="projects-main-layout">
      <!-- SIDEBAR -->
      <div class="projects-sidebar">
        <div class="sidebar-content">
          <div style="padding: 16px;">
            <a-input
              v-model:value="searchTerm"
              placeholder="Buscar proyectos..."
              allowClear
              size="large"
            >
              <template #prefix>
                <SearchOutlined />
              </template>
            </a-input>
          </div>

          <div class="stats-card">
            <div class="stat-item">
              <div class="stat-number">{{ projects.length }}</div>
              <div class="stat-label">Total Proyectos</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ filteredProjects.length }}</div>
              <div class="stat-label">Resultados</div>
            </div>
          </div>
        </div>
      </div>

      <!-- CONTENIDO PRINCIPAL -->
      <div class="projects-content">
        <div class="projects-grid">
          <Spin :spinning="loading">
            <div v-if="filteredProjects.length === 0" class="empty-state">
              <InboxOutlined style="font-size: 64px; color: #d9d9d9;" />
              <p class="empty-text">
                {{ searchTerm ? 'No se encontraron proyectos' : 'No hay proyectos' }}
              </p>
              <a-button type="primary" @click="openCreateModal">
                <PlusOutlined /> Crear primer proyecto
              </a-button>
            </div>

            <div class="grid-container">
              <div 
                v-for="project in filteredProjects" 
                :key="project.id"
                class="project-card"
                :class="{ 'project-selected': selectedProject?.id === project.id }"
                @click="selectProject(project)"
              >
                <!-- Imagen principal -->
                <div class="project-image" v-if="project.image">
                  <img :src="`${UPLOADS_URL}/${project.image}`" :alt="project.title" />
                  <div class="project-overlay">
                    <a-button type="primary" @click.stop="openEditModal(project)">
                      <EditOutlined /> Editar
                    </a-button>
                  </div>
                </div>
                <div class="project-image-placeholder" v-else>
                  <ProjectOutlined style="font-size: 48px; color: #d9d9d9;" />
                </div>

                <div class="project-card-content">
                  <h3 class="project-title">{{ project.title }}</h3>
                  
                  <p class="project-description">
                    {{ project.description.substring(0, 100) }}{{ project.description.length > 100 ? '...' : '' }}
                  </p>

                  <div class="tech-stack">
                    <strong>Stack:</strong> {{ project.techStack }}
                  </div>

                  <!-- Galería mini preview -->
                  <div v-if="project.gallery && project.gallery.length > 0" class="gallery-preview">
                    <div class="gallery-label">
                      <EyeOutlined /> {{ project.gallery.length }} imágenes
                    </div>
                    <div class="gallery-thumbnails">
                      <img 
                        v-for="(img, idx) in project.gallery.slice(0, 3)" 
                        :key="idx"
                        :src="`${UPLOADS_URL}/${img}`" 
                        class="gallery-thumb"
                      />
                      <div v-if="project.gallery.length > 3" class="gallery-more">
                        +{{ project.gallery.length - 3 }}
                      </div>
                    </div>
                  </div>

                  <div class="project-actions">
                    <a-button size="small" v-if="project.link" @click.stop="window.open(project.link)" type="link">
                      <LinkOutlined /> Ver demo
                    </a-button>
                    <a-button size="small" type="primary" @click.stop="openEditModal(project)">
                      <EditOutlined /> Editar
                    </a-button>
                    <a-button size="small" danger @click.stop="deleteProject(project.id)">
                      <DeleteOutlined />
                    </a-button>
                  </div>

                  <div class="project-date">
                    Creado: {{ formatDate(project.createdAt) }}
                  </div>
                </div>
              </div>
            </div>
          </Spin>
        </div>
      </div>
    </div>

    <!-- MODAL CREAR/EDITAR -->
    <a-modal
      v-model:open="isModalOpen"
      :title="isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto'"
      :width="800"
      @ok="saveProject"
      :confirmLoading="loading"
      okText="Guardar"
      cancelText="Cancelar"
    >
      <a-form layout="vertical" style="margin-top: 20px;">
        <a-form-item label="Título del Proyecto" required>
          <a-input v-model:value="formData.title" placeholder="Nombre del proyecto" size="large" />
        </a-form-item>

        <a-form-item label="Descripción" required>
          <a-textarea 
            v-model:value="formData.description" 
            placeholder="Describe tu proyecto..."
            :rows="4"
          />
        </a-form-item>

        <a-form-item label="Stack Tecnológico" required>
          <a-input 
            v-model:value="formData.techStack" 
            placeholder="Ej: NestJS, Prisma, React..."
            size="large"
          />
        </a-form-item>

        <a-form-item label="Link del Proyecto">
          <a-input 
            v-model:value="formData.link" 
            placeholder="https://tu-proyecto.com"
            size="large"
          />
        </a-form-item>

        <a-divider>Imágenes</a-divider>

        <!-- Imagen Principal -->
        <a-form-item label="Imagen Principal">
          <div v-if="imagePreview" class="image-preview-container">
            <img :src="imagePreview" class="image-preview" />
            <a-button 
              type="primary" 
              danger 
              size="small" 
              class="remove-image-btn"
              @click="removeMainImage"
            >
              <CloseCircleOutlined />
            </a-button>
          </div>
          <Upload
            v-else
            :before-upload="handleImageChange"
            accept="image/*"
            :show-upload-list="false"
          >
            <a-button size="large" block>
              <PlusOutlined /> Subir Imagen Principal
            </a-button>
          </Upload>
        </a-form-item>

        <!-- Galería -->
        <a-form-item label="Galería de Imágenes">
          <div class="gallery-upload-container">
            <div v-if="galleryPreviews.length > 0" class="gallery-grid">
              <div 
                v-for="(preview, index) in galleryPreviews" 
                :key="index"
                class="gallery-item"
              >
                <img :src="preview" class="gallery-item-img" />
                <a-button 
                  type="primary" 
                  danger 
                  size="small" 
                  class="remove-gallery-btn"
                  @click="removeGalleryImage(index)"
                >
                  <CloseCircleOutlined />
                </a-button>
              </div>
            </div>
            <Upload
              :before-upload="handleGalleryChange"
              accept="image/*"
              :show-upload-list="false"
              multiple
            >
              <a-button size="large" block>
                <PlusOutlined /> Añadir Imágenes a la Galería
              </a-button>
            </Upload>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.projects-container {
  background: #f5f5f5;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.projects-header {
  background: #fff;
  border-bottom: 1px solid #e8eaed;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  flex-shrink: 0;
}

.projects-title {
  margin: 0;
  font-size: 22px;
  font-weight: 400;
  color: #202124;
}

.projects-main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.projects-sidebar {
  width: 280px;
  background: #fff;
  border-right: 1px solid #e8eaed;
  flex-shrink: 0;
  overflow-y: auto;
}

.sidebar-content {
  padding: 8px 0;
}

.stats-card {
  margin: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.stat-item {
  margin-bottom: 16px;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
}

.projects-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.projects-grid {
  background: #fff;
  overflow-y: auto;
  flex: 1;
  padding: 24px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.project-card {
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
}

.project-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.project-selected {
  border: 2px solid #52c41a;
  box-shadow: 0 8px 24px rgba(82, 196, 26, 0.2);
}

.project-image {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: #f5f5f5;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.project-card:hover .project-overlay {
  opacity: 1;
}

.project-image-placeholder {
  width: 100%;
  height: 220px;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-card-content {
  padding: 20px;
}

.project-title {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: #202124;
}

.project-description {
  margin: 0 0 16px 0;
  color: #5f6368;
  font-size: 14px;
  line-height: 1.6;
}

.tech-stack {
  margin-bottom: 16px;
  padding: 12px;
  background: #f0f7ff;
  border-radius: 8px;
  font-size: 13px;
  color: #1890ff;
}

.gallery-preview {
  margin: 16px 0;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

.gallery-label {
  font-size: 13px;
  color: #5f6368;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.gallery-thumbnails {
  display: flex;
  gap: 8px;
  align-items: center;
}

.gallery-thumb {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid white;
}

.gallery-more {
  width: 50px;
  height: 50px;
  background: #d9d9d9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #5f6368;
}

.project-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.project-date {
  margin-top: 12px;
  font-size: 12px;
  color: #8c8c8c;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.empty-text {
  margin: 16px 0;
  font-size: 16px;
  color: #5f6368;
}

/* Modal Upload Styles */
.image-preview-container {
  position: relative;
  display: inline-block;
}

.image-preview {
  max-width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e8eaed;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}

.gallery-upload-container {
  width: 100%;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.gallery-item {
  position: relative;
  aspect-ratio: 1;
}

.gallery-item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e8eaed;
}

.remove-gallery-btn {
  position: absolute;
  top: 4px;
  right: 4px;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}
</style>
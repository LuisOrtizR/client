<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  MailOutlined, 
  ProjectOutlined, 
  UserOutlined, 
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined 
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import EmailsSection from '../components/admin/EmailsSection.vue';
import ProjectsSection from '../components/admin/ProjectsSection.vue';

const router = useRouter();
const selectedKey = ref<string[]>(['emails']);
const collapsed = ref<boolean>(false);

const logout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminTokenExpiry');
  message.success('Sesión cerrada correctamente');
  router.replace('/');
};

const changeSection = (key: string) => {
  if (key === 'logout') {
    logout();
  } else {
    selectedKey.value = [key];
  }
};

onMounted(() => {
  const token = localStorage.getItem('adminToken');
  const expiry = localStorage.getItem('adminTokenExpiry');
  if (!token || !expiry || Date.now() > parseInt(expiry)) {
    router.replace('/admin-login');
  }
});
</script>

<template>
  <a-layout style="min-height:100vh">
    <!-- Sidebar principal mejorado -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      collapsible
      :width="240"
      :trigger="null"
      style="height: 100vh; position: fixed; top: 0; left: 0; z-index: 100; box-shadow: 2px 0 8px rgba(0,0,0,0.1);"
      theme="dark"
    >
      <!-- Logo / Header -->
      <div class="sidebar-header">
        <div class="logo-container" v-if="!collapsed">
          <div class="logo-icon">
            <UserOutlined style="font-size: 24px;" />
          </div>
          <div class="logo-text">
            <div class="logo-title">Admin Panel</div>
            <div class="logo-subtitle">Dashboard</div>
          </div>
        </div>
        <div class="logo-collapsed" v-else>
          <UserOutlined style="font-size: 24px;" />
        </div>
      </div>

      <!-- Toggle Button -->
      <div class="sidebar-toggle" @click="collapsed = !collapsed">
        <MenuFoldOutlined v-if="!collapsed" />
        <MenuUnfoldOutlined v-else />
      </div>

      <!-- Menu -->
      <a-menu 
        theme="dark" 
        mode="inline" 
        v-model:selectedKeys="selectedKey"
        style="border: none; margin-top: 16px;"
      >
        <a-menu-item key="emails" @click="changeSection('emails')" class="custom-menu-item">
          <MailOutlined />
          <span>Emails / Contactos</span>
        </a-menu-item>
        
        <a-menu-item key="projects" @click="changeSection('projects')" class="custom-menu-item">
          <ProjectOutlined />
          <span>Proyectos</span>
        </a-menu-item>
        
        <a-menu-item key="about" @click="changeSection('about')" class="custom-menu-item">
          <UserOutlined />
          <span>About Me</span>
        </a-menu-item>

        <a-menu-divider style="background: rgba(255,255,255,0.1); margin: 16px 0;" />
        
        <a-menu-item key="logout" @click="logout" class="custom-menu-item logout-item">
          <LogoutOutlined />
          <span>Cerrar sesión</span>
        </a-menu-item>
      </a-menu>

      <!-- Footer Info -->
      <div class="sidebar-footer" v-if="!collapsed">
        <div class="footer-info">
          <div class="footer-text">Versión 1.0.0</div>
          <div class="footer-subtext">© 2024 Admin Panel</div>
        </div>
      </div>
    </a-layout-sider>

    <!-- Contenido ajustado al sidebar -->
    <a-layout :style="{ marginLeft: collapsed ? '80px' : '240px', transition: 'all 0.2s' }">
      <a-layout-content 
        :style="['emails', 'projects'].includes(selectedKey[0]) ? 'padding: 0; height: 100vh;' : 'padding: 24px; background: #f0f2f5;'"
      >
        <!-- Emails Section -->
        <div v-if="selectedKey[0] === 'emails'" style="height: 100%;">
          <EmailsSection />
        </div>

        <!-- Projects Section -->
        <div v-else-if="selectedKey[0] === 'projects'" style="height: 100%;">
          <ProjectsSection />
        </div>

        <!-- About Me Section -->
        <div v-else-if="selectedKey[0] === 'about'" class="content-section">
          <a-card title="Gestión de About Me" :bordered="false">
            <a-form layout="vertical">
              <a-form-item label="Nombre Completo">
                <a-input placeholder="Tu nombre" size="large" />
              </a-form-item>
              
              <a-form-item label="Título Profesional">
                <a-input placeholder="Ej: Full Stack Developer" size="large" />
              </a-form-item>
              
              <a-form-item label="Biografía">
                <a-textarea 
                  placeholder="Cuéntanos sobre ti..."
                  :rows="6"
                />
              </a-form-item>

              <a-form-item label="Habilidades">
                <a-select
                  mode="tags"
                  placeholder="Añade tus habilidades"
                  style="width: 100%"
                  size="large"
                >
                </a-select>
              </a-form-item>

              <a-form-item label="Email de Contacto">
                <a-input type="email" placeholder="correo@ejemplo.com" size="large" />
              </a-form-item>

              <a-form-item label="LinkedIn">
                <a-input placeholder="https://linkedin.com/in/tu-perfil" size="large" />
              </a-form-item>

              <a-form-item label="GitHub">
                <a-input placeholder="https://github.com/tu-usuario" size="large" />
              </a-form-item>

              <a-form-item>
                <a-button type="primary" size="large">
                  Guardar Cambios
                </a-button>
              </a-form-item>
            </a-form>
          </a-card>
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo-text {
  flex: 1;
}

.logo-title {
  color: white;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
}

.logo-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.logo-collapsed {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.sidebar-toggle {
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.sidebar-toggle:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-info {
  text-align: center;
}

.footer-text {
  color: rgba(255, 255, 255, 0.65);
  font-size: 12px;
  margin-bottom: 4px;
}

.footer-subtext {
  color: rgba(255, 255, 255, 0.45);
  font-size: 11px;
}

.content-section {
  max-width: 1200px;
  margin: 0 auto;
}

:deep(.custom-menu-item) {
  margin: 4px 12px;
  border-radius: 8px;
  height: 44px;
  line-height: 44px;
}

:deep(.custom-menu-item.ant-menu-item-selected) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

:deep(.custom-menu-item:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}

:deep(.logout-item) {
  color: #ff4d4f !important;
}

:deep(.logout-item:hover) {
  background: rgba(255, 77, 79, 0.1) !important;
}

:deep(.ant-card) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
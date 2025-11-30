<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MenuOutlined, HomeOutlined, UserOutlined, ProjectOutlined, MailOutlined, LinkedinOutlined, WhatsAppOutlined } from '@ant-design/icons-vue';
import { Drawer, Button, Menu } from 'ant-design-vue';

const drawerVisible = ref(false);
const route = useRoute();
const router = useRouter();

const toggleDrawer = () => {
  drawerVisible.value = !drawerVisible.value;
};

const menuItems = [
  { key: '/', label: 'Inicio', icon: HomeOutlined },
  { key: '/about-me', label: 'Sobre Mí', icon: UserOutlined },
  { key: '/projects', label: 'Proyectos', icon: ProjectOutlined },
  { key: '/contact', label: 'Contacto', icon: MailOutlined },
];

// Navegación SPA
const navigate = (key: string) => {
  drawerVisible.value = false;
  router.push(key);
};
</script>

<template>
  <a-layout style="min-height: 100vh">
    <!-- Navbar -->
    <a-layout-header v-if="!route.path.startsWith('/admin')" class="navbar">
      <div class="logo">Mi Portafolio</div>

      <a-menu
        theme="dark"
        mode="horizontal"
        class="menu-desktop"
        :selectedKeys="[route.path]"
      >
        <a-menu-item
          v-for="item in menuItems"
          :key="item.key"
          @click="() => navigate(item.key)"
        >
          <component :is="item.icon" style="margin-right:6px" /> {{ item.label }}
        </a-menu-item>

        <!-- Puntito verde de admin-login -->
        <a-menu-item
          key="admin-login"
          @click="() => navigate('/admin-login')"
          style="margin-left:auto"
        >
          <span class="admin-dot"></span>
        </a-menu-item>
      </a-menu>

      <Button
        type="text"
        class="menu-mobile-btn"
        @click="toggleDrawer"
      >
        <MenuOutlined />
      </Button>

      <!-- Drawer móvil -->
      <Drawer
        title="Menú"
        placement="left"
        :open="drawerVisible"
        @close="toggleDrawer"
      >
        <Menu
          mode="vertical"
          :selectedKeys="[route.path]"
          @click="(info: { key: string }) => navigate(info.key)"
        >
          <Menu.Item
            v-for="item in menuItems"
            :key="item.key"
          >
            <component :is="item.icon" style="margin-right:6px" /> {{ item.label }}
          </Menu.Item>

          <Menu.Item
            key="admin-login"
            @click="() => navigate('/admin-login')"
          >
            <span class="admin-dot"></span> Admin
          </Menu.Item>
        </Menu>
      </Drawer>
    </a-layout-header>

    <!-- Contenido principal -->
    <a-layout-content class="content">
      <router-view />
    </a-layout-content>

    <!-- Footer -->
    <a-layout-footer v-if="!route.path.startsWith('/admin')" class="footer">
      <div>© 2025 Luis Ortiz - Todos los derechos reservados</div>
      <div class="social-links">
        <a href="https://linkedin.com/in/luis-angel-ortiz-romero-b57687367" target="_blank">
          <LinkedinOutlined /> LinkedIn
        </a>
        <a href="https://wa.me/573232456846" target="_blank">
          <WhatsAppOutlined /> WhatsApp
        </a>
      </div>
    </a-layout-footer>
  </a-layout>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: #001529;
}

.logo {
  color: white;
  font-weight: bold;
  font-size: 20px;
  margin-right: 30px;
}

.menu-desktop {
  flex: 1;
}

.menu-mobile-btn {
  display: none;
  margin-left: auto;
  color: white;
}

.content {
  padding: 100px 20px 100px 20px;
  min-height: calc(100vh - 128px);
}

.footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  background: #f0f2f5;
  padding: 15px 20px;
}

.footer .social-links a {
  margin: 0 10px;
  font-size: 18px;
  color: #595959;
  text-decoration: none;
}

.footer .social-links a:hover {
  color: #1890ff;
}

/* Puntito verde */
.admin-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #52c41a;
  vertical-align: middle;
}

@media (max-width: 768px) {
  .menu-desktop {
    display: none;
  }
  .menu-mobile-btn {
    display: block;
  }
  .footer .social-links a {
    display: block;
    margin: 5px 0;
  }
}
</style>

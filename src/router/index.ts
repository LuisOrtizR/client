import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AboutMeView from '../views/AboutMeView.vue';
import ProjectsView from '../views/ProjectsView.vue';
import ContactView from '../views/ContactView.vue';
import AdminDashboardView from '../views/AdminDashboardView.vue';
import AdminLoginView from '../views/AdminLoginView.vue';

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/about-me', name: 'AboutMe', component: AboutMeView },
  { path: '/projects', name: 'Projects', component: ProjectsView },
  { path: '/contact', name: 'Contact', component: ContactView },
  { path: '/admin-login', name: 'AdminLogin', component: AdminLoginView },
  { path: '/admin', name: 'AdminDashboard', component: AdminDashboardView, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 🔹 Guard global
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('adminToken');
  const expiry = localStorage.getItem('adminTokenExpiry');

  // Ruta protegida
  if (to.meta.requiresAuth) {
    if (!token || !expiry || Date.now() > parseInt(expiry)) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminTokenExpiry');
      return next('/admin-login'); // 🚀 Forzar redirección
    }
  }

  // Si ya hay token y el usuario va a login, redirigir a dashboard
  if (to.path === '/admin-login' && token && expiry && Date.now() < parseInt(expiry)) {
    return next('/admin');
  }

  next();
});

export default router;

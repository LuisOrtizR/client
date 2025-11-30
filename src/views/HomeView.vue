<template>
  <a-layout style="min-height: 100vh; background: #f0f2f5;">
    <a-row justify="center" style="padding: 80px 20px">
      <a-col :xs="24" :sm="22" :md="18" :lg="14">
        <a-card bordered style="text-align:center; border-radius:10px; padding:40px;">
          <!-- Título -->
          <h1 class="title">Bienvenido a mi Portafolio</h1>

          <!-- Subtítulo -->
          <p class="subtitle">
            Portafolio profesional completo con <strong>Frontend</strong>, <strong>Backend</strong>, 
            integración de <strong>bases de datos</strong> y <strong>despliegue optimizado</strong>.
          </p>

          <!-- Texto adicional -->
          <p class="text">
            Aquí comparto los proyectos que desarrollo utilizando las tecnologías que domino:
          </p>

          <!-- Cards de tecnologías -->
          <a-row justify="center" :gutter="[24, 24]" style="margin-top:30px">
            <!-- Frontend -->
            <a-col :xs="24" :sm="8">
              <a-card hoverable style="border-radius:8px; text-align:center; height:100%">
                <CodeOutlined class="icon" />
                <h3 class="card-title">Frontend</h3>
                <p class="card-text">
                  Vue 3 + Vite + Ant Design
                  <br />
                  <a href="https://vuejs.org/" target="_blank">Vue Docs</a> | 
                  <a href="https://vitejs.dev/" target="_blank">Vite Docs</a> | 
                  <a href="https://ant.design/components/overview/" target="_blank">Ant Design Docs</a>
                </p>
              </a-card>
            </a-col>

            <!-- Backend -->
            <a-col :xs="24" :sm="8">
              <a-card hoverable style="border-radius:8px; text-align:center; height:100%">
                <DatabaseOutlined class="icon" />
                <h3 class="card-title">Backend</h3>
                <p class="card-text">
                  NestJS + Prisma + MySQL
                  <br />
                  <a href="https://docs.nestjs.com/" target="_blank">NestJS Docs</a> | 
                  <a href="https://www.prisma.io/docs/" target="_blank">Prisma Docs</a> | 
                  <a href="https://dev.mysql.com/doc/" target="_blank">MySQL Docs</a>
                </p>
              </a-card>
            </a-col>

            <!-- Deploy -->
            <a-col :xs="24" :sm="8">
              <a-card hoverable style="border-radius:8px; text-align:center; height:100%">
                <DeploymentUnitOutlined class="icon" />
                <h3 class="card-title">Deploy & CI/CD</h3>
                <p class="card-text">
                  Despliegue optimizado de aplicaciones full-stack
                  <br />
                  <a href="https://vercel.com/docs" target="_blank">Vercel</a> | 
                  <a href="https://www.netlify.com/docs/" target="_blank">Netlify</a>
                </p>
              </a-card>
            </a-col>
          </a-row>

          <!-- Texto adicional -->
          <p class="text" style="margin-top:30px; text-align:justify;">
            Tengo experiencia integrando APIs, automatizando procesos y documentando cada proyecto para 
            asegurar calidad y mantenibilidad. Aprendo rápido, soy analítico y orientado a resultados.
          </p>
        </a-card>
      </a-col>
    </a-row>
  </a-layout>
</template>

<script lang="ts" setup>
import { CodeOutlined, DatabaseOutlined, DeploymentUnitOutlined } from '@ant-design/icons-vue';
</script>

<style scoped>
.title {
  color: #1890ff;
  font-size: 2.4rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.15rem;
  color: #333;
  margin-bottom: 1rem;
  text-align: justify;
}

.text {
  font-size: 1rem;
  color: #444;
  text-align: justify;
  margin-bottom: 1rem;
}

.icon {
  font-size: 48px;
  margin-bottom: 10px;
  color: #096dd9;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 5px;
}

.card-text {
  font-size: 0.95rem;
  color: #595959;
}

.card-text a {
  color: #1890ff;
  text-decoration: underline;
}

a-card:hover {
  transform: translateY(-3px);
  transition: transform 0.3s;
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }
  .subtitle, .text {
    font-size: 0.95rem;
  }
  .icon {
    font-size: 40px;
  }
}
</style>

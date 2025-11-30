import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.ts';

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';

// Registrar íconos globalmente
import * as Icons from '@ant-design/icons-vue';

const app = createApp(App);
app.use(router);
app.use(Antd);

Object.keys(Icons).forEach((key) => {
  app.component(key, (Icons as any)[key]);
});

app.mount('#app');

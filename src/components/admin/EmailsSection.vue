<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  message,
  Modal,
  Spin,
  Badge,
  Avatar,
  Tooltip,
} from 'ant-design-vue';
import {
  MailOutlined,
  DeleteOutlined,
  SearchOutlined,
  InboxOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  MoreOutlined,
} from '@ant-design/icons-vue';
import axios from 'axios';

interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  starred?: boolean;
}

const BASE_URL = 'http://localhost:3000/contacts';

const contacts = ref<Contact[]>([]);
const loading = ref<boolean>(false);
const selectedContact = ref<Contact | null>(null);
const selectedIds = ref<string[]>([]);
const searchTerm = ref<string>('');
const filterMode = ref<'all' | 'unread' | 'read'>('all');

const page = ref(1);
const pageSize = ref(10);

const loadContacts = async () => {
  loading.value = true;
  try {
    const res = await axios.get<Contact[]>(BASE_URL);
    contacts.value = res.data.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  } catch {
    message.error('Error al cargar los mensajes');
  } finally {
    loading.value = false;
  }
};

const filteredContacts = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  return contacts.value.filter((c) => {
    if (filterMode.value === 'unread' && c.isRead) return false;
    if (filterMode.value === 'read' && !c.isRead) return false;
    if (!term) return true;
    return (
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.message.toLowerCase().includes(term)
    );
  });
});

const totalFiltered = computed(() => filteredContacts.value.length);

const paginatedContacts = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredContacts.value.slice(start, start + pageSize.value);
});

const selectContact = async (contact: Contact) => {
  selectedContact.value = contact;
  if (!contact.isRead) {
    try {
      await axios.patch(`${BASE_URL}/${contact.id}`, { isRead: true });
      const found = contacts.value.find((c) => c.id === contact.id);
      if (found) found.isRead = true;
      selectedContact.value.isRead = true;
    } catch {}
  }
};

const toggleSelection = (id: string, checked: boolean) => {
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value.push(id);
  } else {
    selectedIds.value = selectedIds.value.filter((i) => i !== id);
  }
};

const selectAll = (checked: boolean) => {
  if (checked) {
    selectedIds.value = paginatedContacts.value.map(c => c.id);
  } else {
    selectedIds.value = [];
  }
};

const deleteContact = async (id: string) => {
  Modal.confirm({
    title: '¿Eliminar mensaje?',
    content: 'Este mensaje se eliminará permanentemente.',
    okText: 'Eliminar',
    cancelText: 'Cancelar',
    okType: 'danger',
    onOk: async () => {
      try {
        await axios.delete(`${BASE_URL}/${id}`);
        message.success('Mensaje eliminado');
        if (selectedContact.value?.id === id) selectedContact.value = null;
        selectedIds.value = selectedIds.value.filter((i) => i !== id);
        await loadContacts();
      } catch {
        message.error('Error al eliminar');
      }
    },
  });
};

const deleteSelected = async () => {
  if (!selectedIds.value.length) {
    return message.warning('Selecciona al menos un mensaje');
  }
  Modal.confirm({
    title: `¿Eliminar ${selectedIds.value.length} mensajes?`,
    content: 'Esta acción no se puede deshacer.',
    okText: 'Eliminar',
    cancelText: 'Cancelar',
    okType: 'danger',
    onOk: async () => {
      try {
        await Promise.all(selectedIds.value.map((id) => axios.delete(`${BASE_URL}/${id}`)));
        message.success(`${selectedIds.value.length} mensajes eliminados`);
        selectedIds.value = [];
        selectedContact.value = null;
        await loadContacts();
      } catch {
        message.error('Error al eliminar mensajes');
      }
    },
  });
};

const toggleReadFromCard = async () => {
  if (!selectedContact.value) return;
  const id = selectedContact.value.id;
  try {
    const newRead = !selectedContact.value.isRead;
    await axios.patch(`${BASE_URL}/${id}`, { isRead: newRead });
    const c = contacts.value.find((x) => x.id === id);
    if (c) c.isRead = newRead;
    selectedContact.value.isRead = newRead;
    message.success(newRead ? 'Marcado como leído' : 'Marcado como no leído');
  } catch {
    message.error('Error al actualizar');
  }
};

const markAsRead = async (ids: string[]) => {
  try {
    await Promise.all(ids.map(id => axios.patch(`${BASE_URL}/${id}`, { isRead: true })));
    ids.forEach(id => {
      const c = contacts.value.find(x => x.id === id);
      if (c) c.isRead = true;
    });
    message.success('Marcados como leídos');
    selectedIds.value = [];
  } catch {
    message.error('Error al actualizar');
  }
};

const unreadCount = computed(() => contacts.value.filter((c) => !c.isRead).length);

const replyByEmail = (email: string) => {
  window.location.href = `mailto:${encodeURIComponent(email)}`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Ayer';
  } else if (days < 7) {
    return date.toLocaleDateString('es', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  }
};

const allSelected = computed(() => 
  paginatedContacts.value.length > 0 && 
  paginatedContacts.value.every(c => selectedIds.value.includes(c.id))
);

const currentPage = computed({
  get: () => page.value,
  set: (val: number) => { page.value = val; }
});

onMounted(() => {
  loadContacts();
});
</script>

<template>
  <div class="gmail-container">
    <!-- HEADER -->
    <div class="gmail-header">
      <div class="flex items-center gap-3">
        <MailOutlined style="font-size:24px; color:#1890ff;" />
        <h1 class="gmail-title">Mensajes de contacto</h1>
      </div>
      <div class="flex items-center gap-2">
        <Badge :count="unreadCount" :offset="[-5, 5]">
          <a-button 
            :type="filterMode === 'unread' ? 'primary' : 'default'"
            @click="filterMode = 'unread'"
            size="large"
          >
            <InboxOutlined /> No leídos
          </a-button>
        </Badge>
        <Tooltip title="Recargar">
          <a-button @click="loadContacts" :loading="loading" size="large">
            <ReloadOutlined />
          </a-button>
        </Tooltip>
      </div>
    </div>

    <div class="gmail-main-layout">
      <!-- SIDEBAR -->
      <div class="gmail-sidebar">
        <div class="sidebar-content">
          <a-menu 
            :selectedKeys="[filterMode]" 
            mode="inline"
            style="border: none;"
          >
            <a-menu-item key="all" @click="filterMode='all'; page=1">
              <InboxOutlined />
              <span>Todos los mensajes</span>
              <span class="menu-count">{{ contacts.length }}</span>
            </a-menu-item>
            <a-menu-item key="unread" @click="filterMode='unread'; page=1">
              <MailOutlined />
              <span>No leídos</span>
              <Badge :count="unreadCount" :offset="[10, 0]" />
            </a-menu-item>
            <a-menu-item key="read" @click="filterMode='read'; page=1">
              <CheckCircleOutlined />
              <span>Leídos</span>
            </a-menu-item>
          </a-menu>
        </div>
      </div>

      <!-- CONTENIDO PRINCIPAL -->
      <div class="gmail-content">
        <div class="messages-column">
          <!-- BARRA DE HERRAMIENTAS -->
          <div class="toolbar">
          <div class="toolbar-left">
            <a-checkbox 
              :checked="allSelected"
              :indeterminate="selectedIds.length > 0 && !allSelected"
              @change="(e: any) => selectAll(e.target.checked)"
            />
            
            <a-dropdown v-if="selectedIds.length > 0">
              <a-button>
                Acciones ({{ selectedIds.length }})
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="markAsRead(selectedIds)">
                    <CheckCircleOutlined /> Marcar como leídos
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item danger @click="deleteSelected">
                    <DeleteOutlined /> Eliminar
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>

            <a-button 
              v-else 
              type="text" 
              disabled
              style="color: #5f6368;"
            >
              {{ totalFiltered }} mensaje{{ totalFiltered !== 1 ? 's' : '' }}
            </a-button>
          </div>

          <div class="toolbar-right">
            <a-input
              v-model:value="searchTerm"
              placeholder="Buscar mensajes..."
              allowClear
              style="width: 300px;"
            >
              <template #prefix>
                <SearchOutlined />
              </template>
            </a-input>
          </div>
        </div>

        <!-- LISTA DE MENSAJES -->
        <div class="message-list" :class="{ 'with-detail': selectedContact }">
          <Spin :spinning="loading">
            <div v-if="paginatedContacts.length === 0" class="empty-state">
              <InboxOutlined style="font-size: 64px; color: #d9d9d9;" />
              <p class="empty-text">
                {{ searchTerm ? 'No se encontraron mensajes' : 'No hay mensajes' }}
              </p>
            </div>

            <div 
              v-for="contact in paginatedContacts" 
              :key="contact.id"
              class="message-item"
              :class="{ 
                'message-unread': !contact.isRead,
                'message-selected': selectedContact?.id === contact.id 
              }"
              @click="selectContact(contact)"
            >
              <a-checkbox
                :checked="selectedIds.includes(contact.id)"
                @change="(e:any) => toggleSelection(contact.id, e.target.checked)"
                @click.stop
              />
              
              <Avatar 
                :size="40" 
                :style="{ 
                  background: contact.isRead ? '#d9d9d9' : '#1890ff',
                  fontWeight: 600
                }"
              >
                {{ contact.name[0].toUpperCase() }}
              </Avatar>

              <div class="message-content">
                <div class="message-header">
                  <span class="message-sender" :class="{ 'font-bold': !contact.isRead }">
                    {{ contact.name }}
                  </span>
                  <span class="message-date">{{ formatDate(contact.createdAt) }}</span>
                </div>
                <div class="message-subject">
                  <span v-if="!contact.isRead" class="unread-dot"></span>
                  {{ contact.email }}
                </div>
                <div class="message-preview">
                  {{ contact.message.substring(0, 100) }}{{ contact.message.length > 100 ? '...' : '' }}
                </div>
              </div>
            </div>
          </Spin>

          <div v-if="totalFiltered > pageSize" class="pagination-container">
            <a-pagination
              :total="totalFiltered"
              :pageSize="pageSize"
              v-model:current="currentPage"
              :show-size-changer="false"
              simple
            />
          </div>
        </div>
      </div>

        <!-- PANEL DERECHO - DETALLE DEL MENSAJE -->
        <div 
          v-if="selectedContact"
          class="message-detail"
        >
          <div class="detail-header">
            <div class="flex items-center gap-3">
              <Avatar size="large" style="background:#1890ff; font-weight: 600;">
                {{ selectedContact.name[0].toUpperCase() }}
              </Avatar>
              <div>
                <div class="detail-name">{{ selectedContact.name }}</div>
                <div class="detail-email">{{ selectedContact.email }}</div>
              </div>
            </div>
            <a-dropdown>
              <a-button type="text">
                <MoreOutlined style="font-size: 20px;" />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="toggleReadFromCard">
                    {{ selectedContact.isRead ? 'Marcar como no leído' : 'Marcar como leído' }}
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item danger @click="deleteContact(selectedContact.id)">
                    <DeleteOutlined /> Eliminar
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>

          <div class="detail-meta">
            <span>{{ new Date(selectedContact.createdAt).toLocaleString('es', { 
              dateStyle: 'long', 
              timeStyle: 'short' 
            }) }}</span>
          </div>

          <div class="detail-body">
            <div class="message-content-box">
              {{ selectedContact.message }}
            </div>
          </div>

          <div class="detail-actions">
            <a-button 
              type="primary" 
              size="large"
              @click="replyByEmail(selectedContact.email)"
            >
              <MailOutlined /> Responder
            </a-button>
            <a-button 
              size="large"
              danger
              @click="deleteContact(selectedContact.id)"
            >
              <DeleteOutlined /> Eliminar
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gmail-container {
  background: #f5f5f5;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.gmail-header {
  background: #fff;
  border-bottom: 1px solid #e8eaed;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  flex-shrink: 0;
}

.gmail-title {
  margin: 0;
  font-size: 22px;
  font-weight: 400;
  color: #202124;
}

.gmail-main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.gmail-sidebar {
  width: 200px;
  background: #fff;
  border-right: 1px solid #e8eaed;
  flex-shrink: 0;
  overflow-y: auto;
}

.sidebar-content {
  padding: 8px 0;
}

.menu-count {
  margin-left: auto;
  color: #5f6368;
  font-size: 13px;
}

.gmail-content {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  min-width: 0;
}

.messages-column {
  display: flex;
  flex-direction: column;
  flex: 0 0 400px;
  width: 400px;
  min-width: 350px;
  overflow: hidden;
  border-right: 1px solid #e8eaed;
}

.toolbar {
  background: #fff;
  border-bottom: 1px solid #e8eaed;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 56px;
  flex-shrink: 0;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.message-list {
  background: #fff;
  overflow-y: auto;
  flex: 1;
}

.message-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
}

.message-item:hover {
  background: #f5f5f5;
  box-shadow: inset 1px 0 0 #dadce0, inset -1px 0 0 #dadce0;
}

.message-unread {
  background: #f8f9fa;
}

.message-selected {
  background: #e8f0fe !important;
  border-left: 3px solid #1890ff;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.message-sender {
  font-size: 14px;
  color: #202124;
}

.font-bold {
  font-weight: 600;
}

.message-date {
  font-size: 12px;
  color: #5f6368;
  white-space: nowrap;
}

.message-subject {
  font-size: 13px;
  color: #5f6368;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #1890ff;
  border-radius: 50%;
  display: inline-block;
}

.message-preview {
  font-size: 13px;
  color: #80868b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-detail {
  background: #fff;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.detail-header {
  padding: 20px;
  border-bottom: 1px solid #e8eaed;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-shrink: 0;
}

.detail-name {
  font-size: 16px;
  font-weight: 500;
  color: #202124;
}

.detail-email {
  font-size: 13px;
  color: #5f6368;
}

.detail-meta {
  padding: 12px 20px;
  font-size: 12px;
  color: #5f6368;
  border-bottom: 1px solid #e8eaed;
  flex-shrink: 0;
}

.detail-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.message-content-box {
  background: #f8f9fa;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  padding: 16px;
  line-height: 1.6;
  color: #202124;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.detail-actions {
  padding: 16px 20px;
  border-top: 1px solid #e8eaed;
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.empty-text {
  margin-top: 16px;
  font-size: 16px;
  color: #5f6368;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 16px;
  border-top: 1px solid #e8eaed;
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

:deep(.ant-menu-item) {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 40px;
  margin: 4px 8px;
  border-radius: 0 20px 20px 0;
}

:deep(.ant-menu-item-selected) {
  background: #d3e3fd !important;
  color: #1890ff !important;
}
</style>
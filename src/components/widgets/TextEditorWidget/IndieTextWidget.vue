<template>
    <div class="file-window">
      <!-- 工具栏按钮栏 -->
      <div class="title-bar">
        <span class="title">
            <img :src="icons.notepad" class="icon-flielist" alt="New Document" />
          {{ title }}
        </span>
        <div class="toolbar-buttons">
            <button class="icon-btn" @click="$emit('request-move', id)" title="Move"><img :src="icons.joystick" class="icon-flielist" alt="move" /></button>
            <button class="icon-btn" @click="toggleSize" title="expend in/out"><img :src="icons.search" class="icon-flielist" alt="expend" /></button>
          <button class="icon-btn" @click="$emit('delete-widget', id)" title="Minimize"><img :src="icons.executable" class="icon-flielist" alt="remove" /></button>
        </div>
      </div>

      <!-- 内容展示区域 -->
      <div class="content-area">
        <div class="file-preview-box" v-html="content"></div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, inject, watchEffect,defineProps, onUnmounted } from 'vue'
import { icons } from '@/assets/icon/iconRegistry'
import { activeIndieFiles } from '@/scripts/editorState.js'

const props = defineProps({
  fileId: { type: String, required: true },
  id: { type: String, required: true },
  sizeKey: { type: String, default: 'W' }
})

const emit = defineEmits(['delete-widget', 'resize-widget', 'request-move'])

const auth = inject('auth')
const content = ref('⏳ Loading...')

const safeUserId = computed(() =>
  typeof auth?.currentUser?.value === 'string' && auth.currentUser.value.length > 0
    ? auth.currentUser.value
    : 'guest'
)

const STORAGE_KEY = computed(() => `text_editor_files_user_${safeUserId.value}`)

const title = computed(() => {
  const list = JSON.parse(localStorage.getItem(STORAGE_KEY.value) || '[]')
  return list.find(f => f.id === props.fileId)?.title || 'Unknown Title'
})

watchEffect(() => {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY.value) || '[]')
    const match = list.find(f => f.id === props.fileId)
    content.value = match?.content || '⚠️ The document does not exist or is empty.'
  } catch (e) {
    console.error('❌ Failed to load content from localStorage:', e)
    content.value = '⚠️ fail to load'
  }
})

function toggleSize() {
  const next = props.sizeKey === 'W' ? 'L' : 'W'
  emit('resize-widget', { id: props.id, nextSizeKey: next })
}

onUnmounted(() => {
  if (props.fileId) {
    activeIndieFiles.delete(props.fileId)
    console.log('🗑️ Unregistered widget file ID:', props.fileId)
  }
})
</script>

<style scoped>
.file-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #c0c0c0;
  border: 2px solid black;
  box-shadow: inset -2px -2px #ffffff, inset 2px 2px #808080;
  padding: 6px;
  font-family: 'Courier New', monospace;
}

.title-bar {
  background-color: #000080;
  color: white;
  padding: 4px;
  font-weight: bold;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}
.title {
  flex: 1;                          
  overflow: hidden;                 
  white-space: nowrap;             
  text-overflow: ellipsis;         
  display: block;
  margin-left: 4px;                  
}

.icon-filelist {
  width: 16px;
  height: 16px;
  image-rendering: pixelated;
}

.toolbar-buttons {
  margin-left: auto;
  display: flex;
  gap: 4px;
}

.icon-btn {
  width: 24px;
  height: 24px;
  aspect-ratio: 1 / 1;
  padding: 0;
  border: 2px outset #fff;
  box-shadow: inset -1px -1px #fff, inset 1px 1px #808080;
  font-size: 16px;                     
  line-height: 1;
  font-family: 'Segoe UI Emoji', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
}

.icon-btn:active {
  border-style: inset;
  box-shadow: inset 1px 1px #fff, inset -1px -1px #808080;
}

.content-area {
  flex: 1;
  padding: 8px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.file-preview-box {
  background-color: #fff;
  border: 2px inset #ccc;
  padding: 10px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  white-space: pre-wrap;
  word-break: break-word;
  width: 100%;
  box-sizing: border-box;
}
</style>

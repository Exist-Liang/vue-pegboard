<template>
    <div class="file-window">
      <!-- Main Title Bar -->
      <div class="title-bar">
  <span class="title">
    <img :src="icons.windows" class="icon-filelist" alt="My Files">
    File Explorer
  </span>
  <button
  v-if="showEasterEggButton && currentView === 'folder'"
  @click="togglePlay"
  class="easter-egg-btn"
  title="Return to the Millennium"
>
  <img :src="icons.play" alt="Play" class="easter-egg-icon" />
</button>
</div>
      
      <div v-if="pendingPlacement?.id" class="overlay-mask">
        <button class="cancel-button" @click="cancelPreview"><img :src="icons.trustRestrict" alt="Cancel" > </button>
</div>

      <!-- Main Menu -->
      <div class="content-area" v-if="currentView === 'folder'">
        <div class="file-item" @click="openEditor">
          <img :src="icons.notepad" class="icon-menu" alt="New Document" /> New Document
        </div>
        <div class="file-item" @click="currentView = 'myFiles'">
          <img :src="icons.folderClosed" class="icon-menu" alt="My Files" /> My Files
        </div>
        <div class="file-item" @click="currentView = 'trash'">
          <img :src="icons.recycleBin" class="icon-menu" alt="Recycle Bin" /> Recycle Bin
        </div>
      </div>
  
      <!-- Editor View -->
      <div class="content-area" v-else-if="currentView === 'editor'">
        <div class="sub-window-wrapper">
          <div class="editor-container">
            <div class="editor-title-bar title-bar-base">
              <span class="title">
                <img :src="icons.wordpad" class="icon-titlebar" alt="Editor" />
                Text Editor
              </span>
              <div class="actions">
                <button @click="saveFile" title="Save">
                  <img :src="icons.trust" class="icon-titlebar" alt="Save" />
                </button>
                <button @click="goBack" title="Back">
                  <img :src="icons.wm" class="icon-titlebar" alt="Back" />
                </button>
              </div>
            </div>
  
            <div class="title-input-wrapper">
              <input
                v-model="newTitle"
                class="text-input"
                placeholder="Enter Title (Optional)"
                maxlength="50"
              />
              <span class="char-counter">{{ newTitle.length }}/50</span>
            </div>
  
            <div class="textarea-wrapper">
              <div
                ref="editorRef"
                class="editor-contenteditable"
                contenteditable="true"
                @input="onInput"
              ></div>
  
              <div class="editor-toolbar">
                <div class="toolbar-buttons">
                  <button @click="toggleBold" :class="{ active: isBold }" title="Bold">B</button>
                  <button @click="toggleItalic" :class="{ active: isItalic }" title="Italic">I</button>
                  <button @click="toggleColorPicker" title="Text Color">
                    <span class="color-indicator" :style="{ backgroundColor: currentColor }"></span>
                  </button>
                </div>
                <span class="char-counter">{{ contentLength }}/500</span>
              </div>
  
              <div class="color-picker" v-if="showColorPicker">
                <span
                  v-for="(color, i) in colors"
                  :key="i"
                  class="color-swatch"
                  :style="{ backgroundColor: color }"
                  @click="execColor(color)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- My Files View -->
      <div class="content-area" v-else-if="currentView === 'myFiles'">
        <div class="sub-window-wrapper">
          <div class="files-title-bar title-bar-base sticky">
            <span class="title">
              <img :src="icons.folderClosed" class="icon-menu" alt="My Files" /> {{ isTrashMode ? 'Deleting...' : 'My Files' }}
            </span>
            <div class="actions">
              <button @click="toggleTrashMode" title="Toggle Delete Mode">
                <img :src="icons.recycleBin" class="icon-titlebar" alt="Deletion mode" />
              </button>
              <button @click="goBack" title="Back">
                <img :src="icons.wm" class="icon-titlebar" alt="Back" />
              </button>
            </div>
          </div>
          <div class="file-browser-body">
            <div class="search-bar-container">
              <input
                class="search-input"
                v-model="searchQuery"
                placeholder="🔍 Search title or content"
              />
              <span class="file-count">{{ filteredFiles.length }} Files</span>
            </div>
            <div class="files-scroll-container">
              <div
  class="file-item"
  :class="{
    'file-item-delete': isTrashMode,
    'file-item-disabled': isPinned(file.id)
  }"
  v-for="(file, index) in savedFiles"
  :key="index"
  @click="!isPinned(file.id) && (isTrashMode ? moveToTrash(index) : openSaved(index))"
>
  <img :src="icons.notepad" class="icon-filelist" />
  <span class="file-title" :title="file.title">{{ file.title }}</span>
</div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Trash View -->
      <div class="content-area" v-else-if="currentView === 'trash'">
        <div class="sub-window-wrapper">
          <div class="files-title-bar title-bar-base sticky">
            <span class="title">
              <img :src="icons.recycleBin" class="icon-titlebar" />
              {{ recoverMode ? 'Recovering...' : deleteMode ? 'Deleting...' : 'Recycle Bin' }}
            </span>
            <div class="actions">
              <button class="btn-recover" :class="{ active: recoverMode }" @click="toggleRecoverMode" title="Toggle Rover Mode"><img :src="icons.outlook" class="icon-titlebar" alt="Recvoer" > </button>
              <button class="btn-delete" :class="{ active: deleteMode }" @click="toggleDeleteMode" title="Toggle Deletion Mode">
                <img :src="icons.recycleBin" class="icon-titlebar" alt="Delete mode" />
              </button>
              <button @click="goBack" title="Back">
                <img :src="icons.wm" class="icon-titlebar" alt="Back" />
              </button>
            </div>
          </div>
          <div class="files-scroll-container">
            <div
              class="file-item"
              v-for="(file, index) in trashFiles"
              :key="index"
              :class="{
                'file-item-recover': recoverMode,
                'file-item-delete': deleteMode
              }"
              @click="handleTrashFileClick(index)"
            >
              <img :src="icons.notepad" class="icon-filelist"  />
              <span class="file-title" :title="file.title">{{ file.title }}</span>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Document Preview -->
      <div class="content-area" v-else-if="currentView === 'viewSaved'">
        <div class="sub-window-wrapper">
          <div class="preview-title-bar title-bar-base">
            <span class="title ellipsis-title" :title="savedFiles[selectedIndex].title">
              <img :src="icons.notepad" class="icon-titlebar"  /> {{ savedFiles[selectedIndex].title }}
            </span>
            <div class="actions">
              <button @click="editFile" title="Edit"><img :src="icons.writeFile" class="icon-titlebar" alt="edit" ></button>
              <button @click="spawnIndieWidget" title="Pin to Pegboard"><img :src="icons.accessibility" class="icon-titlebar" alt="Pin" ></button>
              <button @click="goBackToMyFiles" title="Back">
                <img :src="icons.wm" class="icon-titlebar" alt="Back" />
              </button>
            </div>
          </div>
          <div class="preview-container file-preview-box" v-html="savedFiles[selectedIndex].content"></div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
import { ref, computed, inject, watch, nextTick,onMounted,watchEffect } from 'vue'
import { nanoid } from 'nanoid'
import { icons } from '@/assets/icon/iconRegistry'
import { widgetSizes } from '@/data/widgetTypes.js'
import { widgetMetadata } from '@/components/widgets/registry.js'
import { showClickPreview, removeClickPreview } from '@/scripts/useClickPreview.js'
import { activeIndieFiles } from '@/scripts/editorState.js'

const auth = inject('auth')
const pendingPlacement = inject('pendingPlacement')
const widgets = inject('widgets')

const currentView = ref('folder')
const newTitle = ref('')
const newContent = ref('')
const selectedIndex = ref(null)
const isEditing = ref(false)
const isTrashMode = ref(false)
const searchQuery = ref('')
const showColorPicker = ref(false)
const colors = ['black', 'red', 'blue', 'green']
const editorRef = ref(null)
const contentLength = ref(0)
const currentColor = ref('black')
const isBold = ref(false)
const isItalic = ref(false)
const savedFiles = ref([])
const trashFiles = ref([])
const recoverMode = ref(false)
const deleteMode = ref(false)


function resetEditorState() {
  isBold.value = false
  isItalic.value = false
  currentColor.value = 'black'
  contentLength.value = 0
  if (editorRef.value) editorRef.value.innerHTML = ''
}

function openEditor() {
  newTitle.value = ''
  newContent.value = ''
  currentView.value = 'editor'
  resetEditorState()
}

function editFile() {
  isEditing.value = true
  currentView.value = 'editor'
  const file = savedFiles.value[selectedIndex.value]
  newTitle.value = file.title
  nextTick(() => {
    if (editorRef.value) {
      editorRef.value.innerHTML = file.content
      onInput()
    }
  })
}

function getSafeUserId() {
  return typeof auth.currentUser?.value === 'string' && auth.currentUser.value.length > 0
    ? auth.currentUser.value
    : 'guest'
}

const STORAGE_KEY = computed(() => `text_editor_files_user_${getSafeUserId()}`)
const STORAGE_TRASH_KEY = computed(() => `trash_files_user_${getSafeUserId()}`)

function loadFiles() {
  const raw = localStorage.getItem(STORAGE_KEY.value)
  savedFiles.value = raw ? JSON.parse(raw) : []
}

function saveFiles() {
  localStorage.setItem(STORAGE_KEY.value, JSON.stringify(savedFiles.value))
}

function loadTrash() {
  const raw = localStorage.getItem(STORAGE_TRASH_KEY.value)
  trashFiles.value = raw ? JSON.parse(raw) : []
}

function saveTrash() {
  localStorage.setItem(STORAGE_TRASH_KEY.value, JSON.stringify(trashFiles.value))
}

watch(savedFiles, saveFiles, { deep: true })
watch(trashFiles, saveTrash, { deep: true })

watch(() => auth.currentUser?.value, () => {
  loadFiles()
  loadTrash()
})

window.addEventListener('dashboard-imported', () => {
  loadFiles()
  loadTrash()
})

function saveFile() {
  const html = editorRef.value.innerHTML.trim()
  const plainText = editorRef.value.innerText.trim()
  if (plainText.length === 0) return

  let baseTitle = newTitle.value.trim() || `Unnamed Doc`
  if (!baseTitle.endsWith('.txt')) baseTitle += '.txt'

  if (isEditing.value && selectedIndex.value !== null) {
    const original = savedFiles.value[selectedIndex.value]
    savedFiles.value[selectedIndex.value] = {
      ...original,
      title: baseTitle,
      content: html
    }
    isEditing.value = false
  } else {
    let title = baseTitle
    let count = 1
    const existingTitles = savedFiles.value.map(f => f.title)
    while (existingTitles.includes(title)) {
      const nameWithoutExt = baseTitle.replace(/\.txt$/, '')
      title = `${nameWithoutExt}(${count}).txt`
      count++
    }
    savedFiles.value.push({
      id: nanoid(),
      title,
      content: html
    })
  }

  currentView.value = 'myFiles'
}

function openSaved(index) {
  selectedIndex.value = index
  currentView.value = 'viewSaved'
}

function goBack() {
  recoverMode.value = false
  deleteMode.value = false
  isTrashMode.value = false
  selectedIndex.value = null
  currentView.value = 'folder'
}

function goBackToMyFiles() {
  recoverMode.value = false
  deleteMode.value = false
  isTrashMode.value = false
  selectedIndex.value = null
  currentView.value = 'myFiles'
}

function toggleBold() {
  editorRef.value.focus()
  document.execCommand('bold', false, null)
  requestAnimationFrame(() => {
    isBold.value = document.queryCommandState('bold')
  })
}

function toggleItalic() {
  editorRef.value.focus()
  document.execCommand('italic', false, null)
  requestAnimationFrame(() => {
    isItalic.value = document.queryCommandState('italic')
  })
}

function execColor(color) {
  editorRef.value.focus()
  document.execCommand('foreColor', false, color)
  currentColor.value = color
  showColorPicker.value = false
}

function toggleColorPicker() {
  showColorPicker.value = !showColorPicker.value
}

function onInput() {
  const length = editorRef.value.innerText.length
  const text = editorRef.value.innerText.replace(/\u200B/g, '').trim()
  contentLength.value = text.length
  if (length > 500) {
    editorRef.value.innerText = editorRef.value.innerText.slice(0, 500)
    contentLength.value = 500
  }
}

document.addEventListener('selectionchange', () => {
  isBold.value = document.queryCommandState('bold')
  isItalic.value = document.queryCommandState('italic')
})

const filteredFiles = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return savedFiles.value
  return savedFiles.value.filter(f =>
    f.title.toLowerCase().includes(query) ||
    f.content.toLowerCase().includes(query)
  )
})

function toggleTrashMode() {
  isTrashMode.value = !isTrashMode.value
}

function moveToTrash(index) {
  const removed = savedFiles.value.splice(index, 1)[0]
  trashFiles.value.push(removed)
}

function handleTrashFileClick(index) {
  if (recoverMode.value) {
    const file = trashFiles.value.splice(index, 1)[0]
    let title = file.title.replace(/\.txt$/, '')
    let ext = '.txt'
    let count = 1
    const existing = savedFiles.value.map(f => f.title)

    let newTitle = `${title}${ext}`
    while (existing.includes(newTitle)) {
      newTitle = `${title}(${count})${ext}`
      count++
    }

    savedFiles.value.push({
      id: nanoid(),
      title: newTitle,
      content: file.content
    })
  }

  if (deleteMode.value) {
    trashFiles.value.splice(index, 1)
  }
}

function toggleDeleteMode() {
  deleteMode.value = !deleteMode.value
  if (deleteMode.value) recoverMode.value = false

  safeUpdateEasterEggState('delete')
}

function toggleRecoverMode() {
  recoverMode.value = !recoverMode.value
  if (recoverMode.value) deleteMode.value = false

  safeUpdateEasterEggState('recover')
}

function isPinned(fileId) {
  return widgets?.value?.some(w => w?.type === 'IndieTextWidget' && w?.props?.fileId === fileId)
}

function spawnIndieWidget() {
  const type = 'IndieTextWidget'
  const sizeKey = 'W'
  const size = widgetSizes[sizeKey] || { w: 2, h: 2 }

  const file = savedFiles.value[selectedIndex.value]
  if (!file) {
    console.warn('⚠️ No file is selected currently, so the widget cannot be generated.')
    return
  }

  const widgetId = `${type}-${sizeKey}-${Date.now()}`
  pendingPlacement.value = {
    id: widgetId,
    renderKey: `${widgetId}-render`,
    type,
    sizeKey,
    x: 0,
    y: 0,
    w: size.w,
    h: size.h,
    props: {
      fileId: file.id,
      id: widgetId
    }
  }

  showClickPreview({
    icon: widgetMetadata[type]?.icon || '📌',
    width: size.w * 40,
    height: size.h * 40
  })

  console.log('📌 IndieTextWidget Preview has been activated. Please click to place.：fileId =', file.id)
  activeIndieFiles.add(file.id)
  goBackToMyFiles()
}

function cancelPreview() {
  removeClickPreview()
  pendingPlacement.value = null
}

watchEffect(() => {
  const currentFile = savedFiles.value[selectedIndex.value]
  if (currentView.value === 'viewSaved' && currentFile) {
    if (activeIndieFiles.has(currentFile.id)) {
      console.warn('🚫 The current file has been pinned. Exit the editing view.')
      goBackToMyFiles()
    }
  }
})

onMounted(() => {
  loadFiles()
  loadTrash()
})


const easterEggSequence = ref([])
const showEasterEggButton = ref(false)

function safeUpdateEasterEggState(modeClicked) {
  if (currentView.value !== 'trash') return
  if (trashFiles.value.length > 0) return

  easterEggSequence.value.push(modeClicked)
  if (easterEggSequence.value.length > 4) {
    easterEggSequence.value.shift() 
  }

  const pattern = easterEggSequence.value.join('-')
  if (pattern === 'delete-recover-recover-delete') {
    showEasterEggButton.value = true
    console.log('Return to the Millennium!')
  }
}

const audioRef = new Audio('./NewBoys.mp3') 

function togglePlay() {
  if (audioRef.paused) {
    audioRef.play()
  } else {
    audioRef.pause()
    audioRef.currentTime = 0
  }
}

</script>

  
  <style scoped>

  .window-box {
    border: 2px solid black;
    box-shadow: inset -2px -2px #fff, inset 2px 2px #808080;
    background-color: #f4f4f4;
    padding: 4px;
  }
  
  .title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 26px;               
  padding: 0 6px;
  background-color: #000080;
  color: white;
  font-size: 13px;
  position: relative;
  overflow: hidden;
}

.title {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.icon-filelist {
  height: 16px;
  width: 16px;
}

.easter-egg-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  border: 2px outset #fff;
  box-shadow: inset -1px -1px #fff, inset 1px 1px #808080;
  background-color: #ececec;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.easter-egg-icon {
  width: 16px;
  height: 16px;
  image-rendering: pixelated; 
}
 .title-bar-base .actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .title-bar-base .actions button {
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
  
  .editor-title-bar {
    height: 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 6px;
    font-size: 12.5px;
    background-color: #000080;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .files-title-bar {
    height: 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 6px;
    font-size: 12.5px;
    background-color: #000080;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .preview-title-bar {
    height: 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 6px;
    font-size: 12.5px;
    background-color: #000080;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  
  .editor-container,
  .preview-container {
    border: 2px solid black;
    box-shadow: inset -2px -2px #fff, inset 2px 2px #808080;
    background-color: #f4f4f4;
    padding: 4px;
    
  }
  
  .files-title-bar.sticky {
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  .files-scroll-container {
    overflow-y: auto;
    height: 220px;
    box-shadow: inset -2px -2px #fff, inset 2px 2px #808080;
    background-color: #f4f4f4;
    padding: 4px;
  }
  
  .preview-container {
  padding: 0;
  overflow: visible;
  height: auto;
  flex-grow: 1;
}
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
  }
  
  .content-area {
    flex: 1;
    padding: 8px;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: hidden;
  }
  
  .file-item {
    background-color: #e0e0e0;
    border: 1px solid #808080;
    padding: 6px;
    cursor: pointer;
    box-shadow: inset -1px -1px #fff, inset 1px 1px #a0a0a0;
  }
  .file-item:hover {
    background-color: #d0d0d0;
  }
  
  .sub-window-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
  
  .title-input-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  
  .text-input {
    width: 100%;
    box-sizing: border-box;
    padding: 6px;
    background-color: #dcdcdc;
    border: 2px inset #fff;
    font-size: 14px;
    font-family: 'Courier New', monospace;
    border-radius: 0;
    outline: none;
  }
  
  .textarea-wrapper {
    position: relative;
  }
  
  .editor-contenteditable {
    width: 100%;
    height: 120px;
    overflow-y: auto;
    padding: 8px;
    font-size: 14px;
    font-family: 'Courier New', monospace;
    background-color: #dcdcdc;
    border: 2px inset #fff;
    border-radius: 0;
    outline: none;
    white-space: pre-wrap;
    word-break: break-word;
  }
  
  .editor-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    margin-top: 4px;
  }
  
  .toolbar-buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
  }
  
  .toolbar-buttons button {
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
  
  .toolbar-buttons button:hover {
    background-color: #ccc;
  }
  
  .toolbar-buttons button.active {
    background-color: #bbb;
    border: 2px inset #666;
    box-shadow: inset 1px 1px 2px #999;
  }
  
  .color-picker {
    position: absolute;
    bottom: 40px;
    right: 0;
    background: #dcdcdc;
    padding: 4px;
    border-top: 2px solid #fff;
    border-left: 2px solid #fff;
    border-bottom: 2px solid #444;
    border-right: 2px solid #444;
    display: flex;
    gap: 4px;
    z-index: 10;
  }
  
  .color-indicator {
    width: 14px;
    height: 14px;
    background-color: currentColor;
    border: 1px solid #444;
    box-shadow: inset -1px -1px #fff, inset 1px 1px #aaa;
    display: inline-block;
  }
  
  .color-swatch {
    width: 20px;
    height: 20px;
    border: 1px solid #000;
    box-shadow: inset -1px -1px #fff, inset 1px 1px #aaa;
    cursor: pointer;
  }
  
  .char-counter {
    font-size: 12px;
    color: #333;
  }
  
  .content-counter {
    position: absolute;
    bottom: 4px;
    right: 8px;
    background: #f4f4f4;
    padding: 0 4px;
    font-family: monospace;
  }
  
  .file-preview-box {
  background-color: #fff;
  border: 2px inset #ccc;
  padding: 10px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  height: 200px;                 
  overflow-y: auto;              
  overflow-x: hidden;
  white-space: pre-wrap;
  word-break: break-word;
  width: 100%;
  box-sizing: border-box;
}
  
  .ellipsis-title {
    display: inline-block;
    max-width: calc(100% - 60px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
  }
  
  .file-title {
    display: inline-block;
    max-width: 85%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
  }

  .file-browser-body {
  border: 2px solid black;
  box-shadow: inset -2px -2px #fff, inset 2px 2px #808080;
  background-color: #f4f4f4;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;                 
  overflow: hidden;
  min-height: 0;           
}

.search-bar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.search-input {
  flex-grow: 1;
  padding: 4px 8px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  border: 2px inset #fff;
  background-color: #dcdcdc;
  outline: none;
}

.file-count {
  font-size: 12px;
  color: #333;
  min-width: 60px;
  text-align: right;
}

.files-scroll-container {
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.file-item-delete {
  background-color: #ff4d4d !important; 
  color: white;
  font-weight: bold;
  border: 1px solid #800000;
  box-shadow: inset -1px -1px #fff0f0, inset 1px 1px #a00000;
}
.file-item-delete:hover {
  background-color: #e04444 !important;
}


.file-item-recover {
  background-color: #90ee90 !important;
  border: 1px solid #006400;
  color: black;
  font-weight: bold;
}

.file-item-delete {
  background-color: #ff4d4d !important;
  border: 1px solid #800000;
  color: white;
  font-weight: bold;
}

.icon {
  vertical-align: middle;
  image-rendering: pixelated; 
}


.icon-titlebar {
  width: 16px;
  height: 16px;
  margin-left: 2px;
  margin-right: 2px;
}


.icon-menu {
  width: 20px;
  height: 20px;
  margin-left: 8px;
  margin-right: 8px;
}


.icon-filelist {
  width: 18px;
  height: 18px;
  margin-left: 6px;
  margin-right: 6px;
}

.overlay-mask {
  position: absolute;
  inset: 0;
  background-color: #c0c0c0;              
  border: 2px inset #808080;              
  z-index: 10;                           
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Courier New', monospace; 
  color: #000;
  font-size: 14px;
  pointer-events: all;                    
  box-shadow: inset 1px 1px #fff, inset -1px -1px #404040;
}
.cancel-button {
  background-color: #dcdcdc;                      
  border: 2px outset #fff;                        
  box-shadow: inset -1px -1px #fff, inset 1px 1px #808080;
  padding: 12px 28px;
  font-size: 18px;
  font-family: 'Courier New', monospace;
  color: #000;
  cursor: pointer;
  user-select: none;
  text-shadow: 1px 1px #f0f0f0;
}

.cancel-button:active {
  border-style: inset;
  box-shadow: inset 1px 1px #fff, inset -1px -1px #808080;
}
.file-item-disabled {
  opacity: 0.4;
  pointer-events: none;
}
  </style>
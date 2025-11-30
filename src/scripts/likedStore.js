import { ref } from 'vue'

export const likedFacts = ref([])
export const trashBin = ref([])

export const likedCacheKey = ref('likedFactCache_shared')

export function loadFromStorage(currentUser = 'guest') {
  const likedKey = `likedFacts_${currentUser}`
  const trashKey = `trashBin_${currentUser}`

  const likedRaw = localStorage.getItem(likedKey)
  const trashRaw = localStorage.getItem(trashKey)

  likedFacts.value = likedRaw ? JSON.parse(likedRaw) : []
  trashBin.value = trashRaw ? JSON.parse(trashRaw) : []
}

export function saveToStorage(currentUser = 'guest') {
  const likedKey = `likedFacts_${currentUser}`
  const trashKey = `trashBin_${currentUser}`

  localStorage.setItem(likedKey, JSON.stringify(likedFacts.value))
  localStorage.setItem(trashKey, JSON.stringify(trashBin.value))
}
export const factHistory = ref([])

export function loadFactHistory(currentUser = 'guest') {
  const key = `factHistory_${currentUser}`
  const raw = localStorage.getItem(key)
  factHistory.value = raw ? JSON.parse(raw) : []
}

export function saveFactHistory(currentUser = 'guest') {
  const key = `factHistory_${currentUser}`
  localStorage.setItem(key, JSON.stringify(factHistory.value))
}
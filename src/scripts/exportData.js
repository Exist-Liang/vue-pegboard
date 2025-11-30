

function cleanLayout(raw) {
  try {
    const parsed = JSON.parse(raw || '[]')
    return parsed.filter(w => w.type !== 'IndieTextWidget')
  } catch {
    return []
  }
}


export function getExportData({ userId, auth }) {
  const safeGet = (key, fallback = '[]') =>
    JSON.parse(localStorage.getItem(key) || fallback)

  return {
    userId,
    currentNickname: auth?.currentNickname?.value || '',
    users: JSON.parse(localStorage.getItem('users') || '{}'),
    layoutCache: {
      large: cleanLayout(localStorage.getItem(`dashboard-layout-${userId}-large`)),
      medium: cleanLayout(localStorage.getItem(`dashboard-layout-${userId}-medium`)),
      small: cleanLayout(localStorage.getItem(`dashboard-layout-${userId}-small`))
    },
    likedFacts: safeGet(`likedFacts_${userId}`),
    weatherCities: safeGet(`weather_widget_cities_user_${userId}`),
    textEditorFiles: safeGet(`text_editor_files_user_${userId}`),
    trashFiles: safeGet(`trash_files_user_${userId}`)
  }
}


export function applyImportData({ data, auth, layoutCache }) {
  const importUserId = data.userId || 'guest'

  if (data.users) {
    localStorage.setItem('users', JSON.stringify(data.users))
    Object.assign(auth.accounts, data.users)
  }

  if (data.currentNickname) {
    auth.currentNickname.value = data.currentNickname
  }

  if (data.userId) {
    auth.currentUser.value = data.userId
  }

  if (data.layoutCache) {
    Object.entries(data.layoutCache).forEach(([sizeKey, layoutData]) => {
      if (Array.isArray(layoutCache[sizeKey])) {
        layoutCache[sizeKey].splice(0, layoutCache[sizeKey].length, ...layoutData)
      }
      const key = `dashboard-layout-${importUserId}-${sizeKey}`
      localStorage.setItem(key, JSON.stringify(layoutData))
    })
  }

  if (data.likedFacts) {
    localStorage.setItem(`likedFacts_${importUserId}`, JSON.stringify(data.likedFacts))
  }

  if (data.weatherCities) {
    localStorage.setItem(`weather_widget_cities_user_${importUserId}`, JSON.stringify(data.weatherCities))
  }
  if (data.textEditorFiles) {
    localStorage.setItem(`text_editor_files_user_${importUserId}`, JSON.stringify(data.textEditorFiles))
  }

  if (data.trashFiles) {
    localStorage.setItem(`trash_files_user_${importUserId}`, JSON.stringify(data.trashFiles))
  }

  // ✅ 通知所有组件刷新
  window.dispatchEvent(new Event('dashboard-imported'))
}
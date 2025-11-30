import { ref, computed, watch } from 'vue'

// 当前用户名与昵称
const currentUser = ref('')
const currentNickname = ref('')

// ✅ 新增 accounts 响应式
const accounts = ref(JSON.parse(localStorage.getItem('users') || '{}'))

// 初始化 currentUser / currentNickname
const storedUser = localStorage.getItem('currentUser')
const storedNickname = localStorage.getItem('currentNickname')

if (storedUser) currentUser.value = storedUser
if (storedNickname) currentNickname.value = storedNickname

// 登录状态
const isLoggedIn = computed(() => !!currentUser.value)

// ✅ accounts -> localStorage 同步
watch(accounts, (val) => {
  localStorage.setItem('users', JSON.stringify(val))
}, { deep: true })

// currentUser / currentNickname -> localStorage 同步
watch(currentUser, (val) => {
  if (val) {
    localStorage.setItem('currentUser', val)
  } else {
    localStorage.removeItem('currentUser')
  }
})

watch(currentNickname, (val) => {
  if (val) {
    localStorage.setItem('currentNickname', val)
  } else {
    localStorage.removeItem('currentNickname')
  }
})

// 提供给 app.use()
export default {
  install(app) {
    app.provide('auth', {
      currentUser,
      currentNickname,
      isLoggedIn,
      accounts,  
      login: (username) => {
        currentUser.value = username
        if (accounts.value[username]) {
          currentNickname.value = accounts.value[username].nickname
        } else {
          currentNickname.value = ''
        }
      },
      logout: () => {
        currentUser.value = ''
        currentNickname.value = ''
      },
      setNickname: (nick) => currentNickname.value = nick
    })
  }
}
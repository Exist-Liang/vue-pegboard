<template>
    <div class="login-widget" :class="[backgroundClass]">
    <div class="progress-overlay" :style="progressBarStyle"></div>
    <div class="widget-content" v-show="!showLockEmoji && !showSuccessEmoji">
      <!-- 登录 -->
      <template v-if="mode === 'login'">
        <input v-model="loginUsername" placeholder="Username" />
        <input v-model="loginPassword" type="password" placeholder="Password" />
        <div class="btn-group">
            <button
            :class="['primary', failureButton === 'login' ? 'fail' : '']"
            :disabled="isLocked"
             @click="handleLogin">
                {{ failureButton === 'login' ? '×' : 'Login' }}
            </button>
          <button class="secondary" @click="mode = 'register-step1'">Register</button>
        </div>
      </template>
  
<!-- 注册步骤 1：输入用户名 -->
<template v-else-if="mode === 'register-step1'">
  <input v-model="registerUsername" placeholder="Enter an account" />
  <p class="helper-text" :class="{ 'error-text': failureButton === 'register-step1' }">
    {{
      failureButton === 'register-step1'
        ? failureMessage
        : 'Enter 8–16 characters using letters and numbers only.'
    }}
  </p>
  <div class="btn-group">
    <button class="secondary" @click="mode = 'login'">Back</button>
    <button
      :class="['primary', failureButton === 'register-step1' ? 'fail' : '']"
      :disabled="isLocked"
      @click="goToRegisterStep2"
    >
      {{ failureButton === 'register-step1' ? '×' : 'Next' }}
    </button>
  </div>
</template>

<!-- 注册步骤 2：输入昵称 -->
<template v-else-if="mode === 'register-step2'">
  <input v-model="nickname" placeholder="Enter your nickname" />
  <p class="helper-text" :class="{ 'error-text': failureButton === 'register-step2' }">
    {{ failureButton === 'register-step2' 
        ? '❌ Nickname must be 4–12 characters' 
        : 'Enter a nickname of 4–12 characters.' }}
  </p>
  <div class="btn-group">
    <button class="secondary" @click="mode = 'register-step1'">Back</button>
    <button
      :class="['primary', failureButton === 'register-step2' ? 'fail' : '']"
      :disabled="isLocked"
      @click="goToRegisterStep3"
    >
      {{ failureButton === 'register-step2' ? '×' : 'Next' }}
    </button>
  </div>
  
</template>

<!-- 注册步骤 3：输入密码 -->
<template v-else-if="mode === 'register-step3'">
  <input v-model="registerPassword" type="password" placeholder="Create a password" />
  <p class="helper-text" :class="{ 'error-text': failureButton === 'register-step3' }">
    {{ failureButton === 'register-step3' 
        ? '❌ Password must include uppercase, lowercase and number, 8–16 characters' 
        : 'Use 8–16 characters with uppercase, lowercase and numbers.' }}
  </p>
  <div class="btn-group">
    <button class="secondary" @click="mode = 'register-step2'">Back</button>
    <button
      :class="['primary', failureButton === 'register-step3' ? 'fail' : '']"
      :disabled="isLocked"
      @click="goToRegisterStep4"
    >
      {{ failureButton === 'register-step3' ? '×' : 'Next' }}
    </button>
  </div>
</template>

<!-- 注册步骤 4：确认密码 -->
<template v-else-if="mode === 'register-step4'">
  <input v-model="confirmPassword" type="password" placeholder="Re-enter your password" />
  <p class="helper-text" :class="{ 'error-text': failureButton === 'register-step4' }">
    {{ failureButton === 'register-step4' 
        ? '❌ Passwords do not match' 
        : 'Please repeat the password exactly as entered above.' }}
  </p>
  <div class="btn-group">
    <button class="secondary" @click="mode = 'register-step3'">Back</button>
    <button
      :class="['primary', failureButton === 'register-step4' ? 'fail' : '']"
      :disabled="isLocked"
      @click="handleRegister"
    >
      {{ failureButton === 'register-step4' ? '×' : 'Register' }}
    </button>
  </div>
</template>
  
      <!-- 已登录状态 -->
      <template v-else-if="mode === 'welcome'">
  <div class="welcome-box">
    <p>Welcome, {{ auth.currentNickname }}!</p>
    <button class="logout-btn" @click="logout">Logout</button>
  </div>
    </template>
    </div>

    <transition name="emoji-fade">
  <div
    class="success-emoji"
    :class="{ gold: showLockEmoji }"
    v-if="showSuccessEmoji || showLockEmoji"
  >
    {{ showLockEmoji ? lockEmoji : '🎉' }}
  </div>
</transition>
  </div>
  </template>
  
  <script setup>
  import { ref, computed, inject, onMounted, onUnmounted } from 'vue'

  const auth = inject('auth')
  const mode = ref('login') 
  const loginUsername = ref('')
  const loginPassword = ref('')
  const registerUsername = ref('')
  const nickname = ref('')
  const registerPassword = ref('')
  const confirmPassword = ref('')
  const isLocked = ref(false)
  const failureButton = ref('')
  const failureMessage = ref('')
  const showSuccessEmoji = ref(false)
  const showLockEmoji = ref(false)
  const lockEmoji = ref('🔒')

  const isValidUsername = (name) => /^[a-zA-Z0-9]{8,16}$/.test(name)

  const isValidNickname = (nick) => nick.length >= 4 && nick.length <= 12

  const isValidPassword = (pw) => {
  return (
    pw.length >= 8 &&
    pw.length <= 16 &&
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /[0-9]/.test(pw)
  )
}

const backgroundClass = computed(() => {
  if (mode.value === 'login') return 'bg-login'
  if (mode.value.startsWith('register-step')) return 'bg-register'
  if (mode.value === 'welcome') return 'bg-welcome'
  return ''
})

const progressBarStyle = computed(() => {
  let width = '0%'

  switch (mode.value) {
    case 'register-step1':
      width = '25%'
      break
    case 'register-step2':
      width = '50%'
      break
    case 'register-step3':
      width = '75%'
      break
    case 'register-step4':
      width = '100%'
      break
  }

  return {
    width,
  }
})


const triggerFailure = (buttonKey, message = '') => {
  failureButton.value = buttonKey
  failureMessage.value = message
  isLocked.value = true

  setTimeout(() => {
    failureButton.value = ''
    failureMessage.value = ''
    isLocked.value = false
  }, 3000)
}
  
const goToRegisterStep2 = () => {
  const users = JSON.parse(localStorage.getItem('users') || '{}')

  if (!isValidUsername(registerUsername.value)) {
    triggerFailure(
      'register-step1',
      '❌ Username must be 8–16 characters (letters/numbers only)'
    )
    return
  }

  if (users[registerUsername.value]) {
    triggerFailure(
      'register-step1',
      '❌ This username is already taken'
    )
    return
  }

  mode.value = 'register-step2'
}

// 第二步：输入昵称后跳转
const goToRegisterStep3 = () => {
  if (!isValidNickname(nickname.value)) {
    triggerFailure(
      'register-step2',
      '❌ Nickname must be 4–12 characters'
    )
    return
  }
  mode.value = 'register-step3'
}

const goToRegisterStep4 = () => {
  if (!isValidPassword(registerPassword.value)) {
    triggerFailure(
      'register-step3',
      '❌ Password must be 8–16 characters and include uppercase, lowercase letters, and a number'
    )
    return
  }

  mode.value = 'register-step4'
}

const handleRegister = () => {
  if (!confirmPassword.value) {
    triggerFailure('register-step4', '❌ Please re-enter your password')
    return
  }

  if (registerPassword.value !== confirmPassword.value) {
    triggerFailure('register-step4', '❌ Passwords do not match')
    return
  }

  const users = JSON.parse(localStorage.getItem('users') || '{}')

  // ✅ 保存为对象格式，包括 nickname 和 password
  users[registerUsername.value] = {
    password: registerPassword.value,
    nickname: nickname.value
  }

  localStorage.setItem('users', JSON.stringify(users))


  showSuccessEmoji.value = true

  setTimeout(() => {
    showSuccessEmoji.value = false
    mode.value = 'login'
  }, 3000)
}


const handleLogin = () => {
  if (!loginUsername.value || !loginPassword.value) {
    triggerFailure('login')
    return
  }

  const users = JSON.parse(localStorage.getItem('users') || '{}')
  const userRecord = users[loginUsername.value]

  if (!userRecord || userRecord.password !== loginPassword.value) {
    triggerFailure('login')
    return
  }

  auth.login(loginUsername.value)
  auth.setNickname(userRecord.nickname) 

  mode.value = 'welcome'
  console.log(`✅ 登录成功：${loginUsername.value}`)

  showLockEmoji.value = true
  lockEmoji.value = '🔒'
  setTimeout(() => {
    lockEmoji.value = '🔓'
  }, 1000)

  setTimeout(() => {
    showLockEmoji.value = false
  }, 2000)
}


const logout = () => {
  lockEmoji.value = '🔓'
  showLockEmoji.value = true

  setTimeout(() => {
    lockEmoji.value = '🔒'
  }, 1000)

  setTimeout(() => {
    auth.logout()
    showLockEmoji.value = false
    mode.value = 'login'
  }, 2000)
  console.log('👋 You have logged out.')
}

onMounted(() => {
  // ✅ 页面刷新后检查
  if (auth.isLoggedIn.value) {
    mode.value = 'welcome'
  }

  // ✅ 导入数据后响应
  const handleImportRefresh = () => {
    if (auth.isLoggedIn.value) {
      mode.value = 'welcome'
    }
  }

  window.addEventListener('dashboard-imported', handleImportRefresh)

  onUnmounted(() => {
    window.removeEventListener('dashboard-imported', handleImportRefresh)
  })
})
  </script>
  
  <style scoped>
.login-widget {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 16px;
  font-size: 14px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: background-color 0.5s ease;
}

  .widget-content {
  position: relative;
  z-index: 1;
}
  
  label {
    font-weight: 600;
    margin-top: 8px;
    font-size: 13px;
    color: #374151;
  }
  
  .input-container {
    position: relative;
    margin-bottom: 4px;
  }
  
  input {
    width: 100%;
    padding: 6px 10px;
    margin-top: 2px;
    margin-bottom: 4px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 14px;
  }
  
  .btn-group {
    display: flex;
    justify-content: space-between;
    gap: 6px;
    margin-top: 8px;
  }
  
  button {
    flex: 1;
    padding: 8px;
    border: none;
    border-radius: 6px;
    background-color: #3b82f6;
    color: white;
    font-weight: bold;
    cursor: pointer;
  }
  
  button.secondary {
    background-color: #e5e7eb;
    color: #333;
  }
  
  button.fail {
  background-color: #dc2626 !important;
  color: #fff;
  animation: bounce-on-error 0.4s ease;
  }

  @keyframes bounce-on-error {
  0%   { transform: translateY(0); }
  20%  { transform: translateY(-5px); }
  40%  { transform: translateY(0); }
  60%  { transform: translateY(-3px); }
  100% { transform: translateY(0); }
  }



  
  .welcome-box {
    text-align: center;
    padding-top: 20px;
  }
  
  .logout-btn {
    margin-top: 12px;
    padding: 10px 16px;
    background-color: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
  }
  
  .logout-btn:hover {
    background-color: #dc2626;
  }
  
  .helper-text {
  font-size: 12px;
  color: #6b7280; 
  margin-top: 4px;
  margin-bottom: 8px;
  min-height: 2.4em;
  line-height: 1.2;
}
.error-text {
  color: #dc2626; 
}

.bg-login {
  background-color: #c2e4fb; 
}

.bg-register {
  background-color: #ffffff; 
}

.progress-overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: #b2f1d3; 
  z-index: 0;
  transition: width 0.6s ease;
  width: 0%
}

.success-emoji {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  font-size: 48px;
  background-color: #d1fae5;
  border-radius: 50%;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 10;
  pointer-events: none;
}
.success-emoji.gold {
  background-color: #fef3c7; 
}

/* Vue transition hooks */
.emoji-fade-enter-active,
.emoji-fade-leave-active {
  transition: all 0.8s ease;
}
.emoji-fade-enter-from,
.emoji-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.4);
}
.emoji-fade-enter-to,
.emoji-fade-leave-from {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.bg-welcome {
  background-color: #fde58f; 
  transition: background-color 0.5s ease;
}

  </style>
  
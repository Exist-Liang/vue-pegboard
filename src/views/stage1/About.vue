<script setup>
import { ref, computed } from 'vue'
import mountain from '@/assets/mountain.jpg'
import ocean from '@/assets/ocean.jpg'

const firstName = ref('')
const lastName = ref('')
const selectedImage = ref('')

const fullName = computed(() => `${firstName.value} ${lastName.value}`.trim())

const imageMap = {
  mountain,
  ocean
}
</script>

<template>
  <div class="container mt-4">
    <h1 class="mb-4">About This App</h1>
    <p class="mb-4 text-muted">This app demonstrates the use of Vue 3, Bootstrap, and dynamic content interaction.</p>

    <!-- 用户输入区域 -->
    <div class="card p-4 mb-4">
      <h5 class="card-title">👤 Your Name</h5>
      <div class="mb-3">
        <label class="form-label">First Name</label>
        <input v-model="firstName" type="text" class="form-control" placeholder="Enter first name" />
      </div>
      <div class="mb-3">
        <label class="form-label">Last Name</label>
        <input v-model="lastName" type="text" class="form-control" placeholder="Enter last name" />
      </div>
      <p class="mb-0">Welcome, <strong>{{ fullName || 'Guest' }}</strong>!</p>
    </div>

    <!-- 图片选择区域 -->
    <div class="card p-4 mb-4">
      <h5 class="card-title">🖼 Choose Your Favorite View</h5>
      <div class="btn-group mb-3" role="group">
        <input type="radio" class="btn-check" id="mountain" value="mountain" v-model="selectedImage" />
        <label class="btn btn-outline-primary" for="mountain">Mountain</label>

        <input type="radio" class="btn-check" id="ocean" value="ocean" v-model="selectedImage" />
        <label class="btn btn-outline-primary" for="ocean">Ocean</label>
      </div>

      <div v-if="selectedImage">
        <img :src="imageMap[selectedImage]" alt="Selected View" class="img-fluid border rounded mb-2" />
        <p class="text-muted">You selected: <strong>{{ selectedImage }}</strong></p>
      </div>
    </div>
  </div>
</template>
  
  <script>
  export default {
    name: 'AboutPage',
    data() {
      return {
        firstName: '',
        lastName: '',
        selectedImage: ''
      }
    },
    computed: {
      fullName() {
        return `${this.firstName} ${this.lastName}`.trim()
      }
    }
  }
  </script>
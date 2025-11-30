<script setup>
import image1 from '@/assets/image1.jpg'
import image2 from '@/assets/image2.jpg'
</script>

<template>
  <div class="container mt-4">
    <h1>Welcome to Our Web App</h1>
    <p>This application is built with Vue 3 and Bootstrap.</p>
    <div class="row">
      <div class="col-md-6 mb-3">
        <img :src="image1" class="img-fluid" alt="Image 1">
      </div>
      <div class="col-md-6 mb-3">
        <img :src="image2" class="img-fluid" alt="Image 2">
      </div>
    </div>
  </div>
</template>
  
  <script>
  export default {
    name: 'LegacyHome'
  }
  </script>
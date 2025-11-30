
<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const newsList = ref([])
const searchQuery = ref('')
const selectedCategory = ref('All')
const currentPage = ref(1)
const itemsPerPage = 5

const minYear = ref(2010)
const maxYear = ref(new Date().getFullYear())
const startYear = ref(minYear.value)
const endYear = ref(maxYear.value)

onMounted(async () => {
  const res = await fetch('./all_fake_news.json')
  newsList.value = await res.json()

  const years = newsList.value.map(n => new Date(n.date).getFullYear())
  minYear.value = Math.min(...years)
  maxYear.value = Math.max(...years)
  startYear.value = minYear.value
  endYear.value = maxYear.value
})

watch([startYear, endYear], () => {
  if (startYear.value > endYear.value) {
    startYear.value = endYear.value
  }
  if (startYear.value < minYear.value) {
    startYear.value = minYear.value
  }
  if (endYear.value > maxYear.value) {
    endYear.value = maxYear.value
  }
})

const categories = computed(() => {
  const set = new Set(newsList.value.map(n => n.category))
  return ['All', ...Array.from(set)]
})

const filteredNews = computed(() => {
  return newsList.value.filter(item => {
    const year = new Date(item.date).getFullYear()
    const matchesSearch = [item.title, item.content].some(field =>
      field.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    const matchesCategory = selectedCategory.value === 'All' || item.category === selectedCategory.value
    const matchesYear = year >= startYear.value && year <= endYear.value
    return matchesSearch && matchesCategory && matchesYear
  })
})

const totalPages = computed(() => Math.ceil(filteredNews.value.length / itemsPerPage))

const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredNews.value.slice(start, start + itemsPerPage)
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = 'All'
  startYear.value = minYear.value
  endYear.value = maxYear.value
  currentPage.value = 1
}
</script>

<template>
  <div class="container mt-4">
    <h1 class="mb-3">News Center</h1>

    
<div class="row g-3 align-items-end mb-4">
 
  <div class="col-md-4">
    <label for="search" class="form-label mb-1">Search title/content:</label>
    <input id="search" v-model="searchQuery" type="text" class="form-control" placeholder="Search..." />
  </div>

  
  <div class="col-md-3">
    <label for="category" class="form-label mb-1">Filter by category:</label>
    <select id="category" v-model="selectedCategory" class="form-select">
      <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
    </select>
  </div>

  
  <div class="col-md-4">
    <label class="form-label mb-1">Year range:</label>
    <div class="d-flex align-items-center gap-2">
      <input
        v-model.number="startYear"
        :min="minYear"
        :max="endYear"
        type="number"
        class="form-control"
        placeholder="Start"
      />
      <span>~</span>
      <input
        v-model.number="endYear"
        :min="startYear"
        :max="maxYear"
        type="number"
        class="form-control"
        placeholder="End"
      />
    </div>
  </div>

  
  <div class="col-md-1 d-flex align-items-end">
    <button class="btn btn-outline-secondary w-100" @click="resetFilters">Reset</button>
  </div>
</div>

    
    <div v-for="(item, index) in paginatedNews" :key="index" class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">{{ item.title }}</h5>
        <h6 class="card-subtitle text-muted">{{ item.date }} · {{ item.category }}</h6>
        <p class="card-text mt-2">{{ item.content }}</p>
      </div>
    </div>

    
    <nav v-if="totalPages > 1" aria-label="Pagination">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="goToPage(currentPage - 1)">Previous</button>
        </li>
        <li
          v-for="page in totalPages"
          :key="page"
          class="page-item"
          :class="{ active: page === currentPage }"
        >
          <button class="page-link" @click="goToPage(page)">{{ page }}</button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="goToPage(currentPage + 1)">Next</button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'NewsPage'
}
</script>
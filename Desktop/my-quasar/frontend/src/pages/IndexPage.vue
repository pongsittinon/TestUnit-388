<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const data = ref(null)

onMounted(async () => {
  const res = await axios.get(
    import.meta.env.VITE_API_URL + '/api/demo'
  )
  data.value = res.data
})
</script>

<template>
  <q-page class="q-pa-md">
    <pre>{{ data }}</pre>
  </q-page>
</template>

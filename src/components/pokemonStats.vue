<!-- components/PokemonStats.vue -->
<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ nameOrId: String })
const stats = ref(null)

watch(
  () => props.nameOrId,
  async (id) => {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    const data = await res.json()
    stats.value = data.stats
  },
  { immediate: true }
)
</script>

<template>
  <ul v-if="stats">
    <li v-for="s in stats" :key="s.stat.name">
      {{ s.stat.name }}: {{ s.base_stat }}
    </li>
  </ul>
</template>
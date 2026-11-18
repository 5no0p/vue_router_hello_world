<!-- components/PokemonStats.vue -->
<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({ nameOrId: { type: Number, required: true } })

const stats = ref(null)
const types = ref(null)
const loading = ref(false)
const error = ref(null)

watch(
  () => props.nameOrId,
  async (id) => {
    stats.value = null
    types.value = null
    error.value = null
    loading.value = true
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      stats.value = data.stats
      types.value = data.types.map((t) => t.type.name)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  },
  { immediate: true }
)

const total = computed(() =>
  stats.value ? stats.value.reduce((sum, s) => sum + s.base_stat, 0) : 0
)

// Bar color by stat magnitude — matches the indigo/gray palette
const barColor = (value) => {
  if (value >= 120) return 'bg-indigo-500'
  if (value >= 80)  return 'bg-indigo-400'
  if (value >= 50)  return 'bg-indigo-300'
  return 'bg-gray-300'
}

const pretty = (s) => s.replace(/-/g, ' ')
</script>

<template>
  <div class="mt-4 w-full max-w-2xl">
    <p v-if="error"
       class="text-center py-6 bg-red-50 border border-red-200 rounded-2xl text-red-700">
      Failed to load stats: {{ error }}
    </p>

    <p v-else-if="loading" class="text-center py-10 text-gray-600">Loading stats…</p>

    <div v-else-if="stats" class="">
      <!-- Types row -->
      <!-- <div class="flex flex-wrap gap-1 mb-6">
        <span
          v-for="t in types"
          :key="t"
          class="inline-block bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full capitalize"
        >{{ pretty(t) }}</span>
      </div> -->

      <!-- Stat rows -->
      <ul class="space-y-3">
        <li v-for="s in stats" :key="s.stat.name">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {{ pretty(s.stat.name) }}
            </span>
            <span class="text-sm font-bold text-gray-800">{{ s.base_stat }}</span>
          </div>
          <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              :class="['h-full rounded-full transition-all', barColor(s.base_stat)]"
              :style="{ width: Math.min(s.base_stat / 180 * 100, 100) + '%' }"
            />
          </div>
        </li>
      </ul>

      <!-- Total footer, matches the "Power" divider in your cards -->
      <div class="mt-6 pt-3 border-t border-gray-100 flex justify-between items-center">
        <span class="text-sm text-gray-500">Total</span>
        <span class="text-lg font-bold text-gray-800">{{ total }}</span>
      </div>
    </div>
  </div>
</template>
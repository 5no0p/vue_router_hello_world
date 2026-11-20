<!-- components/PokemonMoves.vue -->
<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({ nameOrId: { type: Number, required: true } })

const moves = ref(null)
const error = ref(null)
const loading = ref(false)
const search = ref('')

watch(
  () => props.nameOrId,
  async (id) => {
    moves.value = null
    error.value = null
    search.value = ''
    loading.value = true
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      moves.value = (await res.json()).moves
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  },
  { immediate: true }
)

const pretty = (s) => s.replace(/-/g, ' ')

// Group by latest learn method → sort level-up first by level
const grouped = computed(() => {
  if (!moves.value) return []
  const groups = {}
  for (const m of moves.value) {
    const latest = m.version_group_details.at(-1)
    const method = latest?.move_learn_method.name ?? 'unknown'
    const level = latest?.level_learned_at ?? 0
    ;(groups[method] ??= []).push({ name: m.move.name, level })
  }
  return Object.entries(groups)
    .map(([method, list]) => ({
      method,
      list: list.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => {
      // level-up first, then machine, egg, tutor, others
      const order = { 'level-up': 0, machine: 1, egg: 2, tutor: 3 }
      return (order[a.method] ?? 99) - (order[b.method] ?? 99)
    })
})

// Apply search filter on top of grouping
const filteredGroups = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return grouped.value
  return grouped.value
    .map(({ method, list }) => ({
      method,
      list: list.filter((m) => m.name.includes(q)),
    }))
    .filter((g) => g.list.length > 0)
})

const totalCount = computed(() => moves.value?.length ?? 0)
const shownCount = computed(() =>
  filteredGroups.value.reduce((n, g) => n + g.list.length, 0)
)

// Accent colors per method — indigo matches your app's primary
const methodAccent = (method) => ({
  'level-up': 'bg-indigo-500',
  machine: 'bg-blue-500',
  egg: 'bg-amber-500',
  tutor: 'bg-emerald-500',
}[method] ?? 'bg-gray-400')
</script>

<template>
  <div class="mt-8 w-full max-w-4xl">
    <p v-if="error"
       class="text-center py-6 bg-red-50 border border-red-200 rounded-2xl text-red-700">
      Failed to load moves: {{ error }}
    </p>

    <p v-else-if="loading" class="text-center py-10 text-gray-600">Loading moves…</p>

    <template v-else-if="moves">
      <!-- Header: count + search -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <p class="text-sm text-gray-500">
          <span class="font-semibold text-gray-800">{{ shownCount }}</span>
          <template v-if="search"> of {{ totalCount }}</template>
          move<template v-if="totalCount !== 1">s</template>
        </p>
        <input
          v-model="search"
          type="search"
          placeholder="Search moves…"
          class="w-full sm:w-64 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
        />
      </div>

      <!-- No search results -->
      <div v-if="filteredGroups.length === 0"
           class="bg-white rounded-2xl shadow-md p-8 text-center text-gray-500">
        No moves match “<span class="font-medium text-gray-700">{{ search }}</span>”.
      </div>

      <!-- Grouped sections -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section
          v-for="group in filteredGroups"
          :key="group.method"
          class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-5"
        >
          <!-- Section header with accent bar -->
          <div class="flex items-center gap-2 mb-3">
            <span :class="['h-2.5 w-2.5 rounded-full', methodAccent(group.method)]" />
            <h2 class="text-xs font-semibold text-gray-500 tracking-wider capitalize">
              {{ pretty(group.method) }}
            </h2>
            <span class="text-xs text-gray-400">({{ group.list.length }})</span>
          </div>

          <!-- Pills -->
          <div class="flex flex-wrap gap-1">
            <span
              v-for="move in group.list"
              :key="move.name"
              class="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full"
            >
              <span class="capitalize">{{ pretty(move.name) }}</span>
              <span
                v-if="move.level > 0"
                class="ml-1.5 text-indigo-600 font-semibold"
              >Lv.{{ move.level }}</span>
            </span>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>
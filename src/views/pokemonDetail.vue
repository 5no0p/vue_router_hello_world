<!-- views/PokemonDetail.vue -->
<script setup>
import { ref, watch, onBeforeUnmount, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps({
  nameOrId: { type: String, required: true },
})

const router = useRouter()
const route = useRoute()
const pokemon = ref(null)
const loading = ref(false)
const error = ref(null)

let controller // for aborting stale requests

async function fetchPokemon(nameOrId) {
  controller?.abort()                 // kill the previous request
  controller = new AbortController()

  loading.value = true
  error.value = null

  try {
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${nameOrId.toLowerCase()}`,
      { signal: controller.signal }
    )
    if (!res.ok) throw new Error(`Pokémon "${nameOrId}" not found`)
    pokemon.value = await res.json()
  } catch (e) {
    if (e.name !== 'AbortError') error.value = e.message
  } finally {
    loading.value = false
  }
}

// 🔑 The whole point: this fires on /pokemon/1 → /pokemon/2 navigation
watch(
  () => props.nameOrId,
  (id) => fetchPokemon(id),
  { immediate: true }
)

onBeforeUnmount(() => controller?.abort())

// Helper to get the official artwork URL from the sprites object
const getSprite = (pokemon) => {
  return pokemon.sprites?.other?.['official-artwork']?.front_default ?? ''
}
 // Helper to get the abilities from the abilities object
 const getAbilities = (pokemon) => {
  return pokemon.abilities.map((a) => a.ability.name)
 }

// Navigation helpers
const numericId = () => pokemon.value?.id
function next() {
  router.push({ name: 'pokemon-detail', params: { nameOrId: numericId() + 1 } })
}
function prev() {
  if (numericId() > 1) {
    router.push({ name: 'pokemon-detail', params: { nameOrId: numericId() - 1 } })
  }
}
// ⭐ leaf route name is `pokemon-stats`, not `pokemon`
const activeTab = computed(() => {
  if (route.name === 'pokemon-stats')     return 'stats'
  if (route.name === 'pokemon-moves')     return 'moves'
  if (route.name === 'pokemon-evolution') return 'evolution'
  return 'stats'
})

const tabClass = (tab) =>
  activeTab.value === tab
    ? 'px-4 py-1.5 rounded-full text-sm font-medium bg-indigo-500 text-white shadow'
    : 'px-4 py-1.5 rounded-full text-sm font-medium bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors'

</script>

<template>
  <div class="detail min-h-screen bg-gray-100 p-8 font-sans">
    <button @click="prev" class="mr-4 cursor-pointer bg-indigo-500 text-white px-4 py-0.5 disabled:bg-indigo-200 disabled:cursor-default" :disabled="!pokemon || numericId() <= 1">← Prev</button>
    <button @click="next" class="mr-4 cursor-pointer bg-indigo-500 text-white px-4 py-0.5 disabled:bg-indigo-200 disabled:cursor-default" :disabled="!pokemon">Next →</button>

    <p v-if="loading">Loading…</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <template v-else-if="pokemon">
      <div class="flex items-center justify-center gap-2">
        <div class="bg-white rounded-2xl shadow-md">

            <!-- Image -->
            <div class="bg-linear-to-br from-indigo-50 to-blue-100 flex p-4 items-center justify-center">
                <img
                  :src="getSprite(pokemon)"
                  :alt="pokemon.name"
                  class="w-60 h-60 object-contain drop-shadow-lg"
                  loading="lazy"
                />
            </div>

            <!-- Content -->
            <div class="flex flex-col p-4 grow">
                <!-- Name -->
                <h2 class="text-xl font-bold text-gray-800 capitalize mb-2">{{ pokemon.name }}</h2>

                <!-- Skills (Abilities) -->
                 <div class="mb-4">
                    <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Skills</h3>
                    <div class="flex flex-wrap gap-1">
                        <span
                            v-for="ability in getAbilities(pokemon)"
                            :key="ability"
                            class="inline-block bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full capitalize"
                        >
                            {{ ability }}
                        </span>
                    </div>
                 </div>
                <!-- Nested detail routes -->
                <nav class="tabs mb-3 flex gap-4 border-b pb-2 border-gray-200">
                  <RouterLink
                    :to="{ name: 'pokemon-stats', params: { nameOrId: props.nameOrId } }"
                    :class="tabClass('stats')"
                  >Stats</RouterLink>
                  <RouterLink
                    :to="{ name: 'pokemon-moves', params: { nameOrId: props.nameOrId } }"
                    :class="tabClass('moves')"
                  >Moves</RouterLink>
                  <RouterLink
                    :to="{ name: 'pokemon-evolution', params: { nameOrId: props.nameOrId } }"
                    :class="tabClass('evolution')"
                  >Evolution</RouterLink>
                </nav>

                <RouterView />
            </div>
        </div>
      </div>
    </template>
  </div>
</template>
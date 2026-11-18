<!-- views/PokemonDetail.vue -->
<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  nameOrId: { type: String, required: true },
})

const router = useRouter()
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
</script>

<template>
  <div class="detail">
    <button @click="prev" :disabled="!pokemon || numericId() <= 1">← Prev</button>
    <button @click="next" :disabled="!pokemon">Next →</button>

    <p v-if="loading">Loading…</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <template v-else-if="pokemon">
      <h1>{{ pokemon.name }} <small>#{{ pokemon.id }}</small></h1>
      <img :src="pokemon.sprites.front_default" :alt="pokemon.name" />

      <!-- Tab navigation: named routes, params carried over -->
      <nav class="tabs">
        <RouterLink
          :to="{ name: 'pokemon-stats', params: { nameOrId: props.nameOrId } }"
        >Stats</RouterLink>
        <RouterLink
          :to="{ name: 'pokemon-moves', params: { nameOrId: props.nameOrId } }"
        >Moves</RouterLink>
        <RouterLink
          :to="{ name: 'pokemon-evolution', params: { nameOrId: props.nameOrId } }"
        >Evolution</RouterLink>
      </nav>

      <!-- 🎯 Child route renders here -->
      <RouterView />
    </template>
  </div>
</template>
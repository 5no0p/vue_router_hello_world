<!-- components/PokemonEvolution.vue -->
<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ nameOrId: { type: String, required: true } })

const chain = ref(null)
const currentName = ref(null)
const error = ref(null)
const loading = ref(false)

// Recursively flatten { species, evolves_to[] } into a linear array
function flattenEvolution(node, out = []) {
  out.push(node.species.name)
  node.evolves_to.forEach((child) => flattenEvolution(child, out))
  return out
}

// Extract the numeric id from a species URL like
// https://pokeapi.co/api/v2/pokemon-species/25/
function idFromUrl(url) {
  const match = url.match(/\/(\d+)\/?$/)
  return match ? match[1] : null
}

watch(
  () => props.nameOrId,
  async (id) => {
    chain.value = null
    error.value = null
    loading.value = true
    try {
      // Hop 1: Pokémon → species
      const pRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      if (!pRes.ok) throw new Error('Pokémon not found')
      const pokemon = await pRes.json()
      currentName.value = pokemon.name

      // Hop 2: species → evolution chain
      const sRes = await fetch(pokemon.species.url)
      const species = await sRes.json()

      // Hop 3: chain URL → full chain
      const cRes = await fetch(species.evolution_chain.url)
      const chainData = await cRes.json()

      chain.value = flattenEvolution(chainData.chain)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  },
  { immediate: true }
)
</script>

<template>
  <p v-if="error" class="error">{{ error }}</p>
  <p v-else-if="loading">Loading evolution chain…</p>

  <ul v-else-if="chain" class="evolution">
    <li
      v-for="name in chain"
      :key="name"
      :class="{ current: name === currentName }"
    >
      <!-- Link to the detail route, carrying a param object as usual -->
      <RouterLink
        :to="{ name: 'pokemon-detail', params: { nameOrId: name } }"
      >
        {{ name }}
      </RouterLink>
      <span v-if="name === currentName"> ← viewing</span>
    </li>
  </ul>
</template>

<style scoped>
.evolution .current {
  font-weight: bold;
}
</style>
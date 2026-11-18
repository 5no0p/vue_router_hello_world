<!-- views/PokemonList.vue -->
<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  typeName: { type: String, default: null }, // only set on /type/:typeName
})

const router = useRouter()
const list = ref([])

watch(
  () => props.typeName,
  async (type) => {
    const url = type
      ? `https://pokeapi.co/api/v2/type/${type}`
      : 'https://pokeapi.co/api/v2/pokemon?limit=20'

    const res = await fetch(url)
    const data = await res.json()

    // PokéAPI returns different shapes for /type vs /pokemon
    list.value = type
      ? data.pokemon.map((p) => p.pokemon)
      : data.results
  },
  { immediate: true }
)

function open(pokemon) {
  router.push({ name: 'pokemon-detail', params: { nameOrId: pokemon.name } })
}
</script>

<template>
  <div>
    <h1 v-if="typeName">Type: {{ typeName }}</h1>
    <h1 v-else>All Pokémon</h1>

    <ul>
      <li v-for="p in list" :key="p.name">
        <button @click="open(p)">{{ p.name }}</button>
      </li>
    </ul>
  </div>
</template>
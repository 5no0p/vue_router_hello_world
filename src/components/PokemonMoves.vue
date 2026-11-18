<!-- components/PokemonMoves.vue -->
<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ nameOrId: { type: String, required: true } })

const moves = ref(null)
const error = ref(null)

watch(
  () => props.nameOrId,
  async (id) => {
    moves.value = null
    error.value = null
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      if (!res.ok) throw new Error('Pokémon not found')
      const data = await res.json()
      moves.value = data.moves
    } catch (e) {
      error.value = e.message
    }
  },
  { immediate: true }
)

// Sort alphabetically and pick the most recent learn method for display
function sortedMoves(list) {
  return [...list]
    .map((m) => ({
      name: m.move.name,
      method:
        m.version_group_details.at(-1)?.move_learn_method.name ?? 'unknown',
      level: m.version_group_details.at(-1)?.level_learned_at ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}
</script>

<template>
  <p v-if="error" class="error">{{ error }}</p>
  <p v-else-if="!moves">Loading moves…</p>

  <ul v-else class="moves">
    <li v-for="m in sortedMoves(moves)" :key="m.name">
      <strong>{{ m.name }}</strong>
      <span class="meta">
        — {{ m.method }}<template v-if="m.level"> (Lv. {{ m.level }})</template>
      </span>
    </li>
  </ul>
</template>
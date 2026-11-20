<!-- components/PokemonEvolution.vue -->
<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({ nameOrId: { type: Number, required: true } })
const router = useRouter()

const stages = ref(null)   // array of arrays (one array per depth level)
const currentName = ref(null)
const error = ref(null)
const loading = ref(false)

const pretty = (s) => s.replace(/-/g, ' ')
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

const idFromUrl = (url) => {
  const m = url.match(/\/(\d+)\/?$/)
  return m ? Number(m[1]) : null
}

// Compress an evolution_details object to a short human label
function formatCondition(details) {
  if (!details) return null
  if (details.min_level) return `Lv. ${details.min_level}`
  if (details.item) return `Use ${pretty(details.item.name)}`
  if (details.trigger?.name === 'trade') {
    return details.held_item ? `Trade w/ ${pretty(details.held_item.name)}` : 'Trade'
  }
  if (details.min_happiness) return 'Friendship'
  if (details.time_of_day) return `${capitalize(details.time_of_day)} time`
  if (details.known_move) return `Knows ${pretty(details.known_move.name)}`
  if (details.location) return `At ${pretty(details.location.name)}`
  if (details.trigger?.name === 'shed') return 'Special'
  return details.trigger?.name ? capitalize(pretty(details.trigger.name)) : 'Special'
}

// Walk the chain tree → stages[depth] = [{ name, id, condition }]
function buildStages(root) {
  const out = []
  const walk = (node, depth, condition) => {
    ;(out[depth] ??= []).push({
      name: node.species.name,
      id: idFromUrl(node.species.url),
      condition, // how you *got here* (null for the base)
    })
    node.evolves_to.forEach((child) =>
      walk(child, depth + 1, formatCondition(child.evolution_details?.[0]))
    )
  }
  walk(root, 0, null)
  return out
}

watch(
  () => props.nameOrId,
  async (id) => {
    stages.value = null
    error.value = null
    loading.value = true
    try {
      const p = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`)
        return r.json()
      })
      currentName.value = p.name

      const species = await fetch(p.species.url).then((r) => r.json())
      const chainData = await fetch(species.evolution_chain.url).then((r) => r.json())

      stages.value = buildStages(chainData.chain)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  },
  { immediate: true }
)

const sprite = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`

function goTo(id) {
  router.push({ name: 'pokemon', params: { id } })
}
</script>

<template>
  <div class="mt-8 w-full">
    <p v-if="error"
       class="text-center py-6 bg-red-50 border border-red-200 rounded-2xl text-red-700">
      Failed to load evolution chain: {{ error }}
    </p>

    <p v-else-if="loading" class="text-center py-10 text-gray-600">
      Loading evolution chain…
    </p>

    <div
      v-else-if="stages"
      class="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row md:items-center md:justify-center gap-4 md:gap-6"
    >
      <template v-for="(stage, depth) in stages" :key="depth">
        <!-- Arrow between stages (hidden on first and after last) -->
        <div
          v-if="depth > 0"
          class="flex justify-center md:flex-col md:items-center text-gray-400"
          aria-hidden="true"
        >
          <span class="text-2xl md:rotate-0 rotate-90">→</span>
        </div>

        <!-- Stage column: one card per Pokémon at this depth -->
        <div class="flex flex-wrap justify-center gap-3">
          <div
            v-for="p in stage"
            :key="p.name"
            class="w-40 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer border"
            :class="p.name === currentName
              ? 'ring-2 ring-indigo-500 border-transparent'
              : 'border-gray-100'"
            @click="goTo(p.id)"
          >
            <!-- Sprite on the same gradient as your hero card -->
            <div class="bg-linear-to-br from-indigo-50 to-blue-100 p-2 flex items-center justify-center">
              <img
                :src="sprite(p.id)"
                :alt="p.name"
                class="w-24 h-24 object-contain drop-shadow-lg"
                loading="lazy"
              />
            </div>

            <!-- Name + meta -->
            <div class="p-3 text-center">
              <p class="text-sm font-bold text-gray-800 capitalize">{{ p.name }}</p>

              <!-- Condition badge: how you got here -->
              <p
                v-if="p.condition"
                class="mt-1 inline-block bg-indigo-100 text-indigo-700 text-[11px] font-medium px-2 py-0.5 rounded-full"
              >{{ p.condition }}</p>

              <!-- Or "you are here" marker -->
              <p
                v-else-if="p.name === currentName"
                class="mt-1 text-[11px] text-indigo-600 font-semibold"
              >you are here</p>

              <p v-else class="mt-1 text-[11px] text-gray-400">#{{ p.id }}</p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
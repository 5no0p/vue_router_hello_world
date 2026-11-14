<script setup>
import { ref, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
    pokemonId: { type: Number, required: true}
})

const route = useRoute()
const router = useRouter();

// Define variables for Pokemon data, loading status and error
/* ---- Pokemon Instance & Request Status ---- */
const pokemon = ref(null)
const isLoading = ref(true)
const error = ref(null)

// Define variable for Pokemon api url
const pokemonUrl = 'https://pokeapi.co/api/v2/pokemon/'

// A variable to test if the id is number and not empty
const isValidId = (id) => /^\d+$/.test(id)

const inputId = ref(String(route.params.id ?? ''))

watch(() => route.params.id, (id) => {
    inputId.value = String(id ?? '')
})

let navTimeoutId = null
const commitId = () => {
    const id = inputId.value.trim()
    if (!isValidId(id) || id === String(route.params.id)) return
    router.replace({name:'pokemon', params:{id}})
}

watch(inputId, () => {
    clearTimeout(navTimeoutId)
    navTimeoutId = setTimeout(commitId, 300)
})

let controller = null
let requestId = 0


// Define function to fetch Pokemon data by ID
const fetchPokemonData = async (pokemonId) => {
    const current = ++requestId
    controller?.abort()
    controller = new AbortController()

    isLoading.value = true
    error.value = null

    try {
        const req = await fetch(`${pokemonUrl}${pokemonId}/`, {signal: controller.signal})
        if(!req.ok){
            throw new Error(`HTTP error! status: ${data.status}`)
        }
        const data = await req.json()
        if (current !== requestId) return
        pokemon.value = data
    } catch (err) {
        if (current !== requestId || err.name === 'AbortError') return
        error.value = err.message
    } finally {
        if (current === requestId) isLoading.value = false
    }
}

// Helper to get the official artwork URL from the sprites object
const getSprite = (pokemon) => {
  return pokemon.sprites?.other?.['official-artwork']?.front_default ?? ''
}
 // Helper to get the abilities from the abilities object
 const getAbilities = (pokemon) => {
  return pokemon.abilities.map((a) => a.ability.name)
 }

// Helper to get moves as extra skills
const getMoves = (pokemon) => {
  return pokemon.moves.slice(0, 3).map((m)=> m.move.name)
}

// Hepler to get the total power
const getTotalPower = (pokemon) => {
  return pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)
}

// Helper to get the next Pokemon
function next() {
  router.push({ name: 'pokemon', params: { id: props.pokemonId + 1 } })
}

// Helper to back to previes pokemon
function prev() {
  if (props.pokemonId > 1) {
    router.push({ name: 'pokemon', params: { id: props.pokemonId - 1 } })
  }
}

watch(()=> props.pokemonId, (newId) => {
    if(newId) fetchPokemonData(newId)
  
},
{immediate: true}
)

onUnmounted(() => {
    clearTimeout(navTimeoutId)
    controller?.abort
})
</script>

<template>
<div class="min-h-screen bg-gray-100 p-8 font-sans">

    <h1>Pokeomn Card -</h1>
    <input 
      v-model.trim="inputId"
      inputmode="numeric"
      placeholder="Pokemon ID"
      @keyup.enter="commitId"
    />
    <!-- Loading status -->
    <div v-if="isLoading">
        <p>Loading...</p>
    </div>
    <!-- Error status with retry button -->
    <div v-else-if="error">
        <p>Faild to load data: {{ error }}</p>
        <button
          @click="fetchPokemonData($route.params.id)"
        >
            try again
        </button>
    </div>
    <!-- Success status -->
    <div v-else class="flex items-center justify-center gap-2">
        <button class="mr-4 cursor-pointer bg-indigo-500 text-white px-4 py-0.5" @click="prev">Prev</button>
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
            <div class="felx flex-col p-4 grow">
                <!-- Name -->
                <h2 class="text-xl font-bold text-gray-800 capitalize mb-2">{{ pokemon.name }}</h2>

                <!-- Skills (Abillites) -->
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
            <!-- Moves (more abilities) -->
             <div class="mb-3">
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Moves</h3>
                <div>
                <span
                  v-for="move in getMoves(pokemon)"
                  :key="move"
                  class="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full capitalize"
                >
                  {{ move }}
                </span>
              </div>
             </div>
             <!-- Power (Total Base Stats) -->
              <div class="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                <span class="text-sm text-gray-500">Power</span>
                <span class="text-lg text-bold text-gray-800">{{ getTotalPower(pokemon) }}</span>
              </div>
            </div>
        </div>
        <button class="ml-4 cursor-pointer bg-indigo-500 text-white px-4 py-0.5" @click="next">Next</button>
        
    </div>

</div>

</template>
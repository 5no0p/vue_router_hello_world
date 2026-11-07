<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()

// Define variables for Pokemon data, loading status and error
const pokemon = ref(null)
const isLoading = ref(true)
const error = ref(null)
const pokemonId = computed(() => route.params.id)

// Define variable for Pokemon api url
const pokemonUrl = 'https://pokeapi.co/api/v2/pokemon/'

// Define function to fetch Pokemon data by ID
const fetchPokemonData = async (id) => {
    isLoading.value = true
    error.value = null
    try {
        const data = await fetch(pokemonUrl + `${id}/`)
        if(!data.ok){
            throw new Error(`HTTP error! status: ${data.status}`)
        }
        pokemon.value = await data.json()
    } catch (err) {
        error.value = err.message
    } finally {
        isLoading.value = false
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

onMounted(() => fetchPokemonData(pokemonId.value))
</script>

<template>
<div class="min-h-screen bg-gray-100 p-8 font-sans">

    <h1>Pokeomn Card</h1>
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
    <div v-else class="flex items-center justify-center">
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
    </div>

</div>

</template>
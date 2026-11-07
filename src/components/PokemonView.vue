<script setup>
import { ref, onMounted } from 'vue';

// Define variables for Pokemon data, loading status and error
const pokemon = ref(null)
const isLoading = ref(false)
const error = ref(null)

// Define variable for Pokemon api url
const pokemonUrl = 'https://pokeapi.co/api/v2/pokemon/'

// Define function to fetch Pokemon data by ID
const fetchPokemonData = async (id) => {
    isLoading.value = true
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
</script>

<template>


</template>
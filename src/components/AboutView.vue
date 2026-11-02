<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Get the current route and router instance
const route = useRoute();
const router = useRouter();

// Define a computed search query based on the current route's query parameters, and set the current route's query based on the search query
const search = computed({
    get() {
        return route.query.search ?? ''
    },
    set(search) {
        router.replace({ query: {search}})
    }
})

</script>
<template>
<h1>About View</h1>
<label>
    Search:
    <input v-model.trim="search" maxlength="20" />
</label>

</template>

<style scoped></style>
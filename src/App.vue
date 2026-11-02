<script setup>

</script>

<template>
  <h1 class="text-lg font-bold">Hello Vue Router!</h1>
  <p>
    <strong>Current Router Path:</strong>{{ $route.fullPath }}
  </p>
  <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/about">About</RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
</template>

<style scoped>

</style>

<script setup>

</script>

<template>
  <h1 class="text-lg font-bold">Hello Vue Router!</h1>
  <p>
    <strong>Current Router Path:</strong>{{ $route.fullPath }}
  </p>
  <nav class="flex gap-4 text-xl">
    <RouterLink
      to="/"
      class="text-slate-500 hover:text-slate-800 transition-colors"
      >
      Home
    </RouterLink>
    <RouterLink 
      to="/about"
      class="text-slate-500 hover:text-slate-800 transition-colors"
      >
      About
  </RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
</template>

<style scoped>

</style>

<script setup>

</script>

<template>
  <div class="min-h-screen bg-gray-100 ">

    <nav class="flex gap-4 px-4 py-4 text-xl">
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
</div>
</template>

<style scoped>

</style>

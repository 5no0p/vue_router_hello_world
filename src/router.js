import { createWebHistory, createRouter } from 'vue-router'

import HomeView from './components/HomeView.vue'
import AboutView from './components/AboutView.vue'

const routes = [
    { path: '/', component: HomeView },
    { path: '/about', component: AboutView}
]

const router = createRouter({
    history: createWebHistory(),
    linkExactActiveClass: 'text-indigo-600 font-semibold',
    routes,
})

export default router
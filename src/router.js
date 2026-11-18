import { createWebHistory, createRouter } from 'vue-router'

import HomeView from './components/HomeView.vue'
// import AboutView from './components/AboutView.vue'

const routes = [
    { path: '/', component: HomeView },
    { path: '/about', component: () => import('./components/AboutView.vue')},
    { 
        path: '/pokemon/:id', 
        name: 'pokemon', 
        component: () => import('./views/pokemonList.vue'),
        props: route => ({
            pokemonId: parseInt(route.params.id)
        })
    },
    {
        path: '/type/:typeName',
        name:'type-list',
        component: () => import('./views/pokemonList.vue'),
        props: true,
    },
    {
        path: '/pokemon/:nameOrId',
        name: 'pokemon-detail',
        component: () => import('./views/pokemonDetail.vue'),
        props: true,
        children: [
            {
                path: '', redirect: {name: 'pokemon-stats'}
            },
            {
                path: 'stats',
                name: 'pokemon-stats',
                component: () => import('./components/pokemonStats.vue'),
                props: true,
            },
            {
                path: 'moves',
                name: 'pokemon-moves',
                component: () => import('./components/PokemonMoves.vue'),
                props: true,
            },
            {
                path: 'evolution',
                name: 'pokemon-evolution',
                component: () => import('./components/PokemonEvolution.vue'),
                props: true,
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () => import('./views/NotFound.vue'),
    },
]

const router = createRouter({
    history: createWebHistory(),
    linkExactActiveClass: 'text-indigo-600 font-semibold',
    routes,
    // scrollBehavior: () => ({top: 0}),
})

export default router
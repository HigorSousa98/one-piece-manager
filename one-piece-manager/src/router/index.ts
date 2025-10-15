// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue')
    },
    {
      path: '/crew',
      name: 'crew',
      component: () => import('@/views/CrewManagement.vue')
    },
    {
      path: '/battle',
      name: 'battle',
      component: () => import('@/views/BattleArena.vue')
    },
    {
      path: '/islands',
      name: 'islands',
      component: () => import('@/views/IslandExploration.vue')
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('@/views/History.vue')
    },
    {
      path: '/adventure',
      name: 'Adventure',
      component: () => import('@/views/Adventure.vue')
    },
    {
      path: '/training',
      name: 'Training',
      component: () => import('@/views/Training.vue')
    },
    {
      path: '/navigation',
      name: 'Navigation',
      component: () => import('@/views/Navigation.vue')
    },
    {
      path: '/character-creation',
      name: 'Character Creation',
      component: () => import('@/views/CharacterCreation.vue')
    },
    {
      path: '/territory-liberation',
      name: 'territory-liberation',
      component: () => import('@/views/TerritoryLiberation.vue')
    },
    {
      path: '/encyclopedia',
      name: 'WorldEncyclopedia',
      component: () => import('@/views/WorldEncyclopedia.vue')
    }
  ]
})

export default router
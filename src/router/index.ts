import { createRouter, createWebHistory } from 'vue-router'
import ShipsView from '@/views/ShipsView.vue'

/**
 * One route. The router is here for the query string — filters are mirrored into
 * it so a filtered view can be shared as a link and survives a reload. The ship
 * dialog is deliberately not a route: it is local UI state opened over the list.
 */
export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{ path: '/', name: 'ships', component: ShipsView }],
})

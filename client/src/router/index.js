import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import About from '../views/about.vue'
import Privacy from '../views/privacy.vue'
import Terms from '../views/terms.vue'
import UploadNew from '@/views/upload-new.vue'
import Profile from '../views/profile.vue'
import Admin from '../views/admin.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: Privacy
    },
    {
      path: '/terms',
      name: 'terms',
      component: Terms
    },
    {
      path: '/upload',
      name: 'upload',
      component: UploadNew
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin
    }
  ]
})

export default router

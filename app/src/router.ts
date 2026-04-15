import { createRouter, createWebHistory } from 'vue-router'

const BASE = import.meta.env.BASE_URL

const router = createRouter({
  history: createWebHistory(BASE),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
      meta: { label: 'Home', fullWidth: false },
    },
    {
      path: '/catalogue',
      name: 'catalogue',
      component: () => import('@/pages/CataloguePage.vue'),
      meta: { label: 'Catalogue', fullWidth: false },
    },
    {
      path: '/ecosystem',
      name: 'ecosystem',
      component: () => import('@/pages/EcosystemPage.vue'),
      meta: { label: 'Ecosystem', fullWidth: false },
    },
    {
      path: '/self-assessment',
      name: 'self-assessment',
      component: () => import('@/pages/SelfAssessmentPage.vue'),
      meta: { label: 'Self-Assessment', fullWidth: false },
    },
    {
      path: '/requirements',
      name: 'requirements',
      component: () => import('@/pages/RequirementsPage.vue'),
      meta: { label: 'Requirements Matrix', fullWidth: true },
    },
    {
      path: '/llm-prompt',
      name: 'llm-prompt',
      component: () => import('@/pages/LlmPromptPage.vue'),
      meta: { label: 'LLM Prompt', fullWidth: false },
    },
    {
      path: '/style-guide',
      name: 'style-guide',
      component: () => import('@/pages/StyleGuidePage.vue'),
      meta: { label: 'Style Guide', fullWidth: false, hideNav: true },
    },
  ],
})

export default router

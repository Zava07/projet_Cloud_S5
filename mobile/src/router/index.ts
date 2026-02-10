import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('@/views/LoginPage.vue')
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/map'
      },
      {
        path: 'map',
        component: () => import('@/views/MapPage.vue')
      },
      {
        path: 'problems',
        component: () => import('@/views/ProblemsListPage.vue')
      },
      {
        path: 'activity',
        component: () => import('@/views/ProblemsListPage.vue')
      },
      {
        path: 'profile',
        component: () => import('@/views/MapPage.vue')
      },
      {
        path: 'add',
        redirect: '/tabs/map'
      }
    ]
  },
  {
    path: '/map',
    redirect: '/tabs/map'
  },
  {
    path: '/problems',
    redirect: '/tabs/problems'
  },
  {
    path: '/problem/:id',
    component: () => import('@/views/ProblemDetailPage.vue')
  },
  {
    path: '/notifications',
    component: () => import('@/views/NotificationsPage.vue')
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;

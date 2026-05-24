import type { RouteRecordRaw } from 'vue-router'
import { RouteEnum } from '@/enums/route.enum'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/PanelLayout.vue'),
    children: [
      {
        path: '',
        name: RouteEnum.Dashboard,
        component: () => import('@/views/DashboardView.vue'),
      },
      {
        path: 'learn/:moduleId',
        name: RouteEnum.ModuleDetail,
        component: () => import('@/views/ModuleDetailView.vue'),
      },
      {
        path: 'learn/:moduleId/:sectionId/quiz',
        name: RouteEnum.Quiz,
        component: () => import('@/views/QuizView.vue'),
      },
      {
        path: 'learn/:moduleId/:sectionId/wrong',
        name: RouteEnum.WrongQuiz,
        component: () => import('@/views/QuizView.vue'),
      },
      {
        path: ':pathMatch(.*)*',
        name: RouteEnum.NotFound,
        component: () => import('@/views/NotFoundView.vue'),
      },
    ],
  },
]

export default routes

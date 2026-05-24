import { createRouter, createWebHistory } from 'vue-router'
import routes from '@/routes'
import nprogress from 'nprogress'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
router.beforeEach((to, from, next) => {
  nprogress.start();
  next();
});
router.afterEach(() => {
  nprogress.done();
});
export default router

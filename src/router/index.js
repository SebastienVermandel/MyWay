import Vue from "vue";
import VueRouter from "vue-router";
import Project from "../components/Project.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/project/:projectName",
    component: Project,
    props: true
  },
  {
    path: "/(project)?",
    component: Project
  }
];

const router = new VueRouter({
  routes
});

export default router;

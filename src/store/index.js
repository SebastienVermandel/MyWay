import Vue from "vue";
import Vuex from "vuex";

import Dexie from "dexie";
import { exportDB, importInto } from "dexie-export-import";

import download from "downloadjs";

Vue.use(Vuex);

let DATABASE_NAME = "MyWayDB2";
const dbPromise = () => {
  let db = new Dexie(DATABASE_NAME);
  db.version(1).stores({
    projects: "name"
  });
  return db;
};

export default new Vuex.Store({
  state: {
    projectNames: [],
    project: {
      userMode: false,
      groups: [],
      name: ""
    }
  },
  mutations: {
    empty(state, values) {
      state.project = values.project;
      state.projectNames = values.projectNames;
    },
    update(state, values) {
      state.project = values.project;
      state.projectNames = values.projectNames;
    }
  },
  actions: {
    async load(context, projectName, isInitial) {
      const db = await dbPromise();
      let projectNames = await db.projects.toCollection().keys();
      if (!projectNames) {
        projectNames = [];
      }
      let project = await db.projects.get(projectName);
      if (!project) {
        // Make a fresh project.
        project = {
          name: projectName,
          groups: [],
          freshGroup: null,
          switchCount: 2,
          talkoverMode: "yes",
          userMode: false
        };
        for (let i = 0; i < 7; i++) {
          project.groups.push({
            id: "" + i,
            clips: [],
            nextClipId: 0,
            keyCode: null,
            keyName: null,
            highlighted: false,
            sequence: [],
            oldSequenceIndex: 0,
            sequenceIndex: 0,
            mode: "Sequence",
            active: true,
            icon: "circle-fill",
            color: "#007bff"
          });
        }
        project.freshGroup = project.groups.splice(7)[0];
      }
      context.commit(isInitial ? "empty" : "update", {
        project: project,
        projectNames: projectNames
      });
    },

    async saveProject(context, project) {
      if (project.name == "") {
        for (let i = 1; ; i++) {
          let newName = "Unnamed project" + (i > 1 ? " " + i : "");
          if (context.getters.projectNames.every(n => n != newName)) {
            project.name = newName;
            break;
          }
        }
      }
      const db = await dbPromise();
      await db.projects.put(project);
      this.dispatch("load", project.name, /* isInitial= */ false);
    },

    async deleteProject(context, projectName) {
      const db = await dbPromise();
      await db.projects.delete(projectName);
      this.dispatch("load", "", /* isInitial= */ false);
    },

    async downloadProjects() {
      const db = await dbPromise();
      const blob = await exportDB(db, { noTransaction: true });
      download(blob, "myway-export.json", "application/json");
    },

    async importProjects(context, blob) {
      const db = await dbPromise();
      await importInto(db, blob);
      this.dispatch("load", "", /* isInitial= */ false);
    }
  },
  getters: {
    project: state => state.project,
    projectNames: state => state.projectNames
  }
});

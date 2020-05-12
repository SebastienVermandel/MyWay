<template>
  <div>
    <b-button-toolbar>
      <b-button-group class="ml-2" size="sm">
        <b-button v-on:click="loadProject('', false)">
          <b-icon icon="file-plus"></b-icon>
          New
        </b-button>
        <b-button v-b-modal.load-modal>
          <b-icon icon="files"></b-icon>
          Open
        </b-button>
        <b-button v-b-modal.delete-modal>
          <b-icon icon="trash"></b-icon>
          Delete
        </b-button>
      </b-button-group>

      <b-button-group class="ml-2" size="sm">
        <b-button v-on:click="downloadProjects">
          <b-icon icon="box-arrow-down"></b-icon>
          Download all
        </b-button>
        <b-button
          ref="importButton"
          v-b-tooltip.click
          title="Drag and drop exported database file here to import."
        >
          <b-icon icon="box-arrow-in-up"></b-icon>
          Import
        </b-button>
      </b-button-group>
    </b-button-toolbar>

    <!-- Load modal -->
    <b-modal id="load-modal" title="Select project to open" hide-footer>
      <b-list-group>
        <b-list-group-item
          button
          v-for="projectName in projectNames"
          :key="projectName"
          v-on:click="loadProject(projectName, false)"
        >
          {{ projectName }}
        </b-list-group-item>
      </b-list-group>
    </b-modal>

    <!-- Delete modal -->
    <b-modal
      id="delete-modal"
      ok-title="Yes"
      cancelTitle="No"
      ok-variant="danger"
      hide-header-close
      hide-header
      @ok="deleteProject(project.name)"
    >
      Delete {{ project.name }}?
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

import _ from "lodash";

export default {
  props: {
    project: {
      required: true,
      type: Object,
      name: ""
    }
  },
  mounted() {
    this.$refs.importButton.ondragover = event => {
      event.stopPropagation();
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    };
    this.$refs.importButton.ondrop = async event => {
      event.stopPropagation();
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      try {
        if (!file) {
          throw new Error("Only files can be dropped here");
        }
        console.log("Importing " + file.name);
        await this.importProjects(file);
        console.log("Import complete");
      } catch (error) {
        console.error("" + error);
      }
      this.$bvModal.show("load-modal");
    };
  },
  methods: {
    ...mapActions([
      "load",
      "saveProject",
      "deleteProject",
      "downloadProjects",
      "importProjects"
    ]),
    async loadProject(projectName, isInitial) {
      this.$bvModal.hide("load-modal");
      this.load(projectName, isInitial);
    },
    spliceGroup(index) {
      this.project.groups.splice(index, 1);
      this.project.groups.push(_.cloneDeep(this.project.freshGroup));
      for (let i = 0; i < 6; i++) {
        this.project.groups[i].id = "" + i;
      }
    },
    renameProject: function(project, projectName) {
      this.saveProject(project);
      this.deleteProject(project.name);
      project.name = projectName;
      this.saveProject(project);
      this.loadProject(project.name, /* isInitial= */ false);
    }
  },
  computed: {
    ...mapState(["projectNames"])
  }
};
</script>

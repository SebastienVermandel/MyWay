<template>
  <b-form inline class="mb-4 mt-2" @submit.stop.prevent>
    <b-form-input
      size="sm"
      v-model="projectNameSetByUser"
      @blur="$emit('rename', project, projectNameSetByUser)"
      placeholder="Project name"
      class="ml-auto mr-3"
      trim
    ></b-form-input>
    <label class="mr-2" for="switches">Switches:</label>
    <b-form-spinbutton
      size="sm"
      class="mr-3"
      id="switches"
      v-model="project.switchCount"
      @change="$emit('change')"
      min="1"
      max="6"
    ></b-form-spinbutton>
    <label class="mr-2" for="talkover">Talk over:</label>
    <b-form-radio-group
      size="sm"
      label="Talk-over mode"
      class="mr-3"
      v-model="project.talkoverMode"
      :options="talkoverModes"
      @change="$emit('change')"
      button-variant="outline-secondary"
      buttons
    ></b-form-radio-group>
  </b-form>
</template>

<script>
export default {
  props: {
    project: {
      required: true,
      type: Object
    }
  },
  data() {
    return {
      projectNameSetByUser: "",
      talkoverMode: "no",
      talkoverModes: [
        { text: "Yes", value: "yes" },
        { text: "Interrupt", value: "interrupt" },
        { text: "No", value: "no" }
      ]
    };
  },
  methods: {
    updateProject(projectName) {
      this.projectNameSetByUser = projectName;
    }
  }
};
</script>

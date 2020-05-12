<template>
  <b-container>
    <b-row class="text-center py-5">
      <b-col
        v-for="group in project.groups.slice(
          0,
          Math.min(3, project.switchCount)
        )"
        :key="group.name"
      >
        <b-icon
          :ref="'button-' + group.id"
          class="big-button"
          :icon="group.icon"
          :style="'color: ' + group.color"
          font-scale="20%"
          @mousedown="$emit('pressed', group.id)"
          @touchstart="$emit('pressed', group.id)"
        ></b-icon>
      </b-col>
    </b-row>
    <b-row v-if="project.switchCount > 3" class="text-center">
      <b-col
        v-for="group in project.groups.slice(
          3,
          Math.min(6, project.switchCount)
        )"
        :key="group.name"
      >
        <b-icon
          :ref="'button-' + group.id"
          class="big-button"
          :icon="group.icon"
          :style="'color: ' + group.color"
          font-scale="20%"
          @mousedown="$emit('pressed', group.id)"
          @touchstart="$emit('pressed', group.id)"
        ></b-icon>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  props: {
    project: {
      required: true,
      type: Object
    }
  },
  methods: {
    handlePress(groupIndex) {
      const element = this.$refs["button-" + groupIndex][0];
      element.classList.remove("animate");
      // Hack to reset the animation.
      window.setTimeout(() => {
        element.classList.add("animate");
      }, 1);
    }
  }
};
</script>

<style>
.big-button {
  cursor: pointer;
}

.animate {
  animation: glow 0.2s 2 alternate;
}

@keyframes glow {
  from {
    filter: drop-shadow(0px 0px 0px rgba(0, 0, 0, 0.7));
  }
  to {
    filter: drop-shadow(0px 0px 15px rgba(0, 0, 0, 0.7));
  }
}
</style>

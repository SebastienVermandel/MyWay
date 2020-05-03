<template>
  <b-input-group size="sm">
    <b-input-group-prepend>
      <b-input-group-text class="handle">
        <b-icon-grid3x3-gap variant="light"></b-icon-grid3x3-gap>
      </b-input-group-text>
    </b-input-group-prepend>
    <b-form-input
      @change="$emit('change')"
      v-model="clip.name"
      :placeholder="placeholder"
    ></b-form-input>
    <b-input-group-append>
      <record-audio-button
        v-bind:clip="clip"
        @change="updateRecording"
      ></record-audio-button>
      <b-button v-on:click="$emit('remove')"><b-icon-x /></b-button>
    </b-input-group-append>
  </b-input-group>
</template>

<script>
import RecordAudioButton from "./RecordAudioButton";

export default {
  components: {
    RecordAudioButton
  },
  props: {
    clip: {
      required: true,
      type: Object
    }
  },
  computed: {
    placeholder() {
      return "Clip " + (this.clip.index + 1);
    }
  },
  methods: {
    updateRecording() {
      this.$emit("change");
    }
  }
};
</script>

<style>
.handle {
  cursor: move;
}
</style>

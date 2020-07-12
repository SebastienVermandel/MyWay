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
      <b-button v-b-modal="'modal-video-' + clip.id">
        <b-icon-film />
      </b-button>
      <record-audio-button
        v-bind:clip="clip"
        @change="updateRecording"
      ></record-audio-button>
      <b-button v-on:click="$emit('remove')"><b-icon-x /></b-button>
    </b-input-group-append>

    <!-- Set video modal -->
    <b-modal
      :id="'modal-video-' + clip.id"
      centered
      size="xl"
      v-if="clip.video"
      ok-only
      hide-header
      @ok="$emit('change')"
    >
      <b-input-group size="sm">
        <b-form-input
          v-model="clip.video.url"
          @input="updateVideo"
          placeholder="Paste YouTube video ID or URL"
        ></b-form-input>
        <b-input-group-append>
          <b-button v-on:click="clearVideo"><b-icon-x /></b-button>
        </b-input-group-append>
      </b-input-group>
      <p v-if="clip.video.id" class="mt-4">
        <youtube
          :video-id="clip.video.id"
          ref="youtube"
          @ready="handlePlayerReady"
          fitParent
        ></youtube>
      </p>
      <p v-if="clip.video.duration">
        <label for="start">Start time:</label>
        <b-form-input
          @input="updateRange"
          id="start"
          type="range"
          v-model="clip.video.start"
          min="0"
          :max="clip.video.duration"
        />
        <label for="start">End time:</label>
        <b-form-input
          @input="updateRange"
          id="end"
          type="range"
          v-model="clip.video.end"
          min="0"
          :max="clip.video.duration"
        />
        {{ clip.video.start }} &ndash; {{ clip.video.end }}
      </p>
    </b-modal>
  </b-input-group>
</template>

<script>
import Vue from "vue";
import VueYoutube from "vue-youtube";
import { getIdFromUrl } from "vue-youtube";
Vue.use(VueYoutube);

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
  mounted() {
    if (!this.clip.video) {
      this.clearVideo();
    }
  },
  methods: {
    updateRecording() {
      this.$emit("change");
    },
    updateVideo() {
      let videoId = getIdFromUrl(this.clip.video.url);
      if (videoId) {
        this.clip.video.id = videoId;
      }
    },
    updateRange() {
      this.$refs.youtube.player.loadVideoById({
        videoId: this.clip.video.id,
        startSeconds: this.clip.video.start,
        endSeconds: this.clip.video.end
      });
    },
    clearVideo() {
      Vue.set(this.clip, "video", {
        url: "",
        id: "",
        duration: 0,
        start: 0,
        end: 0
      });
    },
    handlePlayerReady() {
      let clip = this.clip;
      this.$refs.youtube.player.getDuration().then(duration => {
        clip.video.duration = duration;
        if (!clip.video.end) {
          clip.video.end = duration;
        }
      });
    }
  }
};
</script>

<style>
.handle {
  cursor: move;
}
</style>

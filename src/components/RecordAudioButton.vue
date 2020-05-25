<template>
  <b-button
    class="recorder"
    @mousedown="start"
    @mouseleave="stop"
    @mouseup="stop"
    @touchstart="start"
    @touchend="stop"
    @touchcancel="stop"
    ref="button"
    v-b-tooltip.manual
    title="Hold to record"
    :id="_uid + '-tooltip'"
  >
    <b-icon-mic v-if="!clip.blob && !isRecording"></b-icon-mic>
    <b-icon-mic-fill v-if="isRecording"></b-icon-mic-fill>
    <b-icon-play-fill v-if="!!clip.blob"></b-icon-play-fill>
  </b-button>
</template>

<script>
export default {
  name: "RecordAudioButton",
  props: {
    clip: {
      required: true,
      type: Object
    }
  },
  data() {
    return {
      icon: "mic",
      isSupported: false,
      hasPermission: false,
      isRecording: false,
      isPaused: false,
      chunks: [],
      tooltipTimeout: null
    };
  },
  mounted() {
    if (navigator.mediaDevices || navigator.mediaDevices.getUserMedia) {
      this.isSupported = true;
    }
  },
  methods: {
    async start() {
      if (this.clip.blob) {
        this.play();
        return;
      }
      if (this.isRecording) {
        return;
      }
      try {
        this.$_stream = await this.getStream();
        this.prepareRecorder();
        this.$_mediaRecorder.start();
      } catch (e) {
        this.$emit("error", e);
      }
    },
    stop() {
      if (!this.isRecording) {
        return;
      }
      this.$_mediaRecorder.stop();
      this.$_stream.getTracks().forEach(t => t.stop());
    },
    async getStream() {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.$_stream = stream;
      this.$emit("stream", stream);
      return stream;
    },
    prepareRecorder() {
      if (!this.$_stream) {
        return;
      }
      this.$_mediaRecorder = new MediaRecorder(this.$_stream, {
        mimeType: "audio/webm"
      });
      this.$_mediaRecorder.ignoreMutedMedia = true;
      this.$_mediaRecorder.addEventListener("start", () => {
        this.isRecording = true;
        this.isPaused = false;
        this.startTime = new Date();
        this.$emit("start");
      });
      this.$_mediaRecorder.addEventListener(
        "dataavailable",
        e => {
          if (e.data && e.data.size > 0) {
            this.chunks.push(e.data);
          }
        },
        true
      );
      this.$_mediaRecorder.addEventListener(
        "stop",
        () => {
          const elapsedMs = new Date() - this.startTime;
          if (elapsedMs > 500 && this.chunks.length > 0) {
            console.log(this.chunks);
            new Blob(this.chunks).arrayBuffer().then(buffer => {
              this.clip.blob = buffer;
              this.chunks = [];
              this.$emit("change", this.clip.blob);
            });
          } else {
            this.$root.$emit("bv::show::tooltip", this._uid + "-tooltip");
            if (this.tooltipTimeout) {
              window.clearTimeout(this.tooltipTimeout);
            }
            this.tooltipTimeout = window.setTimeout(() => {
              this.$root.$emit("bv::hide::tooltip", this._uid + "-tooltip");
              this.tooltipTimeout = null;
            }, 1000);
          }
          this.isPaused = false;
          this.isRecording = false;
        },
        true
      );
    },
    play() {
      if (this.clip.blob) {
        new Audio(
          window.URL.createObjectURL(new Blob([this.clip.blob]))
        ).play();
      }
    }
  }
};
</script>

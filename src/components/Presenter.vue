<template>
  <div>
    <b-alert
      :show="converseWarningShowSeconds"
      @dismissed="converseWarningShowSeconds = 0"
      class="position-fixed fixed-bottom m-0 rounded-0"
      style="z-index: 2000;"
      variant="warning"
      dismissible
    >
      Press other switch for converse
    </b-alert>
    <b-alert
      :show="promptScanWarningShowSeconds"
      @dismissed="promptScanWarningShowSeconds = 0"
      class="position-fixed fixed-bottom m-0 rounded-0"
      style="z-index: 2000;"
      variant="warning"
      dismissible
    >
      To use Prompt/Scan mode, set one switch to 'Scan' with a list of clips to
      scan through at low volume, and another to 'Prompt' to trigger playback of
      the selected clip at full volume
    </b-alert>
    <b-alert
      :show="talkoverWarningShowSeconds"
      @dismissed="talkoverWarningShowSeconds = 0"
      class="position-fixed fixed-bottom m-0 rounded-0"
      style="z-index: 2000;"
      variant="warning"
      dismissible
    >
      Already playing a clip. Change talkover mode to allow
      interruption/talk-over.
    </b-alert>

    <!-- Video player -->
    <b-modal
      id="full-screen-modal"
      ref="modal-video-player"
      hide-backdrop
      hide-footer
      hide-header
    >
      <youtube ref="video-player" fitParent></youtube>
    </b-modal>
  </div>
</template>

<script>
import _ from "lodash";

export default {
  props: {
    project: {
      required: true,
      type: Object
    }
  },
  data() {
    return {
      promptScanWarningShowSeconds: 0,
      converseWarningShowSeconds: 0,
      talkoverWarningShowSeconds: 0,
      lastMedia: null
    };
  },
  watch: {
    "project.mode": function() {
      this.update();
    }
  },
  mounted() {
    window.addEventListener(
      "keydown",
      function(event) {
        if (event.isComposing || event.repeat) {
          return;
        }
        for (const group of this.project.groups) {
          if (group.keyCode == event.keyCode) {
            this.$emit("pressed", group.id);
          }
        }
      }.bind(this)
    );
    window.addEventListener(
      "keyup",
      function(event) {
        if (event.isComposing) {
          return;
        }
        for (const group of this.project.groups) {
          if (group.keyCode == event.keyCode) {
            this.$emit("released", group.id);
          }
        }
      }.bind(this)
    );
  },
  methods: {
    handlePress(switchIndex) {
      let group = this.project.groups[switchIndex];

      if (this.lastMedia != null && !this.lastMedia.ended) {
        // Always interrupt in prompt/scan mode.
        if (
          this.project.talkoverMode == "interrupt" ||
          group.mode == "Prompt" ||
          group.mode == "Scan"
        ) {
          this.lastMedia.pause();
          this.lastMedia = null;
        } else if (this.project.talkoverMode == "no") {
          this.talkoverWarningShowSeconds = 2;
          return;
        }
      }

      if (group.mode == "Prompt") {
        let scanGroup = _.find(this.project.groups, g => g.mode == "Scan");
        if (scanGroup) {
          scanGroup.sequenceIndex = scanGroup.oldSequenceIndex;
          this.playClip(scanGroup, /* fullVolume= */ true);
          this.advance(group);
        } else {
          this.promptScanWarningShowSeconds = 8;
        }
        return;
      }

      if (!group.active) {
        this.converseWarningShowSeconds = 2;
        return;
      }

      this.playClip(group);
      this.advance(group);
    },
    handleRelease(switchIndex) {
      let group = this.project.groups[switchIndex];
      if (
        group.keyMode == "Direct" &&
        this.lastMedia != null &&
        !this.lastMedia.ended
      ) {
        this.lastMedia.pause();
        this.lastMedia = null;
        group.sequenceIndex = group.oldSequenceIndex;
        for (const c of group.clips) {
          c.highlighted = false;
        }
        group.clips[group.sequenceIndex].highlighted = true;
      }
    },
    playClip(group, fullVolume) {
      // TODO: Use transition for background color highlight animation.
      //group.highlighted = true;
      const playIndex = group.sequence[group.sequenceIndex];
      if (group.clips.length == 0) {
        return;
      }
      let clip = group.clips[playIndex];
      this.playMedia(group, clip, fullVolume);
      for (const c of group.clips) {
        c.highlighted = false;
      }
      clip.highlighted = true;
    },
    playMedia(group, clip, fullVolume) {
      if (clip.video && clip.video.id) {
        let modalVideoPlayer = this.$refs["modal-video-player"];
        let self = this;
        let lastMedia = {
          ended: false,
          pause: () => {
            let videoPlayer = self.$refs["video-player"];
            if (videoPlayer) {
              videoPlayer.player.stopVideo();
            }
            modalVideoPlayer.hide();
          }
        };
        this.lastMedia = lastMedia;
        this.$root.$on("bv::modal::shown", () => {
          let player = this.$refs["video-player"].player;
          player
            .loadVideoById({
              videoId: clip.video.id,
              startSeconds: clip.video.start,
              endSeconds: clip.video.end
            })
            .then(() => {
              player.playVideo();
            });
          player.addEventListener("onStateChange", event => {
            if (event.data === 0 /* ended */) {
              modalVideoPlayer.hide();
              lastMedia.ended = true;
            }
          });
        });
        modalVideoPlayer.show();
      } else if (clip.blob) {
        const audio = new Audio(
          window.URL.createObjectURL(new Blob([clip.blob]))
        );
        this.lastMedia = audio;
        if (group.mode == "Scan" && !fullVolume) {
          audio.volume = 0.2;
        }
        if (
          group.keyMode == "Latched" &&
          group.sequenceIndex != group.clips.length - 1
        ) {
          audio.onended = () => {
            this.handlePress(group.id);
          };
        }
        audio.play();
      }
    },
    advance(group) {
      group.oldSequenceIndex = group.sequenceIndex;
      if (group.mode == "Random") {
        group.sequenceIndex = _.random(Math.max(0, group.sequence.length - 1));
      } else if (++group.sequenceIndex == group.clips.length) {
        group.sequenceIndex = 0;
        if (group.mode == "Shuffle") {
          group.sequence = _.shuffle(group.sequence);
        }
      }

      if (group.mode == "Converse A") {
        let converseBGroup = _.find(
          this.project.groups,
          g => g.mode == "Converse B"
        );
        if (
          converseBGroup &&
          (group.sequenceIndex > 0 || converseBGroup.sequenceIndex > 0)
        ) {
          converseBGroup.active = true;
          group.active = false;
        }
      } else if (group.mode == "Converse B") {
        let converseAGroup = _.find(
          this.project.groups,
          g => g.mode == "Converse A"
        );
        if (converseAGroup) {
          converseAGroup.active = true;
          group.active = false;
        }
      }
    },
    update() {
      for (const group of this.project.groups) {
        group.sequence = _.range(0, group.clips.length);
        group.sequenceIndex = 0;
        group.oldSequenceIndex = 0;
        group.active = true;
        switch (group.mode) {
          case "Shuffle":
            group.sequence = _.shuffle(group.sequence);
            break;
          case "Random":
            group.sequenceIndex = _.random(
              Math.max(0, group.sequence.length - 1)
            );
            break;
          case "Converse B":
            group.active = false;
            break;
        }
      }
    }
  }
};
</script>

<style scoped>
::v-deep #full-screen-modal > .modal-dialog {
  max-width: 100%;
  margin: 0;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100vh;
  display: flex;
  position: fixed;
  z-index: 100000;
}
::v-deep #full-screen-modal > .modal-dialog > .modal-content > .modal-body {
  padding: 0;
}
</style>

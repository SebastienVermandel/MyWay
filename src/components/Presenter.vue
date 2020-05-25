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
      lastAudio: null
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
        if (event.isComposing) {
          return;
        }
        for (const group of this.project.groups) {
          if (group.keyCode == event.keyCode) {
            this.$emit("pressed", group.id);
          }
        }
      }.bind(this)
    );
  },
  methods: {
    handlePress(switchIndex) {
      let group = this.project.groups[switchIndex];

      if (this.lastAudio != null && !this.lastAudio.ended) {
        // Always interrupt in prompt/scan mode.
        if (
          this.project.talkoverMode == "interrupt" ||
          group.mode == "Prompt" ||
          group.mode == "Scan"
        ) {
          this.lastAudio.pause();
          this.lastAudio = null;
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
    playClip(group, fullVolume) {
      // TODO: Use transition for background color highlight animation.
      //group.highlighted = true;
      const playIndex = group.sequence[group.sequenceIndex];
      if (group.clips.length == 0) {
        return;
      }
      let clip = group.clips[playIndex];

      if (clip.blob) {
        const audio = new Audio(
          window.URL.createObjectURL(new Blob([clip.blob]))
        );
        this.lastAudio = audio;
        if (group.mode == "Scan" && !fullVolume) {
          audio.volume = 0.2;
        }
        audio.play();
      }
      for (const c of group.clips) {
        c.highlighted = false;
      }
      clip.highlighted = true;
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

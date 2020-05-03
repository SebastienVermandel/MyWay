<template>
  <b-button
    :variant="group.active ? 'secondary' : 'outline-secondary'"
    size="sm"
    v-b-tooltip.hover.bottom="
      'Hold while pressing the key to use for the switch'
    "
    @mousedown="held = true"
    @mouseleave="held = false"
    @mouseup="held = false"
    @touchstart="held = true"
    @touchend="held = false"
    @touchcancel="held = false"
    ><template v-if="!group.keyName">Switch</template
    ><kbd class="ml-1" v-if="group.keyName">{{ group.keyName }}</kbd></b-button
  >
</template>

<script>
export default {
  name: "KeyBindingButton",
  data: function() {
    return {
      held: false
    };
  },
  props: {
    group: {
      required: true,
      type: Object
    }
  },
  mounted() {
    window.addEventListener(
      "keydown",
      function(event) {
        if (event.isComposing) {
          return;
        }
        let keyCode = event.keyCode;
        if (this.held) {
          this.group.keyCode = keyCode;
          this.group.keyName = "not set";
          const keyNamesByKeyCode = {
            8: "backspace / delete",
            9: "tab",
            13: "enter",
            16: "shift",
            17: "ctrl",
            18: "alt",
            19: "pause/break",
            20: "caps lock",
            27: "escape",
            32: "spacebar",
            33: "page up",
            34: "page down",
            35: "end",
            36: "home",
            37: "left arrow",
            38: "up arrow",
            39: "right arrow",
            40: "down arrow",
            91: "Windows Key / Left ⌘ / Chromebook Search key",
            92: "right window key",
            93: "Windows Menu / Right ⌘"
          };
          if (keyCode in keyNamesByKeyCode) {
            this.group.keyName = keyNamesByKeyCode[keyCode];
          } else {
            this.group.keyName = String.fromCharCode(keyCode);
          }
          this.$emit("change");
        }
      }.bind(this)
    );
  }
};
</script>

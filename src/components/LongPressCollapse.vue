<template>
  <div>
    <b-button
      class="float-right"
      :disabled="!enabled"
      variant="link"
      @mousedown="start"
      @mouseleave="stop"
      @mouseup="stop"
      @touchstart="start"
      @touchend="stop"
      @touchcancel="stop"
      v-b-tooltip.manual
      title="Press and hold to expand"
      :id="_uid + '-tooltip'"
    >
      <b-icon
        :icon="showing ? 'chevron-compact-up' : 'chevron-compact-down'"
      ></b-icon>
    </b-button>

    <b-collapse v-model="showing">
      <slot></slot>
    </b-collapse>
  </div>
</template>

<script>
export default {
  props: {
    enabled: {
      required: true,
      type: Boolean
    }
  },
  data() {
    return {
      showing: true,
      timeout: null,
      tooltipTimeout: null
    };
  },
  methods: {
    hide() {
      this.showing = false;
    },
    start() {
      if (this.showing) {
        this.showing = false;
      } else {
        this.timeout = window.setTimeout(() => {
          this.timeout = null;
          this.showing = true;
        }, 800);
      }
    },
    stop() {
      if (this.timeout != null) {
        window.clearTimeout(this.timeout);
        this.timeout = null;

        this.$root.$emit("bv::show::tooltip", this._uid + "-tooltip");
        if (this.tooltipTimeout) {
          window.clearTimeout(this.tooltipTimeout);
        }
        this.tooltipTimeout = window.setTimeout(() => {
          this.$root.$emit("bv::hide::tooltip", this._uid + "-tooltip");
          this.tooltipTimeout = null;
        }, 1000);
      }
    }
  }
};
</script>

<template>
  <b-card no-body>
    <template v-slot:header>
      <b-button-toolbar>
        <b-button
          class="m-1"
          size="sm"
          variant="outline-secondary"
          @mousedown="$emit('pressed', group.id)"
          @mouseleave="$emit('released', group.id)"
          @mouseup="$emit('released', group.id)"
          @touchstart="$emit('pressed', group.id)"
          @touchend="$emit('released', group.id)"
          @touchcancel="$emit('released', group.id)"
        >
          <b-icon :icon="group.icon" :style="'color: ' + group.color"></b-icon>
        </b-button>

        <b-button-group class="m-1" size="sm">
          <!-- Shape picker -->
          <b-dropdown class="icon-dropdown" size="sm">
            <template v-slot:button-content>
              <b-icon
                :icon="
                  group.icon.substring(0, group.icon.length - '-fill'.length)
                "
              ></b-icon>
            </template>
            <b-dropdown-item
              v-for="icon in icons"
              :key="icon"
              href="#"
              v-on:click="setIcon(icon)"
            >
              <b-icon :icon="icon" :style="'color: ' + group.color"></b-icon>
            </b-dropdown-item>
          </b-dropdown>

          <!-- Color picker -->
          <b-dropdown class="icon-dropdown" size="sm">
            <template v-slot:button-content>
              <b-icon icon="droplet"></b-icon>
            </template>
            <b-dropdown-item
              v-for="name in colors"
              :key="name"
              href="#"
              v-on:click="setColor(name)"
            >
              <b-icon :icon="group.icon" :style="'color: ' + name"></b-icon>
            </b-dropdown-item>
          </b-dropdown>

          <!-- Key mode-->
          <b-dropdown
            size="sm"
            :text="group.keyMode || 'Standard'"
            v-b-tooltip.hover.bottom="
              group.keyMode == 'Direct'
                ? 'Direct mode: hold down switch to play'
                : group.keyMode == 'Latched'
                ? 'Latched mode: press switch to start playback, which continues until all clips have played'
                : 'Standard mode: press switch to play next clip'
            "
          >
            <b-dropdown-item href="#" v-on:click="setKeyMode"
              >Standard</b-dropdown-item
            >
            <b-dropdown-item href="#" v-on:click="setKeyMode"
              >Direct</b-dropdown-item
            >
            <b-dropdown-item href="#" v-on:click="setKeyMode"
              >Latched</b-dropdown-item
            >
          </b-dropdown>

          <!-- Key picker -->
          <KeyBindingButton
            v-bind:group="group"
            @press="$emit('pressed', group.id)"
            @change="$emit('change')"
          ></KeyBindingButton>
        </b-button-group>

        <!-- Clip advancement mode-->
        <b-dropdown size="sm" class="m-1" :text="group.mode">
          <b-dropdown-item href="#" v-on:click="setMode"
            >Sequence</b-dropdown-item
          >
          <b-dropdown-item href="#" v-on:click="setMode"
            >Shuffle</b-dropdown-item
          >
          <b-dropdown-item href="#" v-on:click="setMode"
            >Random</b-dropdown-item
          >
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item href="#" v-on:click="setMode">Scan</b-dropdown-item>
          <b-dropdown-item href="#" v-on:click="setMode"
            >Prompt</b-dropdown-item
          >
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item href="#" v-on:click="setMode"
            >Converse A</b-dropdown-item
          >
          <b-dropdown-item href="#" v-on:click="setMode"
            >Converse B</b-dropdown-item
          >
        </b-dropdown>

        <b-button size="sm" class="m-1" v-on:click="$emit('remove', group.id)">
          <b-icon icon="trash"></b-icon>
        </b-button>
      </b-button-toolbar>
    </template>

    <b-overlay :show="group.mode == 'Prompt'" rounded="sm">
      <template v-slot:overlay>
        'Prompt' mode plays clips from another switch at full volume.
      </template>
      <draggable
        class="list-group"
        tag="b-list-group"
        :component-data="listGroupOptions()"
        :list="group.clips"
        v-bind="dragOptions"
        handle=".handle"
        @start="drag = true"
        @end="drag = false"
        @change="$emit('change')"
      >
        <b-list-group-item
          v-for="(clip, index) in group.clips"
          :key="clip.id"
          :variant="clip.highlighted ? 'warning' : ''"
        >
          <Clip
            v-bind:clip="clip"
            :index="index"
            @remove="
              group.clips.splice(index, 1);
              $emit('change');
            "
            @change="$emit('change')"
          ></Clip>
        </b-list-group-item>
        <b-list-group-item slot="footer">
          <b-button variant="success" v-on:click="addClip">
            Add clip
          </b-button>
        </b-list-group-item>
      </draggable>
    </b-overlay>
  </b-card>
</template>

<script>
import Vue from "vue";

import Clip from "./Clip";
import KeyBindingButton from "./KeyBindingButton";

import draggable from "vuedraggable";

Vue.component("draggable", draggable);

export default {
  components: {
    Clip,
    KeyBindingButton,
    draggable
  },
  data() {
    return {
      drag: false
    };
  },
  props: {
    group: {
      required: true,
      type: Object
    }
  },
  computed: {
    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost"
      };
    },
    icons() {
      return [
        "circle-fill",
        "square-fill",
        "triangle-fill",
        "pentagon-fill",
        "star-fill",
        "heart-fill",
        "lightning-fill",
        "puzzle-fill"
      ];
    },
    colors() {
      return {
        blue: "#007bff",
        indigo: "#6610f2",
        purple: "#6f42c1",
        pink: "#e83e8c",
        red: "#dc3545",
        orange: "#fd7e14",
        yellow: "#ffc107",
        green: "#28a745",
        teal: "#20c997",
        cyan: "#17a2b8"
      };
    }
  },
  methods: {
    addClip: function() {
      let index = this.group.nextClipId++;
      this.group.clips.push({
        id: this.group.id + "-" + index,
        index: index,
        name: "",
        blob: null,
        highlighted: false
      });
      this.group.sequence = [];
      for (let i = 0; i < this.group.clips.length; i++) {
        this.group.sequence.push(i);
      }
      this.$emit("change");
    },
    setMode(e) {
      this.group.mode = e.target.text;
      this.$emit("change");
    },
    setKeyMode(e) {
      this.group.keyMode = e.target.text;
      this.$emit("change");
    },
    setColor(color) {
      this.group.color = color;
      this.$emit("change");
    },
    setIcon(icon) {
      this.group.icon = icon;
      this.$emit("change");
    },
    listGroupOptions() {
      return {
        attrs: {
          flush: true
        }
      };
    }
  }
};
</script>

<style>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.icon-dropdown .dropdown-menu {
  min-width: 4rem;
}
</style>

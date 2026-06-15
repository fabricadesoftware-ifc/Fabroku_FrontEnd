<template>
  <v-avatar
    class="user-avatar"
    :color="src ? undefined : color"
    :size="size"
    :start="start"
  >
    <v-img
      v-if="src"
      :alt="alt"
      cover
      :src="src"
    >
      <template #placeholder>
        <div class="user-avatar__fallback">
          <v-icon :size="iconSize">{{ icon }}</v-icon>
        </div>
      </template>

      <template #error>
        <div class="user-avatar__fallback">
          <v-icon :size="iconSize">{{ icon }}</v-icon>
        </div>
      </template>
    </v-img>

    <v-icon v-else :size="iconSize">{{ icon }}</v-icon>
  </v-avatar>
</template>

<script setup lang="ts">
  withDefaults(defineProps<{
    src?: string | null
    alt?: string
    size?: string | number
    start?: boolean
    color?: string
    icon?: string
    iconSize?: string | number
  }>(), {
    alt: 'Avatar do usuario',
    size: 32,
    start: false,
    color: 'grey-lighten-2',
    icon: 'mdi-account-circle',
    iconSize: 'default',
  })
</script>

<style scoped>
.user-avatar__fallback {
  align-items: center;
  background: rgba(var(--v-theme-on-surface), 0.08);
  color: rgba(var(--v-theme-on-surface), 0.56);
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
}
</style>

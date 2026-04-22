<template>
  <el-link v-bind="$attrs" :type="type" :underline="underline">
    {{ text || $slots.default?.() }}
  </el-link>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

interface Props {
  text?: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
  underline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  type: 'primary',
  underline: false
})
</script>

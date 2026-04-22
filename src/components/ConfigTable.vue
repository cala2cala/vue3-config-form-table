<template>
  <el-table
    v-bind="$attrs"
    :data="data"
    style="width: 100%"
  >
    <template v-for="column in columns" :key="column.prop">
      <!-- Special columns (selection, index, expand) -->
      <el-table-column
        v-if="['selection', 'index', 'expand'].includes(column.type)"
        :type="column.type"
        v-bind="column"
      />

      <!-- Custom slots -->
      <el-table-column
        v-else-if="column.slots?.customRender"
        v-bind="column"
      >
        <template #default="scope">
          <slot
            v-if="$slots[column.slots.customRender]"
            :name="column.slots.customRender"
            v-bind="scope"
          />
          
          <!-- Default slot implementations -->
          <template v-else-if="column.slots.customRender === 'link'">
            <el-link
              target="_blank"
              type="primary"
              :href="column.slots.customConfig?.href({ record: scope.row, index: scope.$index })"
            >
              {{ scope.row[column.prop] }}
            </el-link>
          </template>

          <template v-else-if="column.slots.customRender === 'buttons'">
            <el-button
              v-for="(button, index) in column.slots.customConfig?.buttons"
              :key="index"
              v-bind="button"
              @click="handleButtonClick(button, { record: scope.row, index: scope.$index })"
            >
              {{ button.label }}
            </el-button>
          </template>
        </template>
      </el-table-column>

      <!-- Standard columns -->
      <el-table-column
        v-else
        v-bind="column"
      />
    </template>
  </el-table>
</template>

<script lang="ts" setup>
import { type PropType } from 'vue'
import type { CommonTableColumnProps, TableCustomButton } from '../types'

const props = defineProps({
  columns: {
    type: Array as PropType<CommonTableColumnProps[]>,
    required: true,
  },
  data: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
})

const emit = defineEmits(['button-click'])

const handleButtonClick = (button: TableCustomButton, { record, index }: { record: any; index: number }) => {
  emit('button-click', { button, record, index })
}
</script>

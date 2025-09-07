<script setup lang="ts">
import { ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])
const showPassword = ref(false)

const updateValue = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="mb-4">
    <label :for="id" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative mt-1">
      <input
        :id="id"
        :value="modelValue"
        :type="showPassword ? 'text' : 'password'"
        class="w-full border rounded px-3 py-2 text-sm pr-10"
        :placeholder="placeholder"
        :required="required"
        @input="updateValue"
      />
      <button
        type="button"
        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
        @click="showPassword = !showPassword"
      >
        <component :is="showPassword ? EyeOff : Eye" class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

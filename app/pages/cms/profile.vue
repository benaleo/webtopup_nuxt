<template>
  <section class="container mx-auto px-4 py-6">
    <h1 class="text-xl font-semibold mb-4">Profile</h1>

    <div class="bg-white border rounded-md">
      <div class="border-b flex">
        <button
          class="px-4 py-2 text-sm"
          :class="tab==='profile' ? 'font-medium border-b-2 border-gray-900' : 'text-gray-600'"
          @click="tab='profile'"
        >Edit Profile</button>
        <button
          class="px-4 py-2 text-sm"
          :class="tab==='password' ? 'font-medium border-b-2 border-gray-900' : 'text-gray-600'"
          @click="tab='password'"
        >Change Password</button>
        <button
          class="px-4 py-2 text-sm"
          :class="tab==='joki' ? 'font-medium border-b-2 border-gray-900' : 'text-gray-600'"
          @click="tab='joki'"
        >Joki Settings</button>
      </div>

      <div class="p-4">
        <!-- Edit Profile -->
        <form v-if="tab==='profile'" class="space-y-4 max-w-xl" @submit.prevent="saveProfile">
          <div>
            <label class="block text-sm font-medium text-gray-700">Name</label>
            <input v-model="form.name" type="text" class="mt-1 w-full border rounded px-3 py-2 text-sm" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Username</label>
            <input v-model="form.username" type="text" class="mt-1 w-full border rounded px-3 py-2 text-sm" required />
            <p class="text-xs text-gray-500 mt-1">You can change your username once every 30 days.</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Avatar</label>
            <div class="mt-1 flex items-center gap-3">
              <img v-if="avatarPreview" :src="avatarPreview" alt="avatar" class="w-14 h-14 rounded object-cover border" />
              <div class="flex gap-2">
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
                <button type="button" class="px-3 py-1.5 text-sm border rounded hover:bg-gray-50" @click="triggerFile">Upload</button>
                <button v-if="form.avatar || form.remove_avatar" type="button" class="px-3 py-1.5 text-sm border rounded hover:bg-gray-50" @click="removeAvatar">Remove</button>
              </div>
            </div>
            <p v-if="uploadError" class="text-xs text-rose-600 mt-1">{{ uploadError }}</p>
          </div>
          <div class="pt-2">
            <button type="submit" class="px-4 py-2 bg-gray-900 text-white rounded text-sm" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>

        <!-- Change Password -->
        <form v-else-if="tab==='password'" class="space-y-4 max-w-md" @submit.prevent="changePassword">
          <div>
            <label class="block text-sm font-medium text-gray-700">Old Password</label>
            <input v-model="pwd.old_password" type="password" class="mt-1 w-full border rounded px-3 py-2 text-sm" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">New Password</label>
            <input v-model="pwd.new_password" type="password" class="mt-1 w-full border rounded px-3 py-2 text-sm" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input v-model="pwd.confirm_password" type="password" class="mt-1 w-full border rounded px-3 py-2 text-sm" required />
          </div>
          <div class="pt-2">
            <button type="submit" class="px-4 py-2 bg-gray-900 text-white rounded text-sm" :disabled="savingPwd">
              {{ savingPwd ? 'Updating...' : 'Update Password' }}
            </button>
          </div>
        </form>

        <!-- Joki Settings -->
        <form v-else class="space-y-4 max-w-2xl" @submit.prevent="saveJoki">
          <div class="flex items-center gap-2">
            <input id="open_joki" type="checkbox" v-model="form.is_open_joki" class="h-4 w-4" />
            <label for="open_joki" class="text-sm text-gray-800">Open to Joki</label>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Games available for Joki</label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label v-for="g in games" :key="g.id" class="flex items-center gap-2 border rounded px-3 py-2 text-sm">
                <input type="checkbox" :value="g.id" v-model="selectedGameIds" />
                <span>{{ g.name }}</span>
              </label>
            </div>
          </div>
          <div class="pt-2">
            <button type="submit" class="px-4 py-2 bg-gray-900 text-white rounded text-sm" :disabled="savingJoki">
              {{ savingJoki ? 'Saving...' : 'Save Joki Settings' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    <!-- Cropper Modal -->
    <div v-if="crop.open" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="closeCropper"></div>
      <div class="relative bg-white rounded-md shadow-lg w-[95%] max-w-lg p-4">
        <h3 class="font-semibold mb-3">Crop Avatar (1:1)</h3>
        <div class="flex flex-col items-center">
          <div
            class="relative bg-gray-100 border rounded overflow-hidden"
            :style="{ width: boxSize + 'px', height: boxSize + 'px' }"
            @mousedown="onDragStart"
            @touchstart.prevent="onDragStart"
          >
            <img
              v-if="crop.imgSrc"
              :src="crop.imgSrc"
              alt="to-crop"
              draggable="false"
              :style="imageStyle"
              @dragstart.prevent
            />
            <div class="absolute inset-0 pointer-events-none ring-2 ring-white/70"></div>
          </div>
          <div class="w-full mt-4">
            <label class="text-sm text-gray-700">Zoom</label>
            <input type="range" min="1" max="3" step="0.01" v-model.number="crop.zoom" class="w-full" />
          </div>
          <div class="mt-4 flex justify-end gap-2 w-full">
            <button class="px-3 py-1.5 border rounded hover:bg-gray-50" @click="closeCropper">Cancel</button>
            <button class="px-3 py-1.5 bg-gray-900 text-white rounded" @click="confirmCrop" :disabled="uploading">
              {{ uploading ? 'Uploading...' : 'Use this avatar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'cms' })

type UserProfile = {
  id: string
  name: string
  username: string
  avatar: string | null
  is_open_joki: boolean
  metadata_joki: any
  last_username_at?: string | null
}

type Game = { id: string; name: string }

const tab = ref<'profile'|'password'|'joki'>('profile')

// Load profile
const { data: profData, refresh: refreshProfile } = await useFetch('/api/cms/profile')

const form = reactive({
  name: '',
  username: '',
  avatar: null as string | null,
  remove_avatar: false,
  is_open_joki: false,
  metadata_joki: {} as any,
})

watchEffect(() => {
  const u = (profData.value as any)?.user as UserProfile | undefined
  if (u) {
    form.name = u.name
    form.username = u.username
    form.avatar = u.avatar
    form.is_open_joki = !!u.is_open_joki
    form.metadata_joki = u.metadata_joki || {}
  }
})

const fileInput = ref<HTMLInputElement | null>(null)
const avatarPreview = computed(() => form.remove_avatar ? null : (form.avatar ? form.avatar : null))
const uploadError = ref('')
const saving = ref(false)

const uploading = ref(false)
const boxSize = 320
const crop = reactive({
  open: false,
  imgSrc: '' as string,
  naturalW: 0,
  naturalH: 0,
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
})

const baseScale = computed(() => {
  if (!crop.naturalW || !crop.naturalH) return 1
  const minSide = Math.min(crop.naturalW, crop.naturalH)
  return boxSize / minSide
})
const totalScale = computed(() => baseScale.value * crop.zoom)
const displayedW = computed(() => crop.naturalW * totalScale.value)
const displayedH = computed(() => crop.naturalH * totalScale.value)
const imageStyle = computed(() => {
  const tx = (boxSize - displayedW.value) / 2 + crop.offsetX
  const ty = (boxSize - displayedH.value) / 2 + crop.offsetY
  return {
    position: 'absolute',
    left: '0px',
    top: '0px',
    width: displayedW.value + 'px',
    height: displayedH.value + 'px',
    transform: `translate(${tx}px, ${ty}px)`,
    willChange: 'transform',
    userSelect: 'none',
    touchAction: 'none',
  } as any
})

function triggerFile() { fileInput.value?.click() }

async function onFileChange(e: Event) {
  uploadError.value = ''
  const input = e.target as HTMLInputElement
  if (!input.files || !input.files[0]) return
  const file = input.files[0]
  const src = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    crop.naturalW = img.naturalWidth
    crop.naturalH = img.naturalHeight
    crop.imgSrc = src
    crop.zoom = 1
    crop.offsetX = 0
    crop.offsetY = 0
    crop.open = true
  }
  img.onerror = () => {
    URL.revokeObjectURL(src)
    uploadError.value = 'Cannot load image'
  }
  img.src = src
  if (input) input.value = ''
}

function closeCropper() {
  if (crop.imgSrc) URL.revokeObjectURL(crop.imgSrc)
  crop.open = false
  crop.imgSrc = ''
}

// Drag handling
let dragging = false
let startX = 0, startY = 0
let startOffsetX = 0, startOffsetY = 0
function onDragStart(ev: MouseEvent | TouchEvent) {
  dragging = true
  const pointer: any = (ev as any).touches ? (ev as any).touches[0] : ev
  if (!pointer) return
  startX = pointer.clientX
  startY = pointer.clientY
  startOffsetX = crop.offsetX
  startOffsetY = crop.offsetY
  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('mouseup', onDragEnd)
  window.addEventListener('touchmove', onDragMove as any, { passive: false } as any)
  window.addEventListener('touchend', onDragEnd)
}
function onDragMove(ev: MouseEvent | TouchEvent) {
  if (!dragging) return
  const pointer: any = (ev as any).touches ? (ev as any).touches[0] : ev
  if (!pointer) return
  const dx = pointer.clientX - startX
  const dy = pointer.clientY - startY
  crop.offsetX = startOffsetX + dx
  crop.offsetY = startOffsetY + dy
  if ((ev as any).preventDefault) (ev as any).preventDefault()
}
function onDragEnd() {
  dragging = false
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
  window.removeEventListener('touchmove', onDragMove as any)
  window.removeEventListener('touchend', onDragEnd)
}

async function confirmCrop() {
  if (!crop.imgSrc) return
  uploading.value = true
  try {
    const img = new Image()
    img.src = crop.imgSrc
    await new Promise((res, rej) => { img.onload = () => res(true); img.onerror = rej })

    const canvas = document.createElement('canvas')
    const size = boxSize
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    const dw = displayedW.value
    const dh = displayedH.value
    const tx = (boxSize - dw) / 2 + crop.offsetX
    const ty = (boxSize - dh) / 2 + crop.offsetY
    const scale = totalScale.value

    let sx = -tx / scale
    let sy = -ty / scale
    let sw = boxSize / scale
    let sh = boxSize / scale

    // Clamp to image bounds
    const maxSw = crop.naturalW - sx
    const maxSh = crop.naturalH - sy
    sw = Math.min(sw, maxSw)
    sh = Math.min(sh, maxSh)
    if (sx < 0) { sw += sx; sx = 0 }
    if (sy < 0) { sh += sy; sy = 0 }

    ctx.clearRect(0, 0, size, size)
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size)

    const blob: Blob = await new Promise((resolve) => canvas.toBlob(b => resolve(b!), 'image/webp', 0.9))
    const file = new File([blob], 'avatar.webp', { type: 'image/webp' })
    const fd = new FormData()
    fd.append('file', file)
    const res: any = await $fetch('/api/cms/upload', { method: 'POST', body: fd })
    form.avatar = res.path
    form.remove_avatar = false
    closeCropper()
  } catch (err: any) {
    uploadError.value = err?.data?.message || err?.message || 'Failed to process image'
  } finally {
    uploading.value = false
  }
}

function removeAvatar() {
  form.remove_avatar = true
  form.avatar = null
}

async function saveProfile() {
  saving.value = true
  try {
    await $fetch('/api/cms/profile', {
      method: 'PUT',
      body: {
        name: form.name,
        username: form.username,
        avatar: form.remove_avatar ? null : form.avatar,
        remove_avatar: form.remove_avatar,
      },
    })
    await refreshProfile()
    toast.success('Profile updated')
    form.remove_avatar = false
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || 'Failed to update profile')
  } finally {
    saving.value = false
  }
}

// Password
const pwd = reactive({ old_password: '', new_password: '', confirm_password: '' })
const savingPwd = ref(false)
async function changePassword() {
  if (pwd.new_password !== pwd.confirm_password) {
    toast.error('Passwords do not match')
    return
  }
  savingPwd.value = true
  try {
    await $fetch('/api/cms/profile-password', { method: 'PUT', body: pwd })
    toast.success('Password updated')
    pwd.old_password = ''
    pwd.new_password = ''
    pwd.confirm_password = ''
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || 'Failed to update password')
  } finally {
    savingPwd.value = false
  }
}

// Joki
const games = ref<Game[]>([])
const selectedGameIds = ref<string[]>([])

onMounted(async () => {
  try {
    const res: any = await $fetch('/api/cms/games', { query: { page: 1, pageSize: 1000 } })
    games.value = (res?.items || []).map((g: any) => ({ id: g.id, name: g.name }))
    // initialize from metadata
    const u = (profData.value as any)?.user
    const ids = (u?.metadata_joki?.game_ids || []) as string[]
    selectedGameIds.value = Array.isArray(ids) ? ids : []
  } catch {}
})

const savingJoki = ref(false)
async function saveJoki() {
  savingJoki.value = true
  try {
    const metadata = { ...(form.metadata_joki || {}), game_ids: selectedGameIds.value }
    await $fetch('/api/cms/profile', {
      method: 'PUT',
      body: {
        name: form.name,
        username: form.username,
        is_open_joki: form.is_open_joki,
        metadata_joki: metadata,
      },
    })
    await refreshProfile()
    toast.success('Joki settings updated')
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || 'Failed to update joki settings')
  } finally {
    savingJoki.value = false
  }
}
</script>

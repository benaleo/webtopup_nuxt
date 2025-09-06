<template>
  <section class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold">Games</h1>
      <div class="flex items-center gap-2">
        <button
          @click="openCreate"
          class="px-3 py-2 rounded bg-emerald-600 text-white text-sm"
        >
          Tambah Game
        </button>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-between mb-3 gap-2">
      <div class="text-sm text-gray-600">Total: {{ meta.total }}</div>
      <div class="flex items-center gap-2">
        <label class="text-sm">Per page</label>
        <select
          v-model.number="pageSize"
          class="border rounded px-2 py-1 text-sm"
          @change="goPage(1)"
        >
          <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
      </div>
    </div>

    <!-- Datatable -->
    <div class="overflow-x-auto border rounded bg-white">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50">
          <tr class="text-left">
            <th class="px-3 py-2">Name</th>
            <th class="px-3 py-2">Slug</th>
            <th class="px-3 py-2">Publisher</th>
            <th class="px-3 py-2">Active</th>
            <th class="px-3 py-2 w-40">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in items" :key="g.id" class="border-t">
            <td class="px-3 py-2">{{ g.name }}</td>
            <td class="px-3 py-2">{{ g.slug }}</td>
            <td class="px-3 py-2">{{ g.publisher }}</td>
            <td class="px-3 py-2">
              <span
                :class="g.is_active ? 'text-emerald-600' : 'text-gray-400'"
                >{{ g.is_active ? "Yes" : "No" }}</span
              >
            </td>
            <td class="px-3 py-2">
              <div class="flex items-center gap-2">
                <button
                  @click="goProducts(g)"
                  class="px-2 py-1 border rounded"
                  title="Products"
                >
                  📦
                </button>
                <button
                  @click="openEdit(g)"
                  class="px-2 py-1 border rounded"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  @click="onDelete(g)"
                  class="px-2 py-1 border rounded text-red-600"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && items.length === 0">
            <td colspan="5" class="px-3 py-6 text-center text-gray-500">
              No data
            </td>
          </tr>
          <tr v-if="loading">
            <td colspan="5" class="px-3 py-6 text-center text-gray-500">
              Loading...
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between mt-3">
      <div class="text-sm text-gray-600">
        Page {{ page }} / {{ meta.pageCount }}
      </div>
      <div class="flex items-center gap-2">
        <button
          :disabled="page <= 1"
          @click="goPage(page - 1)"
          class="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <button
          :disabled="page >= meta.pageCount"
          @click="goPage(page + 1)"
          class="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Modal simple -->
    <div
      v-if="showForm"
      class="fixed inset-0 bg-black/30 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded shadow w-full max-w-lg">
        <div class="px-4 py-3 border-b font-semibold">
          {{ editing ? "Edit Game" : "Tambah Game" }}
        </div>
        <div class="p-4 space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm mb-1">Name</label>
              <input
                v-model="form.name"
                class="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label class="block text-sm mb-1">Publisher</label>
              <input
                v-model="form.publisher"
                class="w-full border rounded px-2 py-1"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm mb-1">Slug</label>
            <input
              v-model="form.slug"
              class="w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <label class="block text-sm mb-1">Description</label>
            <ClientOnly>
              <QuillEditor
                theme="snow"
                contentType="html"
                v-model:content="form.description"
                toolbar="hide"
                class="bg-white"
              />
            </ClientOnly>
          </div>

          <div class="space-y-2">
            <label class="block text-sm">Image</label>
            <div class="flex flex-col md:flex-row gap-3">
              <div class="relative">
                <input
                  ref="fileInput"
                  type="file"
                  id="file-upload"
                  accept="image/*"
                  @change="onPickImage"
                  class="hidden"
                />
                <button
                  type="button"
                  @click="() => ($refs.fileInput as HTMLInputElement)?.click()"
                  class="px-4 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-semibold hover:bg-blue-100 transition-colors"
                >
                  Choose File
                </button>
              </div>
              <input
                v-model="form.image"
                placeholder="paste path like /uploads/xxx.jpg or full URL"
                class="flex-1 border rounded px-2 py-1 text-sm min-w-0"
              />
            </div>
            <div v-if="form.image" class="mt-2">
              <img
                :src="previewImage"
                alt="preview"
                class="h-20 rounded border object-cover"
              />
            </div>
          </div>
          <div>
            <label class="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="form.is_active" /> Active
            </label>
          </div>

          <!-- Metadata Editor -->
          <div class="pt-2">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium">Metadata (opsional)</label>
              <button type="button" @click="addMetaPair" class="px-2 py-1 text-xs rounded border">+ Tambah Attribute</button>
            </div>
            <div class="space-y-2">
              <div v-for="(pair, idx) in metadataPairs" :key="idx" class="flex items-center gap-2">
                <input v-model="pair.key" placeholder="key" class="flex-1 border rounded px-2 py-1 text-sm" />
                <input v-model="pair.value" placeholder="value" class="flex-1 border rounded px-2 py-1 text-sm" />
                <button type="button" @click="removeMetaPair(idx)" class="px-2 py-1 text-xs border rounded">Hapus</button>
              </div>
              <div v-if="!metadataPairs.length" class="text-xs text-gray-500">Belum ada metadata. Klik "Tambah Attribute" untuk menambah.</div>
            </div>
          </div>
        </div>
        <div class="px-4 py-3 border-t flex justify-end gap-2">
          <button @click="closeForm" class="px-3 py-2 border rounded">
            Cancel
          </button>
          <button
            @click="submitForm"
            class="px-3 py-2 rounded bg-emerald-600 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
definePageMeta({ layout: "cms" });

const pageSizeOptions = [10, 25, 50, 100];
const items = ref<any[]>([]);
const meta = reactive({ page: 1, pageSize: 10, total: 0, pageCount: 1 });
const loading = ref(false);

// Build preview URL for image (supports relative stored path or absolute URL)
const config = useRuntimeConfig();
const baseUrl = (config as any).public?.BASE_URL || "";
const previewImage = computed(() => {
  const v = (form as any)?.image as string | undefined;
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `${baseUrl}${v}`;
});

const route = useRoute();
const router = useRouter();
const page = computed({
  get: () => Number(route.query.page || 1),
  set: (v: number) =>
    router.replace({ query: { ...route.query, page: String(v) } }),
});
const pageSize = computed({
  get: () => Number(route.query.pageSize || 10),
  set: (v: number) =>
    router.replace({ query: { ...route.query, pageSize: String(v) } }),
});

watchEffect(() => {
  fetchList();
});

async function fetchList() {
  loading.value = true;
  try {
    const res: any = await $fetch("/api/cms/games", {
      params: { page: page.value, pageSize: pageSize.value },
    });
    items.value = res.items;
    Object.assign(meta, res.meta);
  } finally {
    loading.value = false;
  }
}

async function onPickImage(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  
  const file = input.files[0];
  if (!file) return;
  
  const fd = new FormData();
  fd.append("file", file);
  
  try {
    const res: any = await $fetch("/api/cms/upload", {
      method: "POST",
      body: fd,
    });
    form.image = res.path;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      // The preview will be shown by the existing previewImage computed property
    };
    reader.readAsDataURL(file);
  } catch (err: any) {
    alert(err?.data?.message || err.message || "Upload failed");
  } finally {
    input.value = "";
  }
}

function goPage(p: number) {
  page.value = p;
}

function goProducts(g: any) {
  router.push(`/cms/products/${g.id}`);
}

// CRUD modal
const showForm = ref(false);
const editing = ref(false);
const currentId = ref<string | null>(null);
const form = reactive({
  slug: "",
  name: "",
  publisher: "",
  image: "",
  description: "",
  is_active: true,
})

// Metadata editor state
type MetaPair = { key: string; value: string }
const metadataPairs = ref<MetaPair[]>([])

function addMetaPair() {
  metadataPairs.value.push({ key: '', value: '' })
}
function removeMetaPair(idx: number) {
  metadataPairs.value.splice(idx, 1)
}
function buildMetadataObject(): Record<string, any> | undefined {
  const obj: Record<string, any> = {}
  for (const { key, value } of metadataPairs.value) {
    const k = String(key || '').trim()
    if (!k) continue
    obj[k] = value
  }
  return Object.keys(obj).length ? obj : undefined
}

function openCreate() {
  editing.value = false;
  currentId.value = null;
  Object.assign(form, {
    slug: "",
    name: "",
    publisher: "",
    image: "",
    description: "",
    is_active: true,
  });
  metadataPairs.value = []
  showForm.value = true;
}

function openEdit(g: any) {
  editing.value = true;
  currentId.value = g.id;
  Object.assign(form, {
    slug: g.slug,
    name: g.name,
    publisher: g.publisher,
    image: g.image,
    description: g.description,
    is_active: g.is_active,
  });
  const metaObj = (g as any).metadata as Record<string, any> | null | undefined
  if (metaObj && typeof metaObj === 'object') {
    metadataPairs.value = Object.entries(metaObj).map(([k, v]) => ({ key: String(k), value: String(v as any) }))
  } else {
    metadataPairs.value = []
  }
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
}

async function submitForm() {
  try {
    const metadata = buildMetadataObject()
    if (editing.value && currentId.value) {
      await $fetch(`/api/cms/games/${currentId.value}`, {
        method: "PUT",
        body: { ...form, metadata },
      });
    } else {
      if (!form.image) {
        alert("Silakan upload/paste image dahulu");
        return;
      }
      await $fetch(`/api/cms/games`, { method: "POST", body: { ...form, metadata } });
    }
    showForm.value = false;
    fetchList();
  } catch (e: any) {
    alert(e?.data?.message || e.message || "Error");
  }
}

async function onDelete(g: any) {
  if (!confirm(`Hapus game "${g.name}"?`)) return;
  try {
    await $fetch(`/api/cms/games/${g.id}`, { method: "DELETE" });
    fetchList();
  } catch (e: any) {
    alert(e?.data?.message || e.message || "Error");
  }
}
</script>

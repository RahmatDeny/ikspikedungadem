import {
  ref,
  get,
  set,
  push,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
} from 'firebase/database'
import { db } from './firebase.js'

// ---------- Generic helpers ----------
export async function readOnce(path) {
  const snap = await get(ref(db, path))
  return snap.exists() ? snap.val() : null
}

// Convert an object-of-objects ({id: {...}}) into an array with id field.
export function toArray(obj) {
  if (!obj) return []
  return Object.entries(obj).map(([id, value]) => ({ id, ...value }))
}

export async function createItem(collectionPath, data) {
  const listRef = ref(db, collectionPath)
  const newRef = push(listRef)
  await set(newRef, { ...data, createdAt: Date.now() })
  return newRef.key
}

export async function updateItem(itemPath, data) {
  await update(ref(db, itemPath), data)
}

export async function setItem(itemPath, data) {
  await set(ref(db, itemPath), data)
}

export async function deleteItem(itemPath) {
  await remove(ref(db, itemPath))
}

// Find a single record by an indexed child field (e.g. slug).
export async function findByField(collectionPath, field, value) {
  const q = query(ref(db, collectionPath), orderByChild(field), equalTo(value))
  const snap = await get(q)
  if (!snap.exists()) return null
  const val = snap.val()
  const [id] = Object.keys(val)
  return { id, ...val[id] }
}

// ---------- Slug utility ----------
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

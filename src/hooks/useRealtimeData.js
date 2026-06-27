import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../services/firebase.js'
import { toArray } from '../services/db.js'

/**
 * Subscribe to a Realtime DB path. Returns { data, loading, error }.
 * @param {string} path
 * @param options - { asArray } set true to receive an array of records
 */
export default function useRealtimeData(path, { asArray = false } = {}) {
  const [data, setData] = useState(asArray ? [] : null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!path) return
    setLoading(true)
    const dataRef = ref(db, path)
    const unsub = onValue(
      dataRef,
      (snap) => {
        const val = snap.exists() ? snap.val() : null
        setData(asArray ? toArray(val) : val)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [path, asArray])

  return { data, loading, error }
}

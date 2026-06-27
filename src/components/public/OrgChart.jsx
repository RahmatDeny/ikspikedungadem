import { useState } from 'react'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'

const PLACEHOLDER = 'https://placehold.co/200x200/1D3557/D4AF37?text=Foto'

// Build a tree from a flat list of { id, nama, jabatan, fotoUrl, parentId, urutan }
export function buildTree(list) {
  const byId = {}
  list.forEach((n) => (byId[n.id] = { ...n, children: [] }))
  const roots = []
  list.forEach((n) => {
    if (n.parentId && byId[n.parentId]) {
      byId[n.parentId].children.push(byId[n.id])
    } else {
      roots.push(byId[n.id])
    }
  })
  const sortRec = (nodes) => {
    nodes.sort((a, b) => (a.urutan ?? 999) - (b.urutan ?? 999))
    nodes.forEach((n) => sortRec(n.children))
  }
  sortRec(roots)
  return roots
}

function PersonBox({ node }) {
  return (
    <div className="inline-flex flex-col items-center bg-hitam-soft border border-emas/40 rounded-xl px-4 py-3 w-44 shadow-lg">
      <img
        src={node.fotoUrl || PLACEHOLDER}
        alt={node.nama}
        className="w-16 h-16 rounded-full object-cover border-2 border-emas mb-2"
      />
      <span className="text-white font-semibold text-sm text-center leading-tight">{node.nama}</span>
      <span className="text-emas text-xs text-center mt-0.5">{node.jabatan}</span>
    </div>
  )
}

// ---- Desktop: vertical tree with connector lines ----
function TreeNode({ node }) {
  const hasChildren = node.children && node.children.length > 0
  return (
    <li className="relative flex flex-col items-center">
      <PersonBox node={node} />
      {hasChildren && (
        <>
          <div className="w-px h-6 bg-emas/40" />
          <ul className="flex gap-6 relative before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:h-px">
            {node.children.map((child) => (
              <li key={child.id} className="relative flex flex-col items-center pt-6">
                <span className="absolute top-0 w-px h-6 bg-emas/40" />
                <TreeNode node={child} />
              </li>
            ))}
          </ul>
        </>
      )}
    </li>
  )
}

// ---- Mobile: nested accordion ----
function AccordionNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(depth < 1)
  const hasChildren = node.children && node.children.length > 0
  return (
    <div className="border-l border-emas/20 pl-3">
      <div className="flex items-center gap-3 py-2">
        {hasChildren ? (
          <button onClick={() => setOpen((v) => !v)} className="text-emas">
            {open ? <FiChevronDown /> : <FiChevronRight />}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <img src={node.fotoUrl || PLACEHOLDER} alt={node.nama} className="w-10 h-10 rounded-full object-cover border border-emas" />
        <div>
          <p className="text-white text-sm font-semibold leading-tight">{node.nama}</p>
          <p className="text-emas text-xs">{node.jabatan}</p>
        </div>
      </div>
      {hasChildren && open && (
        <div className="ml-4">
          {node.children.map((child) => (
            <AccordionNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function OrgChart({ list = [] }) {
  const roots = buildTree(list)
  if (roots.length === 0) return null
  return (
    <>
      {/* Desktop diagram */}
      <div className="hidden md:block overflow-x-auto pb-6">
        <ul className="flex flex-col items-center min-w-max mx-auto">
          {roots.map((root) => (
            <TreeNode key={root.id} node={root} />
          ))}
        </ul>
      </div>
      {/* Mobile accordion */}
      <div className="md:hidden">
        {roots.map((root) => (
          <AccordionNode key={root.id} node={root} />
        ))}
      </div>
    </>
  )
}

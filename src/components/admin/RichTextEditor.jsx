import ReactQuill from 'react-quill'

const modules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'blockquote'],
    ['clean'],
  ],
}

export default function RichTextEditor({ value, onChange, placeholder = 'Tulis konten di sini...' }) {
  return (
    <div className="bg-hitam rounded-md">
      <ReactQuill theme="snow" value={value || ''} onChange={onChange} modules={modules} placeholder={placeholder} />
    </div>
  )
}

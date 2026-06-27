import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import useRealtimeData from '../../hooks/useRealtimeData.js'

export default function PublicLayout() {
  const { data: settings } = useRealtimeData('settings/general')
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar settings={settings} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer settings={settings} />
    </div>
  )
}

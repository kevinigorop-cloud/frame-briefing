import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import NewClient from './pages/NewClient'
import ClientDetail from './pages/ClientDetail'
import PublicForm from './pages/PublicForm'
import Login from './pages/Login'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/novo-cliente" element={<NewClient />} />
        <Route path="/cliente/:id" element={<ClientDetail />} />
        <Route path="/formulario/:formId" element={<PublicForm />} />
      </Routes>
    </BrowserRouter>
  )
}
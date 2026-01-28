import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Home from './pages/Home'
import InvoiceList from './pages/InvoiceList'
import CreateInvoice from './pages/CreateInvoice'
import ViewInvoice from './pages/ViewInvoice'
import Navbar from './components/Navbar'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Toaster position="top-right" />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/invoices/create" element={<CreateInvoice />} />
          <Route path="/invoices/:id" element={<ViewInvoice />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

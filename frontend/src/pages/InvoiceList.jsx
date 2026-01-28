import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`/api/invoices`);
      setInvoices(response.data);
    } catch (error) {
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await axios.delete(`/api/invoices/${id}`);
        toast.success('Invoice deleted successfully');
        fetchInvoices();
      } catch (error) {
        toast.error('Failed to delete invoice');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || colors.draft;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <Link
          to="/invoices/create"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Create New Invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">No invoices found</p>
          <Link
            to="/invoices/create"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Create your first invoice
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <li key={invoice._id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Link
                          to={`/invoices/${invoice._id}`}
                          className="text-lg font-medium text-primary-600 hover:text-primary-800"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm text-gray-900">
                          {invoice.buyer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(invoice.issueDate), 'MMM dd, yyyy')} - {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          ${invoice.total.toFixed(2)}
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/invoices/${invoice._id}`}
                          className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(invoice._id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;

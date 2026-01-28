import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ViewInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await axios.get(`/api/invoices/${id}`);
      setInvoice(response.data);
    } catch (error) {
      toast.error('Failed to fetch invoice');
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    const element = document.getElementById('invoice-preview');
    if (!element) return;

    toast.loading('Generating PDF...');
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
      toast.dismiss();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate PDF');
    }
  };

  const exportToTelly = async () => {
    try {
      const response = await axios.get(`/api/invoices/${id}/export/telly`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice.invoiceNumber}-telly.XML`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Telly format exported successfully!');
    } catch (error) {
      toast.error('Failed to export Telly format');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link
          to="/invoices"
          className="text-primary-600 hover:text-primary-800 font-medium"
        >
          ← Back to Invoices
        </Link>
        <div className="flex space-x-3">
          <button
            onClick={exportToTelly}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Export Telly Format
          </button>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Download PDF
          </button>
        </div>
      </div>

      <div id="invoice-preview" className="bg-white shadow-lg rounded-lg p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b-2 border-gray-200 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
              <p className="text-gray-600">Invoice #: {invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Issue Date</p>
              <p className="font-semibold">{format(new Date(invoice.issueDate), 'MMM dd, yyyy')}</p>
              <p className="text-sm text-gray-600 mt-2">Due Date</p>
              <p className="font-semibold">{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Seller and Buyer Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">From</h3>
            <div className="text-gray-900">
              <p className="font-semibold">{invoice.seller.name}</p>
              <p>{invoice.seller.address}</p>
              <p>{invoice.seller.city}, {invoice.seller.state} {invoice.seller.zipCode}</p>
              <p>{invoice.seller.country}</p>
              {invoice.seller.email && <p className="mt-2">{invoice.seller.email}</p>}
              {invoice.seller.phone && <p>{invoice.seller.phone}</p>}
              {invoice.seller.taxId && <p className="mt-2">Tax ID: {invoice.seller.taxId}</p>}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">To</h3>
            <div className="text-gray-900">
              <p className="font-semibold">{invoice.buyer.name}</p>
              <p>{invoice.buyer.address}</p>
              <p>{invoice.buyer.city}, {invoice.buyer.state} {invoice.buyer.zipCode}</p>
              <p>{invoice.buyer.country}</p>
              {invoice.buyer.email && <p className="mt-2">{invoice.buyer.email}</p>}
              {invoice.buyer.phone && <p>{invoice.buyer.phone}</p>}
              {invoice.buyer.taxId && <p className="mt-2">Tax ID: {invoice.buyer.taxId}</p>}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.items.map((item, index) => {
                const itemTotal = item.quantity * item.unitPrice;
                const itemDiscount = itemTotal * (item.discount / 100);
                const itemSubtotal = itemTotal - itemDiscount;
                const itemTax = itemSubtotal * (item.taxRate / 100);
                const itemFinalTotal = itemSubtotal + itemTax;

                return (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.description}</div>
                      {item.discount > 0 && (
                        <div className="text-xs text-gray-500">Discount: {item.discount}%</div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                      {item.taxRate > 0 ? `${item.taxRate}%` : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      ${itemFinalTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-full md:w-1/3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">${invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="text-gray-900">-${invoice.discountAmount.toFixed(2)}</span>
              </div>
            )}
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="text-gray-900">${invoice.taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t-2 border-gray-200 pt-2">
              <span>Total:</span>
              <span>${invoice.total.toFixed(2)} {invoice.currency}</span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {(invoice.notes || invoice.terms || invoice.paymentMethod) && (
          <div className="border-t border-gray-200 pt-6 space-y-4">
            {invoice.notes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Notes</h3>
                <p className="text-gray-700">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Terms</h3>
                <p className="text-gray-700">{invoice.terms}</p>
              </div>
            )}
            {invoice.paymentMethod && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Payment Method</h3>
                <p className="text-gray-700">{invoice.paymentMethod}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewInvoice;

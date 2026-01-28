const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 0, min: 0, max: 100 },
  discount: { type: Number, default: 0, min: 0 },
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  issueDate: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  
  // Seller/Business Information
  seller: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    taxId: { type: String },
    registrationNumber: { type: String },
  },
  
  // Buyer/Client Information
  buyer: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    taxId: { type: String },
  },
  
  // Invoice Items
  items: [invoiceItemSchema],
  
  // Financial Summary
  subtotal: { type: Number, required: true, default: 0 },
  taxAmount: { type: Number, required: true, default: 0 },
  discountAmount: { type: Number, default: 0 },
  total: { type: Number, required: true, default: 0 },
  
  // Additional Information
  currency: { type: String, default: 'USD' },
  notes: { type: String },
  terms: { type: String },
  paymentMethod: { type: String },
  
  // Telly-specific fields for compatibility
  tellyId: { type: String },
  tellySyncStatus: { type: String, enum: ['pending', 'synced', 'failed'], default: 'pending' },
}, {
  timestamps: true
});

// Calculate totals before saving
invoiceSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    const itemDiscount = itemTotal * (item.discount / 100);
    return sum + itemTotal - itemDiscount;
  }, 0);
  
  this.discountAmount = this.items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    return sum + (itemTotal * (item.discount / 100));
  }, 0);
  
  this.taxAmount = this.items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    const itemDiscount = itemTotal * (item.discount / 100);
    const itemSubtotal = itemTotal - itemDiscount;
    return sum + (itemSubtotal * (item.taxRate / 100));
  }, 0);
  
  this.total = this.subtotal - this.discountAmount + this.taxAmount;
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);

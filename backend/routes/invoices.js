const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();
const Invoice = require('../models/Invoice');

// Placeholder if no key is provided, but fully functional if key exists
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "PLACEHOLDER_KEY");

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create invoice
router.post('/', async (req, res) => {
  try {
    // Generate invoice number if not provided
    if (!req.body.invoiceNumber) {
      const count = await Invoice.countDocuments();
      req.body.invoiceNumber = `INV-${Date.now()}-${count + 1}`;
    }
    
    const invoice = new Invoice(req.body);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Invoice number already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Update invoice
router.put('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export invoice in Telly-compatible format (XML)

router.get('/:id/export/telly', async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️  No GEMINI_API_KEY found in environment variables.");
    console.warn("👉  Please check your .env file in the backend directory.");
    console.warn("🔄  Using standard placeholder XML response for now.");
    return res.status(500).json({ error: 'Tally XML export failed' });
  }
  
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // ---- Format data for AI prompt ----
    const tellyData = {
      invoice_number: invoice.invoiceNumber,
      issue_date: invoice.issueDate.toISOString().split('T')[0],
      due_date: invoice.dueDate.toISOString().split('T')[0],
      status: invoice.status,
      currency: invoice.currency,
      
      seller: {
        name: invoice.seller.name,
        address: invoice.seller.address,
        city: invoice.seller.city,
        state: invoice.seller.state,
        zip_code: invoice.seller.zipCode,
        country: invoice.seller.country,
        email: invoice.seller.email,
        phone: invoice.seller.phone,
        tax_id: invoice.seller.taxId,
        registration_number: invoice.seller.registrationNumber,
      },
      
      buyer: {
        name: invoice.buyer.name,
        address: invoice.buyer.address,
        city: invoice.buyer.city,
        state: invoice.buyer.state,
        zip_code: invoice.buyer.zipCode,
        country: invoice.buyer.country,
        email: invoice.buyer.email,
        phone: invoice.buyer.phone,
        tax_id: invoice.buyer.taxId,
      },
      
      line_items: invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        tax_rate: item.taxRate,
        discount: item.discount,
        line_total: (item.quantity * item.unitPrice) * (1 - item.discount / 100) * (1 + item.taxRate / 100),
      })),
      
      totals: {
        subtotal: invoice.subtotal,
        discount: invoice.discountAmount,
        tax: invoice.taxAmount,
        total: invoice.total,
      },
      
      notes: invoice.notes,
      terms: invoice.terms,
      payment_method: invoice.paymentMethod,
    };


    // ---- Gemini Prompt ----
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
        You are an expert Tally Prime XML data converter.
        Convert the following Invoice Text into a Tally Import XML format (Voucher).
        Ensure the XML is valid and follows Tally's schema for a Sales Voucher.
        
        Invoice Text:${JSON.stringify(tellyData, null, 2)}

        Output ONLY the raw XML string. Do not include markdown formatting like \`\`\`xml.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up markdown code blocks if present
    text = text.replace(/```xml/g, '').replace(/```/g, '').trim();


    const xml = text;

    // ---- Send XML as file ----
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${invoice.invoiceNumber}-telly.xml`
    );

    res.send(xml);

  } catch (error) {
    console.error("❌  LLM Service Error:", error.message);
    res.status(500).json({ error: 'Tally XML export failed' });
  }
});

module.exports = router;

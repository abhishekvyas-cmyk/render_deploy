# Telly Invoice Generator

A full-stack MERN application for creating, managing, and exporting professional invoices compatible with Telly billing system.

## Features

- 🎨 Modern, responsive UI built with React and Tailwind CSS
- 📄 Create professional invoices with detailed item management
- 💾 Store invoices in MongoDB database
- 📥 Export invoices in Telly-compatible JSON format
- 📄 Download invoices as PDF files
- 🔄 Real-time calculations for totals, taxes, and discounts
- 📱 Fully responsive design

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- RESTful API

### Frontend
- React.js
- Tailwind CSS
- React Router
- Axios
- jsPDF & html2canvas for PDF generation
- React Hot Toast for notifications

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd telly-assignement
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/telly-invoices
   TELLY_API_KEY=sk_test_1234567890abcdefghijklmnopqrstuvwxyz
   NODE_ENV=development
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system. If not installed, you can use MongoDB Atlas (cloud) and update the `MONGODB_URI` in `.env`.

5. **Run the application**
   
   For development (runs both server and client):
   ```bash
   npm run dev
   ```
   
   Or run separately:
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```

6. **Access the application**
   
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Invoices
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get single invoice
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `GET /api/invoices/:id/export/telly` - Export invoice in Telly format

## Invoice Structure

The invoice format is designed to be compatible with Telly's import requirements:

- Invoice number, dates, and status
- Complete seller/business information
- Complete buyer/client information
- Line items with quantity, price, tax, and discount
- Automatic calculation of subtotals, taxes, and totals
- Additional fields for notes, terms, and payment methods

## Telly Export Format

When exporting to Telly format, the invoice is converted to a JSON structure that matches Telly's expected import format, including:
- Standardized field names (snake_case)
- Proper date formatting
- Complete line items with calculations
- All required seller and buyer information

## Project Structure

```
telly-assignement/
├── server/
│   ├── models/
│   │   └── Invoice.js
│   ├── routes/
│   │   └── invoices.js
│   ├── index.js
│   ├── package.json
│   └── .env
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── package.json
└── README.md
```

## Usage

1. **Create an Invoice**
   - Navigate to "Create Invoice" from the home page
   - Fill in seller and buyer information
   - Add invoice items with descriptions, quantities, and prices
   - Set tax rates and discounts as needed
   - Add notes, terms, and payment method
   - Click "Create Invoice"

2. **View Invoices**
   - Go to "Invoices" to see all created invoices
   - Click on any invoice to view details

3. **Export Invoice**
   - Open an invoice
   - Click "Export Telly Format" to download JSON file for Telly import
   - Click "Download PDF" to generate a PDF version

## Environment Variables

Update the `TELLY_API_KEY` in `server/.env` with your actual Telly API key when ready to integrate with Telly's API.

## License

ISC

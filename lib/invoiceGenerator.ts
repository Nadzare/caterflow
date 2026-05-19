import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface InvoiceData {
  id: string;
  orderDate: Date | string;
  totalAmount: number;
  client: {
    companyName: string;
    picName: string;
    email: string | null;
    phone: string | null;
    logisticAddress: string;
  };
  orderItems: Array<{
    id: string;
    menu: {
      name: string;
      basePrice: number;
    };
    quantity: number;
    subtotal: number;
  }>;
}

export function generateInvoicePDF(order: InvoiceData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const orderDate = new Date(order.orderDate);
  const formattedDate = orderDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Colors
  const primaryColor: [number, number, number] = [255, 107, 53]; // #FF6B35 (Orange)
  const darkTextColor: [number, number, number] = [30, 27, 24];   // #1E1B18 (Charcoal)
  const lightGrey: [number, number, number] = [148, 163, 184];   // Slate 400

  // 1. Header (Brand Name & Business Info)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('CaterFlow', 15, 20);

  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.text('Premium B2B Catering Solutions', 15, 25);
  doc.text('WhatsApp: 0851 9085 9889', 15, 29);
  doc.text('Email: info@caterflow.com', 15, 33);

  // Invoice Title & Status
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('INVOICE', 140, 20);

  // PAID STAMP (2D Flat style)
  doc.setDrawColor(16, 185, 129); // Emerald 500
  doc.setFillColor(209, 250, 229); // Emerald 100
  doc.rect(140, 24, 40, 8, 'FD');
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'bold');
  doc.text('PAID / COMPLETED', 142.5, 29.5);

  // Decorative Horizontal Line
  doc.setDrawColor(237, 232, 224); // #EDE8E0
  doc.setLineWidth(0.5);
  doc.line(15, 38, 195, 38);

  // 2. Invoice Details (Grid)
  // Left Column: Bill To
  doc.setTextColor(lightGrey[0], lightGrey[1], lightGrey[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('BILL TO:', 15, 47);

  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFontSize(11);
  doc.text(order.client.companyName, 15, 52);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Attn: ${order.client.picName}`, 15, 56.5);
  doc.text(`Telp: ${order.client.phone || '-'}`, 15, 61);
  doc.text(`Email: ${order.client.email || '-'}`, 15, 65.5);

  // Address wrapping (Max width 80mm)
  const addressLines = doc.splitTextToSize(order.client.logisticAddress, 80);
  doc.text(addressLines, 15, 70);

  // Right Column: Invoice Info
  doc.setTextColor(lightGrey[0], lightGrey[1], lightGrey[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('INVOICE DETAILS:', 120, 47);

  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFontSize(9);
  doc.text(`Invoice No: INV-${order.id.slice(0, 8).toUpperCase()}`, 120, 52);
  doc.text(`Order ID: ${order.id}`, 120, 56.5);
  doc.text(`Date: ${formattedDate}`, 120, 61);
  doc.text('Payment Mode: Supabase Billing System', 120, 65.5);

  // 3. Items Table
  const tableHeaders = [['No.', 'Menu Name', 'Base Price', 'Qty', 'Subtotal']];
  const tableData = order.orderItems.map((item, index) => [
    (index + 1).toString(),
    item.menu.name,
    `Rp ${item.menu.basePrice.toLocaleString('id-ID')}`,
    item.quantity.toString(),
    `Rp ${item.subtotal.toLocaleString('id-ID')}`,
  ]);

  autoTable(doc, {
    startY: 85,
    head: tableHeaders,
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: darkTextColor,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'center' },
      4: { halign: 'right' },
    },
    styles: {
      lineColor: [237, 232, 224],
      lineWidth: 0.2,
    },
    margin: { left: 15, right: 15 },
  });

  // Get final Y position of table to draw totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // 4. Summary / Total Block
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Subtotal:', 130, finalY);
  doc.text(`Rp ${order.totalAmount.toLocaleString('id-ID')}`, 195, finalY, { align: 'right' });

  doc.text('Tax (0%):', 130, finalY + 5);
  doc.text('Rp 0', 195, finalY + 5, { align: 'right' });

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total Paid:', 130, finalY + 12);
  doc.text(`Rp ${order.totalAmount.toLocaleString('id-ID')}`, 195, finalY + 12, { align: 'right' });

  // 5. Footer Terms & Thank You
  doc.setTextColor(lightGrey[0], lightGrey[1], lightGrey[2]);
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('Thank you for partnering with CaterFlow.', 15, 280);
  doc.text('All orders are subject to our standard B2B catering service agreements.', 15, 284);

  // Save the PDF
  doc.save(`Invoice-${order.client.companyName.replace(/\s+/g, '_')}-${order.id.slice(0, 8)}.pdf`);
}

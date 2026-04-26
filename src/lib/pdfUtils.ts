import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Employee, PayrollProfile, StatutoryRates } from '../types';
import { formatCurrency } from './utils';

export const generatePayslipPDF = (
  employee: Employee,
  profile: PayrollProfile,
  payrollData: any,
  period: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text('PAYSLIP', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Period: ${period}`, pageWidth / 2, 28, { align: 'center' });

  // Company & Employee Info
  doc.setDrawColor(230, 230, 230);
  doc.line(20, 35, pageWidth - 20, 35);

  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Information', 20, 45);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Name: ${employee.firstName} ${employee.lastName}`, 20, 52);
  doc.text(`Employee ID: ${profile.employeeNumber}`, 20, 58);
  doc.text(`Role: ${employee.role}`, 20, 64);
  doc.text(`Department: ${employee.department}`, 20, 70);

  doc.text(`NSSA Number: ${profile.statutory.nssaNumber || 'N/A'}`, pageWidth - 80, 52);
  doc.text(`Pay Grade: ${profile.payGrade}`, pageWidth - 80, 58);
  doc.text(`Pay Frequency: ${profile.payFrequency}`, pageWidth - 80, 64);

  // Earnings Table
  const earningsData = [
    ['Basic Salary', formatCurrency(profile.salaryStructure.basicSalary)],
    ...profile.salaryStructure.fixedAllowances.map(a => [a.type, formatCurrency(a.amount)]),
    [{ content: 'Total Gross Earnings', styles: { fontStyle: 'bold' } }, { content: formatCurrency(payrollData.gross), styles: { fontStyle: 'bold' } }]
  ];

  (doc as any).autoTable({
    startY: 80,
    head: [['Earnings', 'Amount']],
    body: earningsData,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    margin: { left: 20, right: 20 }
  });

  // Deductions Table
  const deductionsData = [
    ['PAYE (Income Tax)', formatCurrency(payrollData.paye)],
    ['AIDS Levy', formatCurrency(payrollData.aidsLevy)],
    ['NSSA Employee', formatCurrency(payrollData.nssaEmployee)],
    ['NEC Levy', formatCurrency(payrollData.necLevy)],
    ...profile.salaryStructure.fixedDeductions.map(d => [d.type, formatCurrency(d.amount)]),
    [{ content: 'Total Deductions', styles: { fontStyle: 'bold' } }, { content: formatCurrency(payrollData.totalDeductions), styles: { fontStyle: 'bold' } }]
  ];

  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [['Deductions', 'Amount']],
    body: deductionsData,
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68], textColor: 255 },
    margin: { left: 20, right: 20 }
  });

  // Summary Table
  const summaryData = [
    ['Net Pay', formatCurrency(payrollData.netPay)]
  ];

  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 10,
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 14, fontStyle: 'bold', textColor: [79, 70, 229] },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: 20, right: 20 }
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY + 30;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('This is a computer-generated document and does not require a signature.', pageWidth / 2, finalY, { align: 'center' });
  doc.text('ZivoHR - The Minimalist HR Platform for Zimbabwe', pageWidth / 2, finalY + 5, { align: 'center' });

  doc.save(`Payslip_${employee.firstName}_${employee.lastName}_${period.replace(/\s+/g, '_')}.pdf`);
};

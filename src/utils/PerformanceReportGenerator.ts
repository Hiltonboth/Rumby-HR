import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { PerformanceReview, PerformanceFeedback, PerformanceReviewCycle } from '../services/performanceService';
import { Employee } from '../types';

export const performanceReportGenerator = {
  generateReviewPDF(
    review: PerformanceReview, 
    employee: Employee, 
    manager: Employee | undefined,
    cycle: PerformanceReviewCycle,
    feedback: PerformanceFeedback[]
  ) {
    const doc = new jsPDF();
    const primaryColor = [0, 122, 255]; // Zivo Blue

    // Header
    doc.setFillColor(245, 247, 250);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ZivoHR', 15, 25);
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('PROFESSIONAL PERFORMANCE APPRAISAL', 15, 32);

    // Employee Info Box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, 50, 180, 40, 3, 3, 'D');

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('EMPLOYEE INFORMATION', 20, 58);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${employee.name}`, 20, 68);
    doc.text(`ID: ${employee.employeeNumber}`, 20, 75);
    doc.text(`Position: ${employee.jobTitle}`, 20, 82);

    doc.text(`Review Period: ${cycle.title}`, 110, 68);
    doc.text(`Manager: ${manager?.name || 'N/A'}`, 110, 75);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 110, 82);

    // Rating Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Summary', 15, 105);
    
    const ratingData = [
      ['Metric', 'Score', 'Weight'],
      ['Self Rating', review.self_rating ? `${review.self_rating}/5` : 'N/A', '30%'],
      ['Manager Rating', review.manager_rating ? `${review.manager_rating}/5` : 'N/A', '70%'],
      ['OVERALL GRADE', review.overall_rating ? `${review.overall_rating}/5` : 'PENDING', '100%'],
    ];

    (doc as any).autoTable({
      startY: 110,
      head: [ratingData[0]],
      body: ratingData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: primaryColor },
      styles: { fontSize: 9 }
    });

    let currentY = (doc as any).lastAutoTable.finalY + 15;

    // Qualitative Sections
    const drawSection = (title: string, content: string | undefined) => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 15, currentY);
      currentY += 7;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const splitText = doc.splitTextToSize(content || 'No comments provided during this review cycle.', 180);
      doc.text(splitText, 15, currentY);
      currentY += (splitText.length * 5) + 10;
    };

    drawSection('Key Strengths', review.strengths);
    drawSection('Areas for Growth', review.areas_for_growth);
    drawSection('Manager Summary', review.summary);

    // Development Plan Section
    if (review.development_plan && review.development_plan.length > 0) {
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Individual Development Plan (Action Items)', 15, currentY);
      currentY += 10;

      const planData = [
        ['Development Item', 'Target Deadline', 'Status'],
        ...review.development_plan.map(p => [p.item, p.deadline || 'Ongoing', p.status.toUpperCase()])
      ];

      (doc as any).autoTable({
        startY: currentY,
        head: [planData[0]],
        body: planData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94] }, // Success Green for growth
        styles: { fontSize: 8 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Peer Feedback Section
    if (feedback.length > 0) {
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('360-Degree Peer Feedback Insights', 15, currentY);
      currentY += 10;

      feedback.forEach((f, index) => {
        if (currentY > 260) {
          doc.addPage();
          currentY = 20;
        }
        doc.setDrawColor(241, 245, 249);
        doc.line(15, currentY, 195, currentY);
        currentY += 8;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        const feedbackText = doc.splitTextToSize(`"${f.content}"`, 170);
        doc.text(feedbackText, 25, currentY);
        currentY += (feedbackText.length * 5) + 5;
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`— ${f.is_anonymous ? 'Anonymous Peer' : (f as any).provider?.name || 'Peer'}`, 160, currentY);
        doc.setTextColor(30, 41, 59);
        currentY += 10;
      });
    }

    // Signatures
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    } else {
      currentY = 260;
    }

    doc.line(15, currentY, 85, currentY);
    doc.line(125, currentY, 195, currentY);
    doc.setFontSize(8);
    doc.text('Employee Signature', 15, currentY + 5);
    doc.text('Manager Signature', 125, currentY + 5);

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`ZivoHR Confidential Personnel Document | Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    }

    doc.save(`${employee.name.replace(' ', '_')}_Performance_Review_${cycle.title.replace(' ', '_')}.pdf`);
  }
};

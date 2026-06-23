import PDFDocument from "pdfkit";
import { Audit, AuditReport } from "../../shared/schema.js";

export function generateAuditPdf(audit: Audit, report: AuditReport): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const colors = {
        primary: "#6366f1",
        primaryDark: "#4338ca",
        success: "#22c55e",
        warning: "#eab308",
        danger: "#ef4444",
        text: "#1e293b",
        textLight: "#64748b",
      };

      const payload = report.reportJson as any;
      const results: any[] = payload.results || [];

      let passes = 0;
      let fails = 0;
      let manual = 0;
      let na = 0;

      for (const r of results) {
        if (r.verdict === "pass") passes++;
        else if (r.verdict === "fail") fails++;
        else if (r.verdict === "requires_manual_attestation") manual++;
        else if (r.verdict === "not_applicable") na++;
      }

      const total = passes + fails + manual + na;
      const score = total > 0 ? Math.round((passes / (passes + fails)) * 100) || 0 : 0;

      // Cover Page
      doc.fillColor(colors.primaryDark)
        .fontSize(28)
        .font("Helvetica-Bold")
        .text("CodeGuard Audit Report", { align: "center" });
      
      doc.moveDown(1);
      doc.fillColor(colors.text)
        .fontSize(16)
        .text(`Framework: ${payload.framework}`, { align: "center" });
      doc.text(`Repository: ${audit.repositoryUrl}#${audit.branch}`, { align: "center" });
      doc.text(`Generated: ${new Date(payload.timestamp).toLocaleString()}`, { align: "center" });
      
      doc.moveDown(2);
      
      doc.fontSize(20).text(`Readiness Score: ${score}%`, { align: "center" });
      
      doc.moveDown(4);
      doc.fontSize(14).text(`Pass: ${passes} | Fail: ${fails} | Manual: ${manual} | N/A: ${na}`, { align: "center" });
      
      doc.addPage();
      
      // Control Results Table
      doc.fillColor(colors.text)
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("Control Results", { underline: true });
        
      doc.moveDown(1);
      
      for (const r of results) {
        doc.fontSize(14).font("Helvetica-Bold").fillColor(colors.text).text(r.controlId, { continued: true });
        
        let vColor = colors.textLight;
        if (r.verdict === "pass") vColor = colors.success;
        if (r.verdict === "fail") vColor = colors.danger;
        if (r.verdict === "requires_manual_attestation") vColor = colors.warning;
        
        doc.fillColor(vColor).text(` - ${r.verdict.toUpperCase()}`);
        
        if (r.evidence && r.evidence.length > 0) {
          doc.fontSize(10).font("Helvetica").fillColor(colors.textLight).text(r.evidence[0].raw_evidence_snippet);
        }
        doc.moveDown(0.5);
      }
      
      // Manual Checklist
      doc.addPage();
      doc.fillColor(colors.text).fontSize(20).font("Helvetica-Bold").text("Manual Attestation Checklist", { underline: true });
      doc.moveDown(1);
      for (const r of results) {
        if (r.verdict === "requires_manual_attestation") {
          doc.fontSize(12).font("Helvetica").fillColor(colors.text).text(`[ ] ${r.controlId}`);
          doc.moveDown(0.5);
        }
      }

      // Hash/Signature
      doc.addPage();
      doc.fillColor(colors.text).fontSize(16).font("Helvetica-Bold").text("Cryptographic Verification", { underline: true });
      doc.moveDown(1);
      doc.fontSize(10).font("Courier").text(`Report Hash (SHA-256): ${report.reportHash}`);
      doc.moveDown(0.5);
      doc.text(`Signature (HMAC): ${report.signature}`);
      
      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

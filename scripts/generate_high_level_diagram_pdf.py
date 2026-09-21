import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Group, Polygon
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header
        self.drawString(54, 750, "KL UNIVERSITY // ENGINEERING CAPSTONE RESEARCH EVALUATION")
        self.drawRightString(558, 750, "HIGH-LEVEL SYSTEM DIAGRAM")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 742, 558, 742)

        # Footer
        self.line(54, 45, 558, 45)
        self.setFont("Helvetica", 8)
        self.drawString(54, 32, "Confidential • HackTheAPI System Architecture Specification")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_text)
        self.restoreState()

def create_system_architecture_drawing():
    """Build high-resolution vector drawing of the 5-layer system architecture diagram."""
    d = Drawing(504, 380)

    # 1. CLIENT LAYER (Left Box)
    d.add(Rect(10, 10, 150, 360, fill=colors.HexColor("#F8FAFC"), stroke=colors.HexColor("#0284C7"), strokeWidth=1.5, rx=6, ry=6))
    d.add(Rect(10, 340, 150, 30, fill=colors.HexColor("#0284C7"), stroke=None, rx=4, ry=4))
    d.add(String(18, 351, "CLIENT LAYER (React 18 SPA)", fontName="Helvetica-Bold", fontSize=8.5, fillColor=colors.white))

    d.add(Rect(20, 270, 130, 55, fill=colors.HexColor("#FFFFFF"), stroke=colors.HexColor("#CBD5E1"), rx=4, ry=4))
    d.add(String(26, 310, "React 18 Frontend UI", fontName="Helvetica-Bold", fontSize=8, fillColor=colors.HexColor("#0F172A")))
    d.add(String(26, 298, "• Dashboard / Modules", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor("#64748B")))
    d.add(String(26, 286, "• Port 3009 (Vite)", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor("#0284C7")))

    d.add(Rect(20, 195, 130, 65, fill=colors.HexColor("#FFFFFF"), stroke=colors.HexColor("#0284C7"), rx=4, ry=4))
    d.add(String(26, 245, "Payload Workbench", fontName="Helvetica-Bold", fontSize=8, fillColor=colors.HexColor("#0F172A")))
    d.add(String(26, 233, "• OpenAPI Explorer", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor("#64748B")))
    d.add(String(26, 221, "• 1-Click Exploit Loading", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor("#64748B")))
    d.add(String(26, 209, "• Custom HTTP Builder", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor("#64748B")))

    d.add(Rect(20, 105, 130, 80, fill=colors.HexColor("#FFFFFF"), stroke=colors.HexColor("#EC7211"), rx=4, ry=4))
    d.add(String(26, 172, "Qwen AI Assistant Panel", fontName="Helvetica-Bold", fontSize=8, fillColor=colors.HexColor("#EC7211")))
    d.add(String(26, 160, "• VS Code Copilot Drawer", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor("#64748B")))
    d.add(String(26, 148, "• Real-Time Context Reader", fontName="Helvetica-Bold", fontSize=7, fillColor=colors.HexColor("#0F172A")))
    d.add(String(26, 136, "• Active Exercise ID", fontName="Helvetica", fontSize=6.5, fillColor=colors.HexColor("#64748B")))
    d.add(String(26, 124, "• Request Method / Path", fontName="Helvetica", fontSize=6.5, fillColor=colors.HexColor("#64748B")))
    d.add(String(26, 112, "• Last Execution Response", fontName="Helvetica", fontSize=6.5, fillColor=colors.HexColor("#64748B")))

    # 2. BACKEND LAYER (Center Box)
    d.add(Rect(175, 10, 170, 360, fill=colors.HexColor("#F8FAFC"), stroke=colors.HexColor("#10B981"), strokeWidth=1.5, rx=6, ry=6))
    d.add(Rect(175, 340, 170, 30, fill=colors.HexColor("#10B981"), stroke=None, rx=4, ry=4))
    d.add(String(183, 351, "BACKEND CORE (Django REST)", fontName="Helvetica-Bold", fontSize=8.5, fillColor=colors.white))

    d.add(Rect(185, 275, 150, 55, fill=colors.HexColor("#FFFFFF"), stroke=colors.HexColor("#F59E0B"), rx=4, ry=4))
    d.add(String(191, 315, "Obj 1: Auth & User Security", fontName="Helvetica-Bold", fontSize=8, fillColor=colors.HexColor("#D97706")))
    d.add(String(191, 303, "• JWT Token Verification", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor("#64748B")))
    d.add(String(191, 291, "• Multi-Tenant RBAC", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor("#64748B")))
    d.add(String(191, 279, "• Gmail 3-Attempt OTP Reset", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor("#64748B")))

    d.add(Rect(185, 210, 150, 55, fill=colors.HexColor("#FFFFFF"), stroke=colors.HexColor("#06B6D4"), rx=4, ry=4))
    d.add(String(191, 250, "Obj 2: Lab Catalog Manager", fontName="Helvetica-Bold", fontSize=8, fillColor=colors.HexColor("#0284C7")))
    d.add(String(191, 238, "• 12 OWASP API Security Labs", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor("#64748B")))
    d.add(String(191, 226, "• Dynamic Port Allocator", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor("#64748B")))
    d.add(String(191, 214, "• Session Timeout (20 min)", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor("#64748B")))

    d.add(Rect(185, 145, 150, 55, fill=colors.HexColor("#FFFFFF"), stroke=colors.HexColor("#10B981"), rx=4, ry=4))
    d.add(String(191, 185, "Obj 3: Oracle Verification Engine", fontName="Helvetica-Bold", fontSize=7.5, fillColor=colors.HexColor("#059669")))
    d.add(String(191, 173, "• Independent Server Check", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor("#64748B")))
    d.add(String(191, 161, "• Request Payload Evaluator", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor("#64748B")))
    d.add(String(191, 149, "• Target DB State Evaluator", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor("#64748B")))

    d.add(Rect(185, 80, 150, 55, fill=colors.HexColor("#FFFFFF"), stroke=colors.HexColor("#6366F1"), rx=4, ry=4))
    d.add(String(191, 120, "Obj 4 & 5: AI & Analytics", fontName="Helvetica-Bold", fontSize=8, fillColor=colors.HexColor("#4F46E5")))
    d.add(String(191, 108, "• Qwen AI Context Gateway", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor("#64748B")))
    d.add(String(191, 96, "• Progress Stats Injector", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor("#64748B")))
    d.add(String(191, 84, "• Transfer Pre/Post Metrics", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor("#64748B")))

    # 3. INFRASTRUCTURE & AI LAYER (Right Box)
    d.add(Rect(360, 10, 134, 360, fill=colors.HexColor("#F8FAFC"), stroke=colors.HexColor("#6366F1"), strokeWidth=1.5, rx=6, ry=6))
    d.add(Rect(360, 340, 134, 30, fill=colors.HexColor("#6366F1"), stroke=None, rx=4, ry=4))
    d.add(String(368, 351, "ISOLATED LABS & LOCAL AI", fontName="Helvetica-Bold", fontSize=8, fillColor=colors.white))

    d.add(Rect(370, 200, 114, 130, fill=colors.HexColor("#FFFFFF"), stroke=colors.HexColor("#0284C7"), rx=4, ry=4))
    d.add(String(376, 316, "Docker Target Labs", fontName="Helvetica-Bold", fontSize=8, fillColor=colors.HexColor("#0284C7")))
    d.add(String(376, 302, "• Session Container #1", fontName="Helvetica", fontSize=6.5, fillColor=colors.HexColor("#64748B")))
    d.add(String(376, 290, "• Session Container #2", fontName="Helvetica", fontSize=6.5, fillColor=colors.HexColor("#64748B")))
    d.add(String(376, 278, "• Session Containers #3..12", fontName="Helvetica", fontSize=6.5, fillColor=colors.HexColor("#64748B")))
    d.add(String(376, 260, "Dynamic Ports:", fontName="Helvetica-Bold", fontSize=6.5, fillColor=colors.HexColor("#0F172A")))
    d.add(String(376, 248, "8101 - 8112", fontName="Helvetica-Bold", fontSize=7.5, fillColor=colors.HexColor("#059669")))
    d.add(String(376, 230, "Isolated Bridge Subnet", fontName="Helvetica-Oblique", fontSize=6.5, fillColor=colors.HexColor("#64748B")))

    d.add(Rect(370, 80, 114, 110, fill=colors.HexColor("#FFFFFF"), stroke=colors.HexColor("#6366F1"), rx=4, ry=4))
    d.add(String(376, 176, "Local Ollama LLM", fontName="Helvetica-Bold", fontSize=8, fillColor=colors.HexColor("#4F46E5")))
    d.add(String(376, 164, "• Model: qwen2.5-coder", fontName="Helvetica", fontSize=6.5, fillColor=colors.HexColor("#64748B")))
    d.add(String(376, 152, "• Port: 11434 (Local)", fontName="Helvetica-Bold", fontSize=6.5, fillColor=colors.HexColor("#0F172A")))
    d.add(String(376, 136, "Zero Cloud Data Leak", fontName="Helvetica-Bold", fontSize=6.5, fillColor=colors.HexColor("#059669")))
    d.add(String(376, 120, "Reads Progress &", fontName="Helvetica", fontSize=6.5, fillColor=colors.HexColor("#64748B")))
    d.add(String(376, 108, "Screen Workbench State", fontName="Helvetica", fontSize=6.5, fillColor=colors.HexColor("#64748B")))

    d.add(Rect(370, 20, 114, 50, fill=colors.HexColor("#FFFFFF"), stroke=colors.HexColor("#64748B"), rx=4, ry=4))
    d.add(String(376, 56, "SQLite / Postgres DB", fontName="Helvetica-Bold", fontSize=7.5, fillColor=colors.HexColor("#0F172A")))
    d.add(String(376, 42, "Users, Roles, Progress", fontName="Helvetica", fontSize=6.5, fillColor=colors.HexColor("#64748B")))
    d.add(String(376, 30, "Reset Tokens & Logs", fontName="Helvetica", fontSize=6.5, fillColor=colors.HexColor("#64748B")))

    # Connectors / Arrows
    d.add(Line(160, 227, 175, 227, stroke=colors.HexColor("#0284C7"), strokeWidth=1.5))
    d.add(Line(160, 145, 175, 107, stroke=colors.HexColor("#EC7211"), strokeWidth=1.5))

    d.add(Line(335, 172, 370, 265, stroke=colors.HexColor("#059669"), strokeWidth=1.5))
    d.add(Line(335, 107, 370, 135, stroke=colors.HexColor("#4F46E5"), strokeWidth=1.5))
    d.add(Line(335, 290, 370, 45, stroke=colors.HexColor("#64748B"), strokeWidth=1.5))

    return d

def generate_high_level_diagram_pdf():
    pdf_output_dir = r"c:\Users\Ravi Santosh\Desktop\Special_Project\docs_pdf"
    pdf_docs_dir = r"c:\Users\Ravi Santosh\Desktop\Special_Project\docs"
    os.makedirs(pdf_output_dir, exist_ok=True)

    pdf_path1 = os.path.join(pdf_output_dir, "High_Level_System_Diagram.pdf")
    pdf_path2 = os.path.join(pdf_docs_dir, "High_Level_System_Diagram.pdf")

    for pdf_target in [pdf_path1, pdf_path2]:
        doc = SimpleDocTemplate(
            pdf_target,
            pagesize=letter,
            leftMargin=54,
            rightMargin=54,
            topMargin=54,
            bottomMargin=54
        )

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'DocTitle',
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#0F172A"),
            spaceAfter=4
        )

        subtitle_style = ParagraphStyle(
            'DocSubTitle',
            fontName='Helvetica',
            fontSize=9.5,
            leading=13.5,
            textColor=colors.HexColor("#64748B"),
            spaceAfter=10
        )

        h2_style = ParagraphStyle(
            'H2Style',
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=colors.HexColor("#1E293B"),
            spaceBefore=12,
            spaceAfter=6
        )

        p_style = ParagraphStyle(
            'PStyle',
            fontName='Helvetica',
            fontSize=8.5,
            leading=12.5,
            textColor=colors.HexColor("#334155"),
            spaceAfter=4
        )

        elements = []
        elements.append(Paragraph("High-Level System Architecture Specification", title_style))
        elements.append(Paragraph("HackTheAPI // OWASP API Security Training & Assessment Platform — All 5 Core Objectives Integrated", subtitle_style))
        elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#EC7211"), spaceBefore=0, spaceAfter=10))

        # Add Vector System Architecture Diagram
        elements.append(create_system_architecture_drawing())
        elements.append(Spacer(1, 10))

        elements.append(Paragraph("System Architecture Component & Objective Mapping", h2_style))

        table_data = [
            [Paragraph("<font color='white'><b>Component Layer</b></font>", p_style), Paragraph("<font color='white'><b>Target Technology / Port</b></font>", p_style), Paragraph("<font color='white'><b>System Objective & Responsibility</b></font>", p_style)],
            [Paragraph("<b>1. Client UI Layer</b>", p_style), Paragraph("React 18 SPA (Vite)<br/>Port 3009", p_style), Paragraph("Renders interactive dashboard, 12 OWASP payload workbenches, OpenAPI explorer, and VS Code Copilot style Qwen AI drawer.", p_style)],
            [Paragraph("<b>2. Auth & RBAC Core</b>", p_style), Paragraph("Django REST Framework<br/>Port 8000", p_style), Paragraph("<b>Objective 1:</b> Multi-tenant RBAC (Student, Instructor, Assessor, Admin) with Gmail SMTP 3-attempt OTP password reset security.", p_style)],
            [Paragraph("<b>3. OWASP Labs Catalog</b>", p_style), Paragraph("Docker Target Containers<br/>Ports 8101 - 8112", p_style), Paragraph("<b>Objective 2:</b> 12 hands-on vulnerability lab containers running on isolated per-user bridge subnets.", p_style)],
            [Paragraph("<b>4. Server-Side Oracle Engine</b>", p_style), Paragraph("Django Evaluation Core<br/>Port 8000", p_style), Paragraph("<b>Objective 3:</b> Independent dual-phase evaluator asserting HTTP request/response payloads and physical backend container database states.", p_style)],
            [Paragraph("<b>5. Transfer Analytics Engine</b>", p_style), Paragraph("Django Analytics Core<br/>Port 8000", p_style), Paragraph("<b>Objective 4:</b> Pre-test vs Post-test transfer learning assessment engine tracking skill acquisition velocity and student progress metrics.", p_style)],
            [Paragraph("<b>6. Local Ollama AI Engine</b>", p_style), Paragraph("Ollama (`qwen2.5-coder`) <br/>Port 11434 (Localhost)", p_style), Paragraph("<b>Objective 5:</b> Zero cloud data leak local LLM service reading user progress and real-time screen/workbench context for step-by-step lab guidance.", p_style)],
        ]

        t = Table(table_data, colWidths=[120, 110, 274])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1E293B")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ]))
        elements.append(t)

        doc.build(elements, canvasmaker=NumberedCanvas)
        print(f"[OK] High-Level System Architecture PDF compiled successfully: {pdf_target}")

if __name__ == '__main__':
    generate_high_level_diagram_pdf()

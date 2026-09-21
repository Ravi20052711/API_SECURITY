import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
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
        self.drawRightString(558, 750, "CODE EXECUTION FLOWCHART")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 742, 558, 742)

        # Footer
        self.line(54, 45, 558, 45)
        self.setFont("Helvetica", 8)
        self.drawString(54, 32, "Confidential • HackTheAPI Source Code Architecture Specification")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_text)
        self.restoreState()

def build_code_flowchart_pdf():
    pdf_output_dir = r"c:\Users\Ravi Santosh\Desktop\Special_Project\docs_pdf"
    pdf_docs_dir = r"c:\Users\Ravi Santosh\Desktop\Special_Project\docs"
    os.makedirs(pdf_output_dir, exist_ok=True)

    pdf_path1 = os.path.join(pdf_output_dir, "Code_Execution_Flowchart.pdf")
    pdf_path2 = os.path.join(pdf_docs_dir, "Code_Execution_Flowchart.pdf")

    for pdf_target in [pdf_path1, pdf_path2]:
        doc = SimpleDocTemplate(
            pdf_target,
            pagesize=letter,
            leftMargin=54,
            rightMargin=54,
            topMargin=54,
            bottomMargin=54
        )

        title_style = ParagraphStyle(
            'DocTitle', fontName='Helvetica-Bold', fontSize=18, leading=22, textColor=colors.HexColor("#0F172A"), spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            'DocSubTitle', fontName='Helvetica', fontSize=9.5, leading=13.5, textColor=colors.HexColor("#64748B"), spaceAfter=10
        )
        h2_style = ParagraphStyle(
            'H2Style', fontName='Helvetica-Bold', fontSize=12, leading=16, textColor=colors.HexColor("#1E293B"), spaceBefore=12, spaceAfter=6
        )
        p_style = ParagraphStyle(
            'PStyle', fontName='Helvetica', fontSize=8.5, leading=12, textColor=colors.HexColor("#334155"), spaceAfter=4
        )

        elements = []
        elements.append(Paragraph("Real Code Execution Flowchart & Architecture Specification", title_style))
        elements.append(Paragraph("HackTheAPI // Step-by-Step Source Code Execution Across React SPA, Django REST, Docker & Ollama", subtitle_style))
        elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#EC7211"), spaceBefore=0, spaceAfter=12))

        table_data = [
            [Paragraph("<font color='white'><b>Phase & Execution Step</b></font>", p_style), Paragraph("<font color='white'><b>Source Code File & Function</b></font>", p_style), Paragraph("<font color='white'><b>Real Runtime Action & Execution Logic</b></font>", p_style)],
            
            # Phase 1
            [Paragraph("<b>1. App Startup & Auth</b>", p_style), Paragraph("`src/App.jsx`<br/>`src/services/api.js`", p_style), Paragraph("Reads JWT token from localStorage. Dispatches `axios.get('/auth/user/me')` to Django backend to populate user profile and RBAC role.", p_style)],
            [Paragraph("<b>2. Login & JWT Claims</b>", p_style), Paragraph("`server/apps/authentication/views.py`", p_style), Paragraph("Validates PBKDF2 hash in DB. Issues signed JWT access/refresh tokens containing user claims (`email, role, is_active`).", p_style)],
            
            # Phase 2
            [Paragraph("<b>3. Lab Catalog Query</b>", p_style), Paragraph("`src/pages/ModulesPage.jsx`<br/>`challenge_registry.py`", p_style), Paragraph("Queries `GET /api/v1/exercises/catalog`. ChallengeRegistry returns 12 OWASP labs (`ex-bola-01` to `ex-graphql-01`).", p_style)],
            [Paragraph("<b>4. Docker Provisioning</b>", p_style), Paragraph("`server/apps/guided_exercises/views.py`", p_style), Paragraph("Student clicks 'Start Lab'. Backend spawns target container session on isolated port (e.g. `Port 8102` for BFLA) and returns session token.", p_style)],
            
            # Phase 3
            [Paragraph("<b>5. Workbench State Sync</b>", p_style), Paragraph("`src/pages/ExercisePage.jsx`", p_style), Paragraph("Runs `useEffect()` syncing `window.__CURRENT_LAB_WORKBENCH_STATE__` with active exercise ID, OWASP type, method, path, headers, body, and output.", p_style)],
            [Paragraph("<b>6. Payload Execution</b>", p_style), Paragraph("`src/pages/ExercisePage.jsx`", p_style), Paragraph("Student clicks 'Send Request'. Axios dispatches HTTP payload directly to target container port (`http://localhost:8102/api/v1/users/carlos`).", p_style)],
            
            # Phase 4
            [Paragraph("<b>7. Oracle Server Assertion</b>", p_style), Paragraph("`server/apps/guided_exercises/oracle_engine.py`", p_style), Paragraph("Student clicks 'Validate Lab'. Backend `OracleEngine` asserts HTTP request payload AND queries physical container DB state (e.g. verifies user Carlos deleted). Updates `UserProgress` score (+100).", p_style)],
            
            # Phase 5
            [Paragraph("<b>8. Screen Context Reader</b>", p_style), Paragraph("`src/components/QwenFloatingAssistant.jsx`", p_style), Paragraph("Student submits 'guide me through this'. Component packages `window.__CURRENT_LAB_WORKBENCH_STATE__` and posts payload to `POST /api/v1/ai/chat`.", p_style)],
            [Paragraph("<b>9. Local Ollama LLM Guidance</b>", p_style), Paragraph("`server/apps/ai_assistant/qwen_service.py`", p_style), Paragraph("Django `QwenAIService` injects student progress & screen workbench state into LLM prompt. Queries local Ollama (`http://127.0.0.1:11434`) model `qwen2.5-coder`. Returns step guidance with zero cloud data leak.", p_style)],
        ]

        t = Table(table_data, colWidths=[120, 140, 244])
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
        print(f"[OK] Code Execution Flowchart PDF compiled successfully: {pdf_target}")

if __name__ == '__main__':
    build_code_flowchart_pdf()

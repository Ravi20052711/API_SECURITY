import os
import re
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and render 'Page X of Y' page numbers
    along with professional header and footer margins.
    """
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
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (Top Line)
        self.drawString(54, 750, "KL UNIVERSITY // ENGINEERING CAPSTONE RESEARCH EVALUATION")
        self.drawRightString(558, 750, "HACKTHEAPI PLATFORM")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 742, 558, 742)

        # Footer (Bottom Line)
        self.line(54, 45, 558, 45)
        self.setFont("Helvetica", 8)
        self.drawString(54, 32, "Confidential • Capstone Evaluation Deliverables")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_text)
        self.restoreState()

def clean_md_formatting(text):
    """Convert basic markdown formatting into ReportLab HTML tags."""
    text = text.replace('<br>', '<br/>')
    text = text.replace('&', '&amp;')
    # Clean markdown code blocks / inline code
    text = re.sub(r'`([^`]+)`', r'<font face="Courier" color="#0F172A"><b>\1</b></font>', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'\*([^*]+)\*', r'<i>\1</i>', text)
    return text

def parse_markdown_to_elements(md_text, styles):
    elements = []
    lines = md_text.split('\n')
    i = 0
    n = len(lines)

    in_code_block = False
    code_lines = []
    table_lines = []

    def flush_table(lines_list):
        if not lines_list:
            return None
        headers = []
        rows = []
        for idx, line in enumerate(lines_list):
            if '|' not in line:
                continue
            cells = [clean_md_formatting(c.strip()) for c in line.split('|')[1:-1]]
            if idx == 0:
                headers = cells
            elif idx == 1 and '---' in line:
                continue
            else:
                rows.append(cells)
        
        if not headers and not rows:
            return None
        
        table_data = []
        if headers:
            table_data.append([Paragraph(f"<b>{h}</b>", styles['TableHeader']) for h in headers])
        for row in rows:
            table_data.append([Paragraph(cell, styles['TableCell']) for cell in row])
        
        if not table_data:
            return None
        
        col_count = len(table_data[0])
        avail_width = 504
        col_widths = [avail_width / col_count] * col_count

        t = Table(table_data, colWidths=col_widths)
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
        return t

    while i < n:
        line = lines[i]

        # Code block handler
        if line.strip().startswith("```"):
            if in_code_block:
                code_text = "\n".join(code_lines)
                safe_code = code_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('\n', '<br/>').replace(' ', '&nbsp;')
                code_p = Paragraph(f"<font face='Courier' size=8>{safe_code}</font>", styles['CodeBlock'])
                elements.append(code_p)
                elements.append(Spacer(1, 6))
                in_code_block = False
                code_lines = []
            else:
                in_code_block = True
                code_lines = []
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # Table handler
        if '|' in line and ('---' in line or (i + 1 < n and '|' in lines[i+1])):
            table_lines.append(line)
            i += 1
            while i < n and '|' in lines[i]:
                table_lines.append(lines[i])
                i += 1
            t_obj = flush_table(table_lines)
            if t_obj:
                elements.append(t_obj)
                elements.append(Spacer(1, 8))
            table_lines = []
            continue

        stripped = line.strip()
        if not stripped:
            i += 1
            continue

        if stripped.startswith("# "):
            elements.append(Paragraph(clean_md_formatting(stripped[2:]), styles['TitleDoc']))
            elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#EC7211"), spaceBefore=4, spaceAfter=10))
        elif stripped.startswith("## "):
            elements.append(Paragraph(clean_md_formatting(stripped[3:]), styles['Heading1Custom']))
        elif stripped.startswith("### "):
            elements.append(Paragraph(clean_md_formatting(stripped[4:]), styles['Heading2Custom']))
        elif stripped.startswith("#### "):
            elements.append(Paragraph(clean_md_formatting(stripped[5:]), styles['Heading3Custom']))
        elif stripped.startswith("* ") or stripped.startswith("- "):
            bullet_text = clean_md_formatting(stripped[2:])
            elements.append(Paragraph(f"• {bullet_text}", styles['BulletCustom']))
        elif re.match(r'^\d+\.\s', stripped):
            bullet_text = clean_md_formatting(re.sub(r'^\d+\.\s', '', stripped))
            elements.append(Paragraph(f"• {bullet_text}", styles['BulletCustom']))
        elif stripped.startswith("> "):
            quote_text = clean_md_formatting(stripped[2:])
            elements.append(Paragraph(f"<i>{quote_text}</i>", styles['QuoteBlock']))
        else:
            elements.append(Paragraph(clean_md_formatting(stripped), styles['NormalCustom']))
            elements.append(Spacer(1, 4))

        i += 1

    return elements

def build_pdf_document(md_filepath, output_pdfpath):
    with open(md_filepath, 'r', encoding='utf-8') as f:
        md_content = f.read()

    doc = SimpleDocTemplate(
        output_pdfpath,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    base_styles = getSampleStyleSheet()

    styles = {
        'TitleDoc': ParagraphStyle(
            'TitleDoc',
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#0F172A"),
            spaceAfter=6
        ),
        'Heading1Custom': ParagraphStyle(
            'Heading1Custom',
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=17,
            textColor=colors.HexColor("#1E293B"),
            spaceBefore=12,
            spaceAfter=5,
            keepWithNext=True
        ),
        'Heading2Custom': ParagraphStyle(
            'Heading2Custom',
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#0284C7"),
            spaceBefore=9,
            spaceAfter=4,
            keepWithNext=True
        ),
        'Heading3Custom': ParagraphStyle(
            'Heading3Custom',
            fontName='Helvetica-Bold',
            fontSize=9.5,
            leading=12.5,
            textColor=colors.HexColor("#475569"),
            spaceBefore=7,
            spaceAfter=3,
            keepWithNext=True
        ),
        'NormalCustom': ParagraphStyle(
            'NormalCustom',
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#334155"),
            spaceAfter=3
        ),
        'BulletCustom': ParagraphStyle(
            'BulletCustom',
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#334155"),
            leftIndent=12,
            spaceAfter=3
        ),
        'TableHeader': ParagraphStyle(
            'TableHeader',
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=10.5,
            textColor=colors.white
        ),
        'TableCell': ParagraphStyle(
            'TableCell',
            fontName='Helvetica',
            fontSize=8,
            leading=10.5,
            textColor=colors.HexColor("#1E293B")
        ),
        'CodeBlock': ParagraphStyle(
            'CodeBlock',
            fontName='Courier',
            fontSize=7.5,
            leading=10,
            textColor=colors.HexColor("#0F172A"),
            backColor=colors.HexColor("#F1F5F9"),
            borderColor=colors.HexColor("#CBD5E1"),
            borderWidth=0.5,
            borderPadding=6,
            spaceBefore=5,
            spaceAfter=5
        ),
        'QuoteBlock': ParagraphStyle(
            'QuoteBlock',
            fontName='Helvetica-Oblique',
            fontSize=9,
            leading=12.5,
            textColor=colors.HexColor("#0369A1"),
            leftIndent=12,
            spaceBefore=5,
            spaceAfter=5
        )
    }

    elements = parse_markdown_to_elements(md_content, styles)
    doc.build(elements, canvasmaker=NumberedCanvas)
    print(f"[OK] Generated PDF: {output_pdfpath}")

def generate_all_capstone_pdfs():
    docs_dir = r"c:\Users\Ravi Santosh\Desktop\Special_Project\docs"
    output_dir = r"c:\Users\Ravi Santosh\Desktop\Special_Project\docs_pdf"
    os.makedirs(output_dir, exist_ok=True)

    files = [
        "1_functional_and_non_functional_requirements.md",
        "2_alternative_solutions_and_tradeoff_analysis.md",
        "3_complete_system_architecture_and_detailed_design.md",
        "4_implementation_and_unit_level_progress.md",
        "5_testing_evidence_demonstration_and_individual_defence.md",
        "6_total_raw_rubric.md",
        "7_capstone_master_project_report.md"
    ]

    for fname in files:
        md_path = os.path.join(docs_dir, fname)
        pdf_name = fname.replace('.md', '.pdf')
        pdf_path = os.path.join(output_dir, pdf_name)
        pdf_in_docs = os.path.join(docs_dir, pdf_name)
        if os.path.exists(md_path):
            build_pdf_document(md_path, pdf_path)
            build_pdf_document(md_path, pdf_in_docs)
            if fname == "7_capstone_master_project_report.md":
                build_pdf_document(md_path, os.path.join(output_dir, "Capstone_Master_Project_Report.pdf"))
                build_pdf_document(md_path, os.path.join(docs_dir, "Capstone_Master_Project_Report.pdf"))

    # Merge all 6 PDFs into a single Master Combined Capstone Submission Booklet
    try:
        import fitz
        combined_doc = fitz.open()
        for fname in files:
            pdf_path = os.path.join(output_dir, fname.replace('.md', '.pdf'))
            if os.path.exists(pdf_path):
                sub = fitz.open(pdf_path)
                combined_doc.insert_pdf(sub)
        
        master_path1 = os.path.join(output_dir, "Complete_Capstone_Evaluation_Deliverables_Combined.pdf")
        master_path2 = os.path.join(docs_dir, "Complete_Capstone_Evaluation_Deliverables_Combined.pdf")
        combined_doc.save(master_path1)
        combined_doc.save(master_path2)
        print(f"[OK] Generated Master Combined PDF Booklet: {master_path1}")
    except Exception as e:
        print(f"[NOTE] FitZ merge skipped: {e}")

    print("\n[SUCCESS] ALL 6 CAPSTONE EVALUATION PDFS + COMBINED BOOKLET GENERATED SUCCESSFULLY!")

if __name__ == '__main__':
    generate_all_capstone_pdfs()

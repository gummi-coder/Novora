"""
Report Generator Service
Generates PDF reports for surveys, teams, and organizations
"""
import io
from typing import Dict, Any, List, Optional
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

class ReportGenerator:
    """Generates PDF reports for various data types"""
    
    def __init__(self):
        """Initialize report generator"""
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        # Title style
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        )
        
        # Subtitle style
        self.subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceAfter=20,
            textColor=colors.darkblue
        )
        
        # Normal text style
        self.normal_style = ParagraphStyle(
            'CustomNormal',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=12
        )
    
    def generate_survey_responses_pdf(self, survey: Dict[str, Any], responses: List[Dict[str, Any]], filters: Dict[str, Any]) -> bytes:
        """
        Generate PDF report for survey responses
        
        Args:
            survey: Survey data
            responses: List of response data
            filters: Applied filters
            
        Returns:
            PDF content as bytes
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        story = []
        
        # Title
        title = Paragraph(f"Survey Responses Report", self.title_style)
        story.append(title)
        
        # Survey information
        story.append(Paragraph(f"<b>Survey:</b> {survey.get('name', 'N/A')}", self.normal_style))
        story.append(Paragraph(f"<b>Survey ID:</b> {survey.get('id', 'N/A')}", self.normal_style))
        story.append(Paragraph(f"<b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", self.normal_style))
        story.append(Spacer(1, 20))
        
        # Filters applied
        if filters:
            story.append(Paragraph("<b>Filters Applied:</b>", self.subtitle_style))
            for key, value in filters.items():
                story.append(Paragraph(f"• {key}: {value}", self.normal_style))
            story.append(Spacer(1, 20))
        
        # Response summary
        story.append(Paragraph(f"<b>Total Responses:</b> {len(responses)}", self.normal_style))
        story.append(Spacer(1, 20))
        
        # Responses table
        if responses:
            story.append(Paragraph("<b>Response Details:</b>", self.subtitle_style))
            
            # Prepare table data
            headers = ['Team ID', 'Driver ID', 'Score', 'Timestamp']
            table_data = [headers]
            
            for response in responses:
                row = [
                    response.get('team_id', 'N/A'),
                    response.get('driver_id', 'N/A'),
                    str(response.get('score', 'N/A')),
                    response.get('timestamp', 'N/A')
                ]
                table_data.append(row)
            
            # Create table
            table = Table(table_data, colWidths=[1.5*inch, 1.5*inch, 1*inch, 2*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(table)
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
    
    def generate_team_report_pdf(self, report_data: Dict[str, Any]) -> bytes:
        """
        Generate PDF report for team data
        
        Args:
            report_data: Team report data
            
        Returns:
            PDF content as bytes
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        story = []
        
        # Title
        team_name = report_data.get('team', {}).get('name', 'Unknown Team')
        title = Paragraph(f"Team Report: {team_name}", self.title_style)
        story.append(title)
        
        # Team information
        team = report_data.get('team', {})
        story.append(Paragraph(f"<b>Team ID:</b> {team.get('id', 'N/A')}", self.normal_style))
        story.append(Paragraph(f"<b>Description:</b> {team.get('description', 'N/A')}", self.normal_style))
        story.append(Paragraph(f"<b>Period:</b> {report_data.get('period', {}).get('start', 'N/A')} to {report_data.get('period', {}).get('end', 'N/A')}", self.normal_style))
        story.append(Paragraph(f"<b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", self.normal_style))
        story.append(Spacer(1, 20))
        
        # Participation data
        participation_data = report_data.get('participation', [])
        if participation_data:
            story.append(Paragraph("<b>Participation Summary:</b>", self.subtitle_style))
            
            headers = ['Survey ID', 'Respondents', 'Team Size', 'Participation %', 'Delta %']
            table_data = [headers]
            
            for p in participation_data:
                row = [
                    p.get('survey_id', 'N/A'),
                    str(p.get('respondents', 0)),
                    str(p.get('team_size', 0)),
                    f"{p.get('participation_pct', 0):.1f}%",
                    f"{p.get('delta_pct', 0):.1f}%"
                ]
                table_data.append(row)
            
            table = Table(table_data, colWidths=[1.5*inch, 1*inch, 1*inch, 1.2*inch, 1*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 9),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(table)
            story.append(Spacer(1, 20))
        
        # Driver data
        driver_data = report_data.get('drivers', [])
        if driver_data:
            story.append(Paragraph("<b>Driver Performance:</b>", self.subtitle_style))
            
            headers = ['Survey ID', 'Driver ID', 'Avg Score', 'Detractors %', 'Passives %', 'Promoters %']
            table_data = [headers]
            
            for d in driver_data:
                row = [
                    d.get('survey_id', 'N/A'),
                    d.get('driver_id', 'N/A'),
                    f"{d.get('avg_score', 0):.2f}",
                    f"{d.get('detractors_pct', 0):.1f}%",
                    f"{d.get('passives_pct', 0):.1f}%",
                    f"{d.get('promoters_pct', 0):.1f}%"
                ]
                table_data.append(row)
            
            table = Table(table_data, colWidths=[1.2*inch, 1.2*inch, 1*inch, 1*inch, 1*inch, 1*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(table)
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
    
    def generate_org_report_pdf(self, report_data: Dict[str, Any]) -> bytes:
        """
        Generate PDF report for organization data
        
        Args:
            report_data: Organization report data
            
        Returns:
            PDF content as bytes
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        story = []
        
        # Title
        org_name = report_data.get('organization', {}).get('name', 'Organization')
        title = Paragraph(f"Organization Report: {org_name}", self.title_style)
        story.append(title)
        
        # Organization information
        story.append(Paragraph(f"<b>Organization ID:</b> {report_data.get('organization', {}).get('id', 'N/A')}", self.normal_style))
        story.append(Paragraph(f"<b>Period:</b> {report_data.get('period', {}).get('start', 'N/A')} to {report_data.get('period', {}).get('end', 'N/A')}", self.normal_style))
        story.append(Paragraph(f"<b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", self.normal_style))
        story.append(Spacer(1, 20))
        
        # Summary statistics
        surveys = report_data.get('surveys', [])
        teams = report_data.get('teams', [])
        alerts = report_data.get('alerts', [])
        
        story.append(Paragraph("<b>Summary Statistics:</b>", self.subtitle_style))
        story.append(Paragraph(f"• Total Surveys: {len(surveys)}", self.normal_style))
        story.append(Paragraph(f"• Total Teams: {len(teams)}", self.normal_style))
        story.append(Paragraph(f"• Total Alerts: {len(alerts)}", self.normal_style))
        story.append(Spacer(1, 20))
        
        # Alerts summary
        if alerts:
            story.append(Paragraph("<b>Active Alerts:</b>", self.subtitle_style))
            
            headers = ['Alert ID', 'Team ID', 'Driver ID', 'Severity', 'Status', 'Created']
            table_data = [headers]
            
            for alert in alerts[:10]:  # Limit to first 10 alerts
                row = [
                    alert.get('id', 'N/A')[:8] + '...',  # Truncate long IDs
                    alert.get('team_id', 'N/A')[:8] + '...' if alert.get('team_id') else 'N/A',
                    alert.get('driver_id', 'N/A')[:8] + '...' if alert.get('driver_id') else 'N/A',
                    alert.get('severity', 'N/A'),
                    alert.get('status', 'N/A'),
                    alert.get('created_at', 'N/A')[:10] if alert.get('created_at') else 'N/A'
                ]
                table_data.append(row)
            
            table = Table(table_data, colWidths=[1.2*inch, 1.2*inch, 1.2*inch, 0.8*inch, 0.8*inch, 1*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(table)
            story.append(Spacer(1, 20))
        
        # Participation overview
        participation_data = report_data.get('participation', [])
        if participation_data:
            story.append(Paragraph("<b>Participation Overview:</b>", self.subtitle_style))
            
            # Calculate averages
            total_respondents = sum(p.get('respondents', 0) for p in participation_data)
            total_team_size = sum(p.get('team_size', 0) for p in participation_data)
            avg_participation = (total_respondents / total_team_size * 100) if total_team_size > 0 else 0
            
            story.append(Paragraph(f"• Total Respondents: {total_respondents}", self.normal_style))
            story.append(Paragraph(f"• Total Team Size: {total_team_size}", self.normal_style))
            story.append(Paragraph(f"• Average Participation: {avg_participation:.1f}%", self.normal_style))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

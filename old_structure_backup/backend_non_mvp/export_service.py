"""
Export Service
Handles data export functionality for various formats
"""
import csv
import io
import json
from typing import Dict, Any, List, Optional
import pandas as pd
from datetime import datetime

class ExportService:
    """Handles data export functionality"""
    
    def __init__(self):
        """Initialize export service"""
        pass
    
    def export_to_csv(self, data: List[Dict[str, Any]], filename: str = None) -> tuple[bytes, str]:
        """
        Export data to CSV format
        
        Args:
            data: List of dictionaries to export
            filename: Optional filename for the export
            
        Returns:
            Tuple of (file_content, filename)
        """
        if not data:
            raise ValueError("No data to export")
        
        # Create CSV content
        output = io.StringIO()
        if data:
            writer = csv.DictWriter(output, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
        
        content = output.getvalue().encode('utf-8')
        
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"export_{timestamp}.csv"
        
        return content, filename
    
    def export_to_excel(self, data: List[Dict[str, Any]], filename: str = None, sheet_name: str = "Data") -> tuple[bytes, str]:
        """
        Export data to Excel format
        
        Args:
            data: List of dictionaries to export
            filename: Optional filename for the export
            sheet_name: Name of the worksheet
            
        Returns:
            Tuple of (file_content, filename)
        """
        if not data:
            raise ValueError("No data to export")
        
        # Convert to DataFrame and export
        df = pd.DataFrame(data)
        output = io.BytesIO()
        df.to_excel(output, sheet_name=sheet_name, index=False)
        output.seek(0)
        
        content = output.read()
        
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"export_{timestamp}.xlsx"
        
        return content, filename
    
    def export_to_json(self, data: List[Dict[str, Any]], filename: str = None, pretty: bool = True) -> tuple[bytes, str]:
        """
        Export data to JSON format
        
        Args:
            data: List of dictionaries to export
            filename: Optional filename for the export
            pretty: Whether to format JSON with indentation
            
        Returns:
            Tuple of (file_content, filename)
        """
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"export_{timestamp}.json"
        
        if pretty:
            content = json.dumps(data, indent=2, default=str).encode('utf-8')
        else:
            content = json.dumps(data, default=str).encode('utf-8')
        
        return content, filename
    
    def export_multiple_sheets(self, sheets_data: Dict[str, List[Dict[str, Any]]], filename: str = None) -> tuple[bytes, str]:
        """
        Export multiple data sets to Excel with multiple sheets
        
        Args:
            sheets_data: Dictionary of {sheet_name: data_list}
            filename: Optional filename for the export
            
        Returns:
            Tuple of (file_content, filename)
        """
        if not sheets_data:
            raise ValueError("No data to export")
        
        output = io.BytesIO()
        
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            for sheet_name, data in sheets_data.items():
                if data:
                    df = pd.DataFrame(data)
                    df.to_excel(writer, sheet_name=sheet_name, index=False)
        
        output.seek(0)
        content = output.read()
        
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"export_{timestamp}.xlsx"
        
        return content, filename
    
    def format_survey_data(self, survey_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Format survey data for export
        
        Args:
            survey_data: Raw survey data
            
        Returns:
            Formatted data for export
        """
        formatted_data = []
        
        # Extract and format survey responses
        if 'responses' in survey_data:
            for response in survey_data['responses']:
                formatted_response = {
                    'survey_id': response.get('survey_id'),
                    'team_id': response.get('team_id'),
                    'driver_id': response.get('driver_id'),
                    'score': response.get('score'),
                    'timestamp': response.get('timestamp'),
                    'comment': response.get('comment', '')
                }
                formatted_data.append(formatted_response)
        
        return formatted_data
    
    def format_team_report_data(self, team_data: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Format team report data for export
        
        Args:
            team_data: Raw team report data
            
        Returns:
            Dictionary of formatted data sheets
        """
        sheets = {}
        
        # Participation data
        if 'participation' in team_data:
            sheets['Participation'] = team_data['participation']
        
        # Driver data
        if 'drivers' in team_data:
            sheets['Drivers'] = team_data['drivers']
        
        # Sentiment data
        if 'sentiment' in team_data:
            sheets['Sentiment'] = team_data['sentiment']
        
        return sheets
    
    def format_org_report_data(self, org_data: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Format organization report data for export
        
        Args:
            org_data: Raw organization report data
            
        Returns:
            Dictionary of formatted data sheets
        """
        sheets = {}
        
        # Overview data
        overview_data = {
            'Total Surveys': len(org_data.get('surveys', [])),
            'Total Teams': len(org_data.get('teams', [])),
            'Total Alerts': len(org_data.get('alerts', [])),
            'Period Start': org_data.get('period', {}).get('start'),
            'Period End': org_data.get('period', {}).get('end')
        }
        sheets['Overview'] = [overview_data]
        
        # Participation data
        if 'participation' in org_data:
            sheets['Participation'] = org_data['participation']
        
        # Driver data
        if 'drivers' in org_data:
            sheets['Drivers'] = org_data['drivers']
        
        # Sentiment data
        if 'sentiment' in org_data:
            sheets['Sentiment'] = org_data['sentiment']
        
        # Alerts data
        if 'alerts' in org_data:
            sheets['Alerts'] = org_data['alerts']
        
        return sheets

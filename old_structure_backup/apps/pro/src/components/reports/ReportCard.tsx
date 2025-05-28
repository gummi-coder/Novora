
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Download, Edit, Trash2, File, FileText, Calendar } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Report {
  id: string;
  name: string;
  type: string;
  source: string;
  dateRange: string;
  created: string;
  scheduled?: string;
  status: string;
  formats: string[];
}

interface ReportCardProps {
  report: Report;
  onDelete: (id: string) => void;
  onDownload: (id: string, format: string) => void;
}

export function ReportCard({ report, onDelete, onDownload }: ReportCardProps) {
  // Status badge color variants
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'complete':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Type icon
  const getTypeIcon = () => {
    switch (report.type.toLowerCase()) {
      case 'overall summary':
        return <File className="h-4 w-4" />;
      case 'department':
        return <FileText className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-2">{report.name}</CardTitle>
          <Badge variant={getStatusBadgeVariant(report.status)}>{report.status}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            {getTypeIcon()}
            <span className="font-medium">{report.type}</span>
          </div>
          
          <div className="text-muted-foreground">
            Source: {report.source}
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{report.dateRange}</span>
          </div>
          
          <div className="text-muted-foreground">
            Created: {report.created}
            {report.scheduled && (
              <div className="text-xs mt-1">Scheduled: {report.scheduled}</div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link to={`/reports/${report.id}`}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Link>
        </Button>
        
        {report.status === 'Complete' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1" 
            onClick={() => report.formats.includes('pdf') && onDownload(report.id, 'pdf')}
            disabled={!report.formats.includes('pdf')}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        )}
        
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link to={`/reports/${report.id}/edit`}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the report
                and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(report.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}

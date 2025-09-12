"""
Employee Management Endpoints
Complete employee and team management functionality
"""
from fastapi import APIRouter, HTTPException, Depends, Query, Path, Body, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
import csv
import io
import pandas as pd

from app.core.database import get_db
from app.api.deps import get_current_user, get_current_admin_user
from app.models.base import User
from app.models.employees import Employee
from app.models.teams import Team
from app.models.orgs import Organization
from app.schemas.employees import EmployeeCreate, EmployeeUpdate, EmployeeResponse, TeamCreate, TeamUpdate, TeamResponse
from app.utils.audit import audit_log
from app.utils.validation import validate_email, validate_phone

router = APIRouter()

# ============================================================================
# EMPLOYEE MANAGEMENT ENDPOINTS
# ============================================================================

@router.get("/employees", response_model=List[EmployeeResponse])
async def get_employees(
    org_id: str = Query(...),
    team_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(100, le=1000),
    offset: int = Query(0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get employees for organization/team with filtering and pagination
    """
    try:
        # Validate access
        if current_user.org_id != org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Build query
        query = db.query(Employee).filter(Employee.org_id == org_id)
        
        # Apply filters
        if team_id:
            query = query.filter(Employee.team_id == team_id)
        if status:
            query = query.filter(Employee.status == status)
        if search:
            search_filter = or_(
                Employee.name.ilike(f"%{search}%"),
                Employee.email.ilike(f"%{search}%"),
                Employee.job_title.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        # Apply pagination
        total = query.count()
        employees = query.offset(offset).limit(limit).all()
        
        return [
            EmployeeResponse(
                id=emp.id,
                org_id=emp.org_id,
                team_id=emp.team_id,
                name=emp.name,
                email=emp.email,
                job_title=emp.job_title,
                status=emp.status,
                created_at=emp.created_at,
                updated_at=emp.updated_at
            )
            for emp in employees
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get employees: {str(e)}")

@router.post("/employees", response_model=EmployeeResponse)
async def create_employee(
    employee_data: EmployeeCreate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Create a new employee
    """
    try:
        # Validate access
        if current_user.org_id != employee_data.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Validate email
        if not validate_email(employee_data.email):
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        # Check if email already exists
        existing_employee = db.query(Employee).filter(
            and_(
                Employee.org_id == employee_data.org_id,
                Employee.email == employee_data.email
            )
        ).first()
        
        if existing_employee:
            raise HTTPException(status_code=409, detail="Employee with this email already exists")
        
        # Validate team exists
        if employee_data.team_id:
            team = db.query(Team).filter(
                and_(
                    Team.id == employee_data.team_id,
                    Team.org_id == employee_data.org_id
                )
            ).first()
            if not team:
                raise HTTPException(status_code=400, detail="Team not found")
        
        # Create employee
        employee = Employee(
            id=str(uuid.uuid4()),
            org_id=employee_data.org_id,
            team_id=employee_data.team_id,
            name=employee_data.name,
            email=employee_data.email,
            job_title=employee_data.job_title,
            status=employee_data.status or "active",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(employee)
        db.commit()
        db.refresh(employee)
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="employee_created",
            resource_type="employee",
            resource_id=employee.id,
            details={"employee_email": employee.email}
        )
        
        return EmployeeResponse(
            id=employee.id,
            org_id=employee.org_id,
            team_id=employee.team_id,
            name=employee.name,
            email=employee.email,
            job_title=employee.job_title,
            status=employee.status,
            created_at=employee.created_at,
            updated_at=employee.updated_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create employee: {str(e)}")

@router.get("/employees/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get employee details
    """
    try:
        # Get employee
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        # Validate access
        if current_user.org_id != employee.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        return EmployeeResponse(
            id=employee.id,
            org_id=employee.org_id,
            team_id=employee.team_id,
            name=employee.name,
            email=employee.email,
            job_title=employee.job_title,
            status=employee.status,
            created_at=employee.created_at,
            updated_at=employee.updated_at
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get employee: {str(e)}")

@router.put("/employees/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: str = Path(...),
    employee_data: EmployeeUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Update employee details
    """
    try:
        # Get employee
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        # Validate access
        if current_user.org_id != employee.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Update fields
        if employee_data.name is not None:
            employee.name = employee_data.name
        if employee_data.email is not None:
            if not validate_email(employee_data.email):
                raise HTTPException(status_code=400, detail="Invalid email format")
            employee.email = employee_data.email
        if employee_data.job_title is not None:
            employee.job_title = employee_data.job_title
        if employee_data.team_id is not None:
            # Validate team exists
            if employee_data.team_id:
                team = db.query(Team).filter(
                    and_(
                        Team.id == employee_data.team_id,
                        Team.org_id == employee.org_id
                    )
                ).first()
                if not team:
                    raise HTTPException(status_code=400, detail="Team not found")
            employee.team_id = employee_data.team_id
        if employee_data.status is not None:
            employee.status = employee_data.status
        
        employee.updated_at = datetime.utcnow()
        db.commit()
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="employee_updated",
            resource_type="employee",
            resource_id=employee_id,
            details={"updated_fields": list(employee_data.dict(exclude_unset=True).keys())}
        )
        
        return EmployeeResponse(
            id=employee.id,
            org_id=employee.org_id,
            team_id=employee.team_id,
            name=employee.name,
            email=employee.email,
            job_title=employee.job_title,
            status=employee.status,
            created_at=employee.created_at,
            updated_at=employee.updated_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update employee: {str(e)}")

@router.delete("/employees/{employee_id}")
async def delete_employee(
    employee_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Delete employee (soft delete)
    """
    try:
        # Get employee
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        # Validate access
        if current_user.org_id != employee.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Soft delete
        employee.status = "inactive"
        employee.updated_at = datetime.utcnow()
        db.commit()
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="employee_deleted",
            resource_type="employee",
            resource_id=employee_id,
            details={"employee_email": employee.email}
        )
        
        return {"message": "Employee deleted successfully", "employee_id": employee_id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete employee: {str(e)}")

@router.post("/employees/import")
async def import_employees(
    org_id: str = Query(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Import employees from CSV/Excel file
    """
    try:
        # Validate access
        if current_user.org_id != org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Read file
        content = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(content))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Use CSV or Excel.")
        
        # Validate required columns
        required_columns = ['name', 'email']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(status_code=400, detail=f"Missing required columns: {missing_columns}")
        
        # Process employees
        employees_created = 0
        employees_updated = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Validate email
                email = row['email'].strip()
                if not validate_email(email):
                    errors.append(f"Row {index + 1}: Invalid email format")
                    continue
                
                # Check if employee exists
                existing_employee = db.query(Employee).filter(
                    and_(
                        Employee.org_id == org_id,
                        Employee.email == email
                    )
                ).first()
                
                if existing_employee:
                    # Update existing employee
                    existing_employee.name = row['name'].strip()
                    if 'job_title' in df.columns:
                        existing_employee.job_title = row['job_title'].strip()
                    if 'team_id' in df.columns:
                        existing_employee.team_id = row['team_id'] if pd.notna(row['team_id']) else None
                    existing_employee.updated_at = datetime.utcnow()
                    employees_updated += 1
                else:
                    # Create new employee
                    employee = Employee(
                        id=str(uuid.uuid4()),
                        org_id=org_id,
                        name=row['name'].strip(),
                        email=email,
                        job_title=row['job_title'].strip() if 'job_title' in df.columns else None,
                        team_id=row['team_id'] if 'team_id' in df.columns and pd.notna(row['team_id']) else None,
                        status="active",
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    db.add(employee)
                    employees_created += 1
                    
            except Exception as e:
                errors.append(f"Row {index + 1}: {str(e)}")
        
        db.commit()
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="employees_imported",
            resource_type="employee",
            resource_id=None,
            details={
                "employees_created": employees_created,
                "employees_updated": employees_updated,
                "errors": len(errors)
            }
        )
        
        return {
            "message": "Employee import completed",
            "employees_created": employees_created,
            "employees_updated": employees_updated,
            "errors": errors
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to import employees: {str(e)}")

# ============================================================================
# TEAM MANAGEMENT ENDPOINTS
# ============================================================================

@router.get("/teams", response_model=List[TeamResponse])
async def get_teams(
    org_id: str = Query(...),
    department_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(100, le=1000),
    offset: int = Query(0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get teams for organization with filtering and pagination
    """
    try:
        # Validate access
        if current_user.org_id != org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Build query
        query = db.query(Team).filter(Team.org_id == org_id)
        
        # Apply filters
        if department_id:
            query = query.filter(Team.department_id == department_id)
        if search:
            search_filter = or_(
                Team.name.ilike(f"%{search}%"),
                Team.description.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        # Apply pagination
        total = query.count()
        teams = query.offset(offset).limit(limit).all()
        
        return [
            TeamResponse(
                id=team.id,
                org_id=team.org_id,
                department_id=team.department_id,
                name=team.name,
                description=team.description,
                size=team.size,
                created_at=team.created_at,
                updated_at=team.updated_at
            )
            for team in teams
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get teams: {str(e)}")

@router.post("/teams", response_model=TeamResponse)
async def create_team(
    team_data: TeamCreate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Create a new team
    """
    try:
        # Validate access
        if current_user.org_id != team_data.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Check if team name already exists
        existing_team = db.query(Team).filter(
            and_(
                Team.org_id == team_data.org_id,
                Team.name == team_data.name
            )
        ).first()
        
        if existing_team:
            raise HTTPException(status_code=409, detail="Team with this name already exists")
        
        # Create team
        team = Team(
            id=str(uuid.uuid4()),
            org_id=team_data.org_id,
            department_id=team_data.department_id,
            name=team_data.name,
            description=team_data.description,
            size=team_data.size or 0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(team)
        db.commit()
        db.refresh(team)
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="team_created",
            resource_type="team",
            resource_id=team.id,
            details={"team_name": team.name}
        )
        
        return TeamResponse(
            id=team.id,
            org_id=team.org_id,
            department_id=team.department_id,
            name=team.name,
            description=team.description,
            size=team.size,
            created_at=team.created_at,
            updated_at=team.updated_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create team: {str(e)}")

@router.get("/teams/{team_id}", response_model=TeamResponse)
async def get_team(
    team_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get team details
    """
    try:
        # Get team
        team = db.query(Team).filter(Team.id == team_id).first()
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")
        
        # Validate access
        if current_user.org_id != team.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        return TeamResponse(
            id=team.id,
            org_id=team.org_id,
            department_id=team.department_id,
            name=team.name,
            description=team.description,
            size=team.size,
            created_at=team.created_at,
            updated_at=team.updated_at
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get team: {str(e)}")

@router.put("/teams/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: str = Path(...),
    team_data: TeamUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Update team details
    """
    try:
        # Get team
        team = db.query(Team).filter(Team.id == team_id).first()
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")
        
        # Validate access
        if current_user.org_id != team.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Update fields
        if team_data.name is not None:
            team.name = team_data.name
        if team_data.description is not None:
            team.description =team_data.description
        if team_data.department_id is not None:
            team.department_id = team_data.department_id
        if team_data.size is not None:
            team.size = team_data.size
        
        team.updated_at = datetime.utcnow()
        db.commit()
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="team_updated",
            resource_type="team",
            resource_id=team_id,
            details={"updated_fields": list(team_data.dict(exclude_unset=True).keys())}
        )
        
        return TeamResponse(
            id=team.id,
            org_id=team.org_id,
            department_id=team.department_id,
            name=team.name,
            description=team.description,
            size=team.size,
            created_at=team.created_at,
            updated_at=team.updated_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update team: {str(e)}")

@router.delete("/teams/{team_id}")
async def delete_team(
    team_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Delete team (soft delete)
    """
    try:
        # Get team
        team = db.query(Team).filter(Team.id == team_id).first()
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")
        
        # Validate access
        if current_user.org_id != team.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Check if team has active employees
        active_employees = db.query(Employee).filter(
            and_(
                Employee.team_id == team_id,
                Employee.status == "active"
            )
        ).count()
        
        if active_employees > 0:
            raise HTTPException(status_code=400, detail=f"Cannot delete team with {active_employees} active employees")
        
        # Soft delete
        team.name = f"{team.name} (Deleted)"
        team.updated_at = datetime.utcnow()
        db.commit()
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="team_deleted",
            resource_type="team",
            resource_id=team_id,
            details={"team_name": team.name}
        )
        
        return {"message": "Team deleted successfully", "team_id": team_id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete team: {str(e)}")

@router.get("/teams/{team_id}/employees")
async def get_team_employees(
    team_id: str = Path(...),
    status: Optional[str] = Query(None),
    limit: int = Query(100, le=1000),
    offset: int = Query(0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get employees for a specific team
    """
    try:
        # Get team
        team = db.query(Team).filter(Team.id == team_id).first()
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")
        
        # Validate access
        if current_user.org_id != team.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Build query
        query = db.query(Employee).filter(Employee.team_id == team_id)
        
        # Apply status filter
        if status:
            query = query.filter(Employee.status == status)
        
        # Apply pagination
        total = query.count()
        employees = query.offset(offset).limit(limit).all()
        
        return {
            "team_id": team_id,
            "team_name": team.name,
            "total_employees": total,
            "employees": [
                EmployeeResponse(
                    id=emp.id,
                    org_id=emp.org_id,
                    team_id=emp.team_id,
                    name=emp.name,
                    email=emp.email,
                    job_title=emp.job_title,
                    status=emp.status,
                    created_at=emp.created_at,
                    updated_at=emp.updated_at
                )
                for emp in employees
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get team employees: {str(e)}")

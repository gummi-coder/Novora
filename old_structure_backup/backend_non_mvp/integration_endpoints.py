"""
Comprehensive Integration Endpoints for External Services
Handles webhooks, third-party integrations, and external API connections
"""
import logging
import json
import hmac
import hashlib
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, Query, Body, Request, Header
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import requests
import aiohttp
import asyncio
import uuid
import secrets
import base64

from app.core.database import get_db
from app.api.deps import get_current_user, get_current_admin_user
from app.models.base import User, Team, Survey
from app.models.advanced import Integration, Webhook, ApiKey
from app.services.audit_service import audit_log
from app.core.edge_case_handler import handle_db_errors, handle_validation, handle_timeout
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

# ============================================================================
# WEBHOOK MANAGEMENT
# ============================================================================

@router.post("/webhooks")
async def create_webhook(
    webhook_data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new webhook for external integrations"""
    try:
        # Validate webhook data
        required_fields = ["name", "url", "events", "org_id"]
        missing_fields = [field for field in required_fields if field not in webhook_data]
        if missing_fields:
            raise HTTPException(status_code=400, detail=f"Missing required fields: {missing_fields}")
        
        # Validate URL
        if not webhook_data["url"].startswith(("http://", "https://")):
            raise HTTPException(status_code=400, detail="Invalid webhook URL")
        
        # Check if webhook already exists
        existing_webhook = db.query(Webhook).filter(
            and_(
                Webhook.org_id == webhook_data["org_id"],
                Webhook.url == webhook_data["url"]
            )
        ).first()
        
        if existing_webhook:
            raise HTTPException(status_code=409, detail="Webhook with this URL already exists")
        
        # Create webhook
        webhook = Webhook(
            id=str(uuid.uuid4()),
            org_id=webhook_data["org_id"],
            name=webhook_data["name"],
            url=webhook_data["url"],
            events=webhook_data["events"],
            secret=webhook_data.get("secret") or generate_webhook_secret(),
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(webhook)
        db.commit()
        db.refresh(webhook)
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="webhook_created",
            resource_type="webhook",
            resource_id=webhook.id,
            details={
                "webhook_name": webhook.name,
                "webhook_url": webhook.url,
                "events": webhook.events
            }
        )
        
        return {
            "message": "Webhook created successfully",
            "webhook_id": webhook.id,
            "name": webhook.name,
            "url": webhook.url,
            "events": webhook.events,
            "secret": webhook.secret
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create webhook: {str(e)}")

@router.get("/webhooks")
async def list_webhooks(
    org_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all webhooks for an organization"""
    try:
        webhooks = db.query(Webhook).filter(
            and_(
                Webhook.org_id == org_id,
                Webhook.is_active == True
            )
        ).all()
        
        return {
            "webhooks": [
                {
                    "id": webhook.id,
                    "name": webhook.name,
                    "url": webhook.url,
                    "events": webhook.events,
                    "is_active": webhook.is_active,
                    "created_at": webhook.created_at.isoformat(),
                    "last_triggered": webhook.last_triggered.isoformat() if webhook.last_triggered else None
                }
                for webhook in webhooks
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list webhooks: {str(e)}")

@router.put("/webhooks/{webhook_id}")
async def update_webhook(
    webhook_id: str,
    webhook_data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update webhook configuration"""
    try:
        webhook = db.query(Webhook).filter(Webhook.id == webhook_id).first()
        if not webhook:
            raise HTTPException(status_code=404, detail="Webhook not found")
        
        # Update fields
        if "name" in webhook_data:
            webhook.name = webhook_data["name"]
        if "url" in webhook_data:
            webhook.url = webhook_data["url"]
        if "events" in webhook_data:
            webhook.events = webhook_data["events"]
        if "is_active" in webhook_data:
            webhook.is_active = webhook_data["is_active"]
        
        webhook.updated_at = datetime.utcnow()
        db.commit()
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="webhook_updated",
            resource_type="webhook",
            resource_id=webhook.id,
            details=webhook_data
        )
        
        return {
            "message": "Webhook updated successfully",
            "webhook_id": webhook.id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update webhook: {str(e)}")

@router.delete("/webhooks/{webhook_id}")
async def delete_webhook(
    webhook_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a webhook"""
    try:
        webhook = db.query(Webhook).filter(Webhook.id == webhook_id).first()
        if not webhook:
            raise HTTPException(status_code=404, detail="Webhook not found")
        
        # Soft delete
        webhook.is_active = False
        webhook.updated_at = datetime.utcnow()
        db.commit()
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="webhook_deleted",
            resource_type="webhook",
            resource_id=webhook.id
        )
        
        return {"message": "Webhook deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete webhook: {str(e)}")

# ============================================================================
# THIRD-PARTY INTEGRATIONS
# ============================================================================

@router.post("/integrations/slack/connect")
async def connect_slack_integration(
    org_id: str = Query(...),
    code: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Connect Slack integration using OAuth"""
    try:
        # Exchange code for access token
        token_response = await exchange_slack_code(code)
        
        if not token_response.get("ok"):
            raise HTTPException(status_code=400, detail="Failed to authenticate with Slack")
        
        # Store integration
        integration = Integration(
            id=str(uuid.uuid4()),
            org_id=org_id,
            type="slack",
            status="connected",
            config_json={
                "access_token": token_response["access_token"],
                "team_id": token_response["team"]["id"],
                "team_name": token_response["team"]["name"],
                "bot_user_id": token_response["bot_user_id"],
                "scope": token_response["scope"]
            },
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(integration)
        db.commit()
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="slack_integration_connected",
            resource_type="integration",
            resource_id=integration.id,
            details={"team_name": token_response["team"]["name"]}
        )
        
        return {
            "message": "Slack integration connected successfully",
            "team_name": token_response["team"]["name"],
            "integration_id": integration.id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to connect Slack: {str(e)}")

@router.post("/integrations/teams/connect")
async def connect_teams_integration(
    org_id: str = Query(...),
    code: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Connect Microsoft Teams integration using OAuth"""
    try:
        # Exchange code for access token
        token_response = await exchange_teams_code(code)
        
        # Store integration
        integration = Integration(
            id=str(uuid.uuid4()),
            org_id=org_id,
            type="teams",
            status="connected",
            config_json={
                "access_token": token_response["access_token"],
                "tenant_id": token_response["tenant_id"],
                "scope": token_response["scope"]
            },
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(integration)
        db.commit()
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="teams_integration_connected",
            resource_type="integration",
            resource_id=integration.id
        )
        
        return {
            "message": "Microsoft Teams integration connected successfully",
            "integration_id": integration.id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to connect Teams: {str(e)}")

@router.post("/integrations/zoom/connect")
async def connect_zoom_integration(
    org_id: str = Query(...),
    code: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Connect Zoom integration using OAuth"""
    try:
        # Exchange code for access token
        token_response = await exchange_zoom_code(code)
        
        # Store integration
        integration = Integration(
            id=str(uuid.uuid4()),
            org_id=org_id,
            type="zoom",
            status="connected",
            config_json={
                "access_token": token_response["access_token"],
                "refresh_token": token_response["refresh_token"],
                "expires_in": token_response["expires_in"],
                "scope": token_response["scope"]
            },
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(integration)
        db.commit()
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="zoom_integration_connected",
            resource_type="integration",
            resource_id=integration.id
        )
        
        return {
            "message": "Zoom integration connected successfully",
            "integration_id": integration.id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to connect Zoom: {str(e)}")

@router.get("/integrations")
async def list_integrations(
    org_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all integrations for an organization"""
    try:
        integrations = db.query(Integration).filter(
            and_(
                Integration.org_id == org_id,
                Integration.status.in_(["connected", "pending"])
            )
        ).all()
        
        return {
            "integrations": [
                {
                    "id": integration.id,
                    "type": integration.type,
                    "status": integration.status,
                    "created_at": integration.created_at.isoformat(),
                    "updated_at": integration.updated_at.isoformat()
                }
                for integration in integrations
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list integrations: {str(e)}")

@router.delete("/integrations/{integration_id}")
async def disconnect_integration(
    integration_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Disconnect an integration"""
    try:
        integration = db.query(Integration).filter(Integration.id == integration_id).first()
        if not integration:
            raise HTTPException(status_code=404, detail="Integration not found")
        
        # Update status
        integration.status = "disconnected"
        integration.updated_at = datetime.utcnow()
        db.commit()
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="integration_disconnected",
            resource_type="integration",
            resource_id=integration.id
        )
        
        return {"message": "Integration disconnected successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to disconnect integration: {str(e)}")

# ============================================================================
# API KEY MANAGEMENT
# ============================================================================

@router.post("/api-keys")
async def create_api_key(
    api_key_data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new API key for external integrations"""
    try:
        # Validate API key data
        required_fields = ["name", "org_id", "scopes"]
        missing_fields = [field for field in required_fields if field not in api_key_data]
        if missing_fields:
            raise HTTPException(status_code=400, detail=f"Missing required fields: {missing_fields}")
        
        # Generate API key
        api_key_value = generate_api_key()
        api_key_hash = hash_api_key(api_key_value)
        
        # Create API key record
        api_key = ApiKey(
            id=str(uuid.uuid4()),
            org_id=api_key_data["org_id"],
            name=api_key_data["name"],
            key_hash=api_key_hash,
            scopes=api_key_data["scopes"],
            is_active=True,
            expires_at=datetime.utcnow() + timedelta(days=365),  # 1 year expiry
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(api_key)
        db.commit()
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="api_key_created",
            resource_type="api_key",
            resource_id=api_key.id,
            details={"api_key_name": api_key.name}
        )
        
        return {
            "message": "API key created successfully",
            "api_key_id": api_key.id,
            "api_key": api_key_value,  # Only returned once
            "expires_at": api_key.expires_at.isoformat()
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create API key: {str(e)}")

@router.get("/api-keys")
async def list_api_keys(
    org_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all API keys for an organization"""
    try:
        api_keys = db.query(ApiKey).filter(
            and_(
                ApiKey.org_id == org_id,
                ApiKey.is_active == True
            )
        ).all()
        
        return {
            "api_keys": [
                {
                    "id": api_key.id,
                    "name": api_key.name,
                    "scopes": api_key.scopes,
                    "is_active": api_key.is_active,
                    "created_at": api_key.created_at.isoformat(),
                    "expires_at": api_key.expires_at.isoformat(),
                    "last_used": api_key.last_used.isoformat() if api_key.last_used else None
                }
                for api_key in api_keys
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list API keys: {str(e)}")

@router.delete("/api-keys/{api_key_id}")
async def revoke_api_key(
    api_key_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Revoke an API key"""
    try:
        api_key = db.query(ApiKey).filter(ApiKey.id == api_key_id).first()
        if not api_key:
            raise HTTPException(status_code=404, detail="API key not found")
        
        # Soft delete
        api_key.is_active = False
        api_key.updated_at = datetime.utcnow()
        db.commit()
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="api_key_revoked",
            resource_type="api_key",
            resource_id=api_key.id
        )
        
        return {"message": "API key revoked successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to revoke API key: {str(e)}")

# ============================================================================
# WEBHOOK DELIVERY
# ============================================================================

@handle_timeout
async def deliver_webhook(webhook: Webhook, event: str, payload: Dict[str, Any]) -> bool:
    """Deliver webhook to external service"""
    try:
        # Prepare webhook payload
        webhook_payload = {
            "event": event,
            "timestamp": datetime.utcnow().isoformat(),
            "data": payload
        }
        
        # Add signature if secret is configured
        headers = {"Content-Type": "application/json"}
        if webhook.secret:
            signature = generate_webhook_signature(webhook_payload, webhook.secret)
            headers["X-Webhook-Signature"] = signature
        
        # Send webhook
        async with aiohttp.ClientSession() as session:
            async with session.post(
                webhook.url,
                json=webhook_payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                success = response.status in [200, 201, 202]
                
                # Update webhook statistics
                webhook.last_triggered = datetime.utcnow()
                webhook.success_count = (webhook.success_count or 0) + (1 if success else 0)
                webhook.failure_count = (webhook.failure_count or 0) + (0 if success else 1)
                
                return success
                
    except Exception as e:
        logger.error(f"Webhook delivery failed: {str(e)}")
        return False

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def generate_webhook_secret() -> str:
    """Generate a secure webhook secret"""
    return secrets.token_urlsafe(32)

def generate_api_key() -> str:
    """Generate a secure API key"""
    return f"sk_{secrets.token_urlsafe(32)}"

def hash_api_key(api_key: str) -> str:
    """Hash API key for storage"""
    return hashlib.sha256(api_key.encode()).hexdigest()

def generate_webhook_signature(payload: Dict[str, Any], secret: str) -> str:
    """Generate webhook signature"""
    payload_str = json.dumps(payload, sort_keys=True)
    signature = hmac.new(
        secret.encode(),
        payload_str.encode(),
        hashlib.sha256
    ).hexdigest()
    return f"sha256={signature}"

@handle_timeout
async def exchange_slack_code(code: str) -> Dict[str, Any]:
    """Exchange Slack OAuth code for access token"""
    async with aiohttp.ClientSession() as session:
        async with session.post(
            "https://slack.com/api/oauth.v2.access",
            data={
                "client_id": settings.SLACK_CLIENT_ID,
                "client_secret": settings.SLACK_CLIENT_SECRET,
                "code": code
            }
        ) as response:
            return await response.json()

@handle_timeout
async def exchange_teams_code(code: str) -> Dict[str, Any]:
    """Exchange Microsoft Teams OAuth code for access token"""
    async with aiohttp.ClientSession() as session:
        async with session.post(
            "https://login.microsoftonline.com/common/oauth2/v2.0/token",
            data={
                "client_id": settings.TEAMS_CLIENT_ID,
                "client_secret": settings.TEAMS_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": settings.TEAMS_REDIRECT_URI
            }
        ) as response:
            return await response.json()

@handle_timeout
async def exchange_zoom_code(code: str) -> Dict[str, Any]:
    """Exchange Zoom OAuth code for access token"""
    async with aiohttp.ClientSession() as session:
        async with session.post(
            "https://zoom.us/oauth/token",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.ZOOM_REDIRECT_URI
            },
            headers={
                "Authorization": f"Basic {base64.b64encode(f'{settings.ZOOM_CLIENT_ID}:{settings.ZOOM_CLIENT_SECRET}'.encode()).decode()}"
            }
        ) as response:
            return await response.json()

# ============================================================================
# WEBHOOK EVENT TRIGGERS
# ============================================================================

async def trigger_webhook_event(
    org_id: str,
    event: str,
    payload: Dict[str, Any],
    db: Session
) -> None:
    """Trigger webhook events for an organization"""
    try:
        # Get active webhooks for this org and event
        webhooks = db.query(Webhook).filter(
            and_(
                Webhook.org_id == org_id,
                Webhook.is_active == True,
                Webhook.events.contains([event])
            )
        ).all()
        
        # Deliver to each webhook
        for webhook in webhooks:
            success = await deliver_webhook(webhook, event, payload)
            
            if not success:
                logger.warning(f"Failed to deliver webhook {webhook.id} for event {event}")
        
    except Exception as e:
        logger.error(f"Error triggering webhook events: {str(e)}")

# ============================================================================
# INTEGRATION ACTIONS
# ============================================================================

async def send_slack_message(
    org_id: str,
    channel: str,
    message: str,
    db: Session
) -> bool:
    """Send message to Slack channel"""
    try:
        # Get Slack integration
        integration = db.query(Integration).filter(
            and_(
                Integration.org_id == org_id,
                Integration.type == "slack",
                Integration.status == "connected"
            )
        ).first()
        
        if not integration:
            return False
        
        access_token = integration.config_json.get("access_token")
        
        # Send message
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://slack.com/api/chat.postMessage",
                headers={"Authorization": f"Bearer {access_token}"},
                json={
                    "channel": channel,
                    "text": message
                }
            ) as response:
                result = await response.json()
                return result.get("ok", False)
                
    except Exception as e:
        logger.error(f"Error sending Slack message: {str(e)}")
        return False

async def send_teams_message(
    org_id: str,
    channel_id: str,
    message: str,
    db: Session
) -> bool:
    """Send message to Teams channel"""
    try:
        # Get Teams integration
        integration = db.query(Integration).filter(
            and_(
                Integration.org_id == org_id,
                Integration.type == "teams",
                Integration.status == "connected"
            )
        ).first()
        
        if not integration:
            return False
        
        access_token = integration.config_json.get("access_token")
        
        # Send message
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"https://graph.microsoft.com/v1.0/teams/{channel_id}/messages",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                },
                json={
                    "body": {
                        "content": message
                    }
                }
            ) as response:
                return response.status in [200, 201]
                
    except Exception as e:
        logger.error(f"Error sending Teams message: {str(e)}")
        return False

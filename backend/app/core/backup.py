"""
Backup and Recovery System for Production
"""
import os
import shutil
import subprocess
import zipfile
import json
import hashlib
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class BackupManager:
    """Backup and recovery management system"""
    
    def __init__(self):
        self.backup_dir = Path("backups")
        self.backup_dir.mkdir(exist_ok=True)
        
        # Backup configuration
        self.max_backups = int(os.getenv("MAX_BACKUPS", "30"))
        self.backup_retention_days = int(os.getenv("BACKUP_RETENTION_DAYS", "30"))
        self.enable_compression = os.getenv("ENABLE_BACKUP_COMPRESSION", "true").lower() == "true"
        self.backup_schedule = os.getenv("BACKUP_SCHEDULE", "daily")  # daily, weekly, monthly
        
    def create_database_backup(self) -> Tuple[bool, str]:
        """Create database backup"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_name = f"database_backup_{timestamp}"
            backup_path = self.backup_dir / backup_name
            
            if settings.is_production:
                # PostgreSQL backup
                return self._create_postgres_backup(backup_name)
            else:
                # SQLite backup
                return self._create_sqlite_backup(backup_name)
                
        except Exception as e:
            logger.error(f"Database backup failed: {e}")
            return False, f"Database backup failed: {str(e)}"
    
    def _create_postgres_backup(self, backup_name: str) -> Tuple[bool, str]:
        """Create PostgreSQL backup"""
        try:
            backup_file = self.backup_dir / f"{backup_name}.sql"
            
            # Build pg_dump command
            cmd = [
                "pg_dump",
                f"--host={settings.POSTGRES_HOST}",
                f"--port={settings.POSTGRES_PORT}",
                f"--username={settings.POSTGRES_USER}",
                f"--dbname={settings.POSTGRES_DB}",
                "--no-password",
                "--verbose",
                "--clean",
                "--no-owner",
                "--no-privileges",
                f"--file={backup_file}"
            ]
            
            # Set password environment variable
            env = os.environ.copy()
            env["PGPASSWORD"] = settings.POSTGRES_PASSWORD
            
            # Execute backup
            result = subprocess.run(
                cmd,
                env=env,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes timeout
            )
            
            if result.returncode == 0:
                # Compress if enabled
                if self.enable_compression:
                    compressed_file = self._compress_file(backup_file)
                    backup_file.unlink()  # Remove uncompressed file
                    backup_file = compressed_file
                
                # Create backup metadata
                self._create_backup_metadata(backup_file, "database")
                
                logger.info(f"PostgreSQL backup created: {backup_file}")
                return True, f"PostgreSQL backup created: {backup_file.name}"
            else:
                logger.error(f"PostgreSQL backup failed: {result.stderr}")
                return False, f"PostgreSQL backup failed: {result.stderr}"
                
        except subprocess.TimeoutExpired:
            return False, "PostgreSQL backup timed out"
        except Exception as e:
            logger.error(f"PostgreSQL backup error: {e}")
            return False, f"PostgreSQL backup error: {str(e)}"
    
    def _create_sqlite_backup(self, backup_name: str) -> Tuple[bool, str]:
        """Create SQLite backup"""
        try:
            db_file = Path("novora.db")
            if not db_file.exists():
                return False, "SQLite database file not found"
            
            backup_file = self.backup_dir / f"{backup_name}.db"
            
            # Copy database file
            shutil.copy2(db_file, backup_file)
            
            # Compress if enabled
            if self.enable_compression:
                compressed_file = self._compress_file(backup_file)
                backup_file.unlink()  # Remove uncompressed file
                backup_file = compressed_file
            
            # Create backup metadata
            self._create_backup_metadata(backup_file, "database")
            
            logger.info(f"SQLite backup created: {backup_file}")
            return True, f"SQLite backup created: {backup_file.name}"
            
        except Exception as e:
            logger.error(f"SQLite backup error: {e}")
            return False, f"SQLite backup error: {str(e)}"
    
    def create_file_backup(self) -> Tuple[bool, str]:
        """Create file system backup"""
        try:
            timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
            backup_name = f"files_backup_{timestamp}"
            backup_path = self.backup_dir / backup_name
            
            # Create backup directory
            backup_path.mkdir(exist_ok=True)
            
            # Backup important directories
            directories_to_backup = [
                "uploads",
                "logs",
                "certs"
            ]
            
            for directory in directories_to_backup:
                dir_path = Path(directory)
                if dir_path.exists():
                    shutil.copytree(dir_path, backup_path / directory, dirs_exist_ok=True)
            
            # Create archive
            archive_file = self.backup_dir / f"{backup_name}.zip"
            with zipfile.ZipFile(archive_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for file_path in backup_path.rglob('*'):
                    if file_path.is_file():
                        arcname = file_path.relative_to(backup_path)
                        zipf.write(str(file_path), str(arcname))
            
            # Remove temporary directory
            shutil.rmtree(backup_path)
            
            # Create backup metadata
            self._create_backup_metadata(archive_file, "files")
            
            logger.info(f"File backup created: {archive_file}")
            return True, f"File backup created: {archive_file.name}"
            
        except Exception as e:
            logger.error(f"File backup failed: {e}")
            return False, f"File backup failed: {str(e)}"
    
    def create_full_backup(self) -> Tuple[bool, str]:
        """Create full system backup"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_name = f"full_backup_{timestamp}"
            backup_path = self.backup_dir / backup_name
            
            # Create backup directory
            backup_path.mkdir(exist_ok=True)
            
            # Create database backup
            db_success, db_message = self.create_database_backup()
            if not db_success:
                return False, f"Full backup failed - Database: {db_message}"
            
            # Create file backup
            files_success, files_message = self.create_file_backup()
            if not files_success:
                return False, f"Full backup failed - Files: {files_message}"
            
            # Create backup manifest
            manifest = {
                "backup_type": "full",
                "timestamp": datetime.now().isoformat(),
                "environment": settings.ENVIRONMENT,
                "version": settings.VERSION,
                "components": ["database", "files"],
                "checksum": self._calculate_backup_checksum(backup_path)
            }
            
            manifest_file = backup_path / "manifest.json"
            with open(manifest_file, 'w') as f:
                json.dump(manifest, f, indent=2)
            
            logger.info(f"Full backup created: {backup_path}")
            return True, f"Full backup created: {backup_path.name}"
            
        except Exception as e:
            logger.error(f"Full backup failed: {e}")
            return False, f"Full backup failed: {str(e)}"
    
    def restore_database_backup(self, backup_file: str) -> Tuple[bool, str]:
        """Restore database from backup"""
        try:
            backup_path = self.backup_dir / backup_file
            
            if not backup_path.exists():
                return False, f"Backup file not found: {backup_file}"
            
            # Decompress if needed
            if backup_path.suffix in ['.gz', '.zip']:
                backup_path = self._decompress_file(backup_path)
            
            if settings.is_production:
                return self._restore_postgres_backup(backup_path)
            else:
                return self._restore_sqlite_backup(backup_path)
                
        except Exception as e:
            logger.error(f"Database restore failed: {e}")
            return False, f"Database restore failed: {str(e)}"
    
    def _restore_postgres_backup(self, backup_path: Path) -> Tuple[bool, str]:
        """Restore PostgreSQL backup"""
        try:
            # Build psql command
            cmd = [
                "psql",
                f"--host={settings.POSTGRES_HOST}",
                f"--port={settings.POSTGRES_PORT}",
                f"--username={settings.POSTGRES_USER}",
                f"--dbname={settings.POSTGRES_DB}",
                "--no-password",
                "--verbose",
                f"--file={backup_path}"
            ]
            
            # Set password environment variable
            env = os.environ.copy()
            env["PGPASSWORD"] = settings.POSTGRES_PASSWORD
            
            # Execute restore
            result = subprocess.run(
                cmd,
                env=env,
                capture_output=True,
                text=True,
                timeout=600  # 10 minutes timeout
            )
            
            if result.returncode == 0:
                logger.info(f"PostgreSQL restore completed: {backup_path}")
                return True, f"PostgreSQL restore completed: {backup_path.name}"
            else:
                logger.error(f"PostgreSQL restore failed: {result.stderr}")
                return False, f"PostgreSQL restore failed: {result.stderr}"
                
        except subprocess.TimeoutExpired:
            return False, "PostgreSQL restore timed out"
        except Exception as e:
            return False, f"PostgreSQL restore error: {str(e)}"
    
    def _restore_sqlite_backup(self, backup_path: Path) -> Tuple[bool, str]:
        """Restore SQLite backup"""
        try:
            # Stop application if running
            # This is a simplified version - in production, you'd want proper coordination
            
            # Backup current database
            current_db = Path("novora.db")
            if current_db.exists():
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                current_backup = Path(f"novora.db.backup_{timestamp}")
                shutil.copy2(current_db, current_backup)
            
            # Restore from backup
            shutil.copy2(backup_path, current_db)
            
            logger.info(f"SQLite restore completed: {backup_path}")
            return True, f"SQLite restore completed: {backup_path.name}"
            
        except Exception as e:
            return False, f"SQLite restore error: {str(e)}"
    
    def list_backups(self) -> List[Dict[str, any]]:
        """List all available backups"""
        backups = []
        
        for backup_file in self.backup_dir.glob("*"):
            if backup_file.is_file():
                try:
                    # Get file info
                    stat = backup_file.stat()
                    
                    # Try to read metadata
                    metadata = self._read_backup_metadata(backup_file)
                    
                    backup_info = {
                        "name": backup_file.name,
                        "size": stat.st_size,
                        "created": datetime.fromtimestamp(stat.st_ctime, tz=timezone.utc).isoformat(),
                        "modified": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
                        "type": metadata.get("type", "unknown"),
                        "checksum": metadata.get("checksum", ""),
                        "compressed": backup_file.suffix in ['.gz', '.zip']
                    }
                    
                    backups.append(backup_info)
                    
                except Exception as e:
                    logger.warning(f"Could not read backup info for {backup_file}: {e}")
        
        # Sort by creation time (newest first)
        backups.sort(key=lambda x: x["created"], reverse=True)
        return backups
    
    def cleanup_old_backups(self) -> Tuple[int, str]:
        """Clean up old backups based on retention policy"""
        try:
            backups = self.list_backups()
            cutoff_date = datetime.now(timezone.utc) - timedelta(days=self.backup_retention_days)
            
            deleted_count = 0
            for backup in backups:
                backup_date = datetime.fromisoformat(backup["created"])
                if backup_date < cutoff_date:
                    backup_file = self.backup_dir / backup["name"]
                    if backup_file.exists():
                        backup_file.unlink()
                        deleted_count += 1
                        logger.info(f"Deleted old backup: {backup['name']}")
            
            return deleted_count, f"Deleted {deleted_count} old backups"
            
        except Exception as e:
            logger.error(f"Backup cleanup failed: {e}")
            return 0, f"Backup cleanup failed: {str(e)}"
    
    def _compress_file(self, file_path: Path) -> Path:
        """Compress a file using gzip"""
        import gzip
        
        compressed_path = file_path.with_suffix(file_path.suffix + '.gz')
        with open(file_path, 'rb') as f_in:
            with gzip.open(compressed_path, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
        
        return compressed_path
    
    def _decompress_file(self, file_path: Path) -> Path:
        """Decompress a gzipped file"""
        import gzip
        
        if file_path.suffix == '.gz':
            decompressed_path = file_path.with_suffix('')
            with gzip.open(file_path, 'rb') as f_in:
                with open(decompressed_path, 'wb') as f_out:
                    shutil.copyfileobj(f_in, f_out)
            return decompressed_path
        else:
            return file_path
    
    def _create_backup_metadata(self, backup_file: Path, backup_type: str):
        """Create metadata for backup file"""
        metadata = {
            "type": backup_type,
            "timestamp": datetime.now().isoformat(),
            "environment": settings.ENVIRONMENT,
            "version": settings.VERSION,
            "checksum": self._calculate_file_checksum(backup_file),
            "size": backup_file.stat().st_size
        }
        
        metadata_file = backup_file.with_suffix('.json')
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
    
    def _read_backup_metadata(self, backup_file: Path) -> Dict[str, any]:
        """Read metadata for backup file"""
        metadata_file = backup_file.with_suffix('.json')
        if metadata_file.exists():
            with open(metadata_file, 'r') as f:
                return json.load(f)
        return {}
    
    def _calculate_file_checksum(self, file_path: Path) -> str:
        """Calculate SHA256 checksum of a file"""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                sha256_hash.update(chunk)
        return sha256_hash.hexdigest()
    
    def _calculate_backup_checksum(self, backup_path: Path) -> str:
        """Calculate checksum for entire backup directory"""
        sha256_hash = hashlib.sha256()
        
        for file_path in sorted(backup_path.rglob('*')):
            if file_path.is_file():
                with open(file_path, "rb") as f:
                    for chunk in iter(lambda: f.read(4096), b""):
                        sha256_hash.update(chunk)
        
        return sha256_hash.hexdigest()
    
    def verify_backup_integrity(self, backup_file: str) -> Tuple[bool, str]:
        """Verify backup file integrity"""
        try:
            backup_path = self.backup_dir / backup_file
            if not backup_path.exists():
                return False, f"Backup file not found: {backup_file}"
            
            metadata = self._read_backup_metadata(backup_path)
            
            if not metadata:
                return False, "No metadata found for backup"
            
            expected_checksum = metadata.get("checksum", "")
            if not expected_checksum:
                return False, "No checksum found in metadata"
            
            actual_checksum = self._calculate_file_checksum(backup_path)
            
            if actual_checksum == expected_checksum:
                return True, "Backup integrity verified"
            else:
                return False, "Backup integrity check failed - checksum mismatch"
                
        except Exception as e:
            logger.error(f"Backup integrity check failed: {e}")
            return False, f"Backup integrity check failed: {str(e)}"

# Global backup manager
backup_manager = BackupManager()

import os
import time
import logging
from datetime import datetime, timedelta
from pathlib import Path

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('cleanup.log'),
        logging.StreamHandler()
    ]
)

def get_file_creation_time(file_path):
    """Get file creation time, fallback to modification time if creation time is not available"""
    try:
        # Try to get creation time
        creation_time = os.path.getctime(file_path)
        return datetime.fromtimestamp(creation_time)
    except Exception as e:
        logging.warning(f"Could not get creation time for {file_path.name}, using modification time: {str(e)}")
        return datetime.fromtimestamp(os.path.getmtime(file_path))

def cleanup_old_files(directory, max_age_minutes=30):
    """
    Clean up files older than max_age_minutes in the specified directory.
    
    Args:
        directory (str): Path to the directory to clean
        max_age_minutes (int): Maximum age of files in minutes before deletion
    """
    uploads_dir = Path(directory)
    if not uploads_dir.exists():
        logging.error(f"Directory {directory} does not exist")
        return

    current_time = datetime.now()
    max_age = timedelta(minutes=max_age_minutes)
    
    try:
        # First, count total files
        total_files = len(list(uploads_dir.glob('*')))
        if total_files == 0:
            logging.info("No files found in the uploads directory")
            return
            
        logging.info(f"Found {total_files} files to check")
        
        for file_path in uploads_dir.glob('*'):
            if file_path.is_file():
                try:
                    # Get file's creation time
                    file_time = get_file_creation_time(file_path)
                    file_age = current_time - file_time
                    # Only delete if file is definitely older than 30 minutes
                    if file_age > max_age:
                        file_path.unlink()  # Delete the file
                        logging.info(f"Deleted old file: {file_path.name}")
                        
                except Exception as e:
                    logging.error(f"Error processing {file_path.name}: {str(e)}")
                    
    except Exception as e:
        logging.error(f"Error during cleanup: {str(e)}")

if __name__ == "__main__":
    uploads_dir = "public/uploads"
    logging.info("Starting cleanup process...")
    cleanup_old_files(uploads_dir)
    logging.info("Cleanup process completed")
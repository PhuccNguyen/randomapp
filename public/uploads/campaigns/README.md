# Campaign Images Upload Directory

This directory stores uploaded campaign item images.

- Images are uploaded via `/api/upload` endpoint
- Files are named: `{campaignId}_{itemId}_{timestamp}.{ext}`
- Supported formats: JPG, PNG, GIF, WebP
- Max file size: 5MB per image

**Note:** This directory is gitignored. Uploaded files are not committed to version control.

Backup and Restore Guide

This guide provides a clear, reliable workflow for backing up and restoring your project files using Git. It is designed to prevent data loss and ensure that every page can be safely restored at any time.

1. Backing Up Your Work

Commit After Completing Each Page

Open the Source Control panel in your editor.

Stage the changed files.

Commit with a descriptive message such as:

Home page restored and verified

This creates a permanent record of the file in your Git history.

Create a Checkpoint Branch

Before starting major changes, create a checkpoint branch:

git checkout -b checkpoint-home-finished

This branch serves as a snapshot of the working state.

Push to Remote Repository (Optional)

Push your checkpoint branch to a remote repository:

git push -u origin checkpoint-home-finished

This provides an off-machine backup.

2. Restoring Files

Using Source Control

Open the Source Control panel.

Select the file you want to restore.

Review the diff: red indicates removed content, green indicates added content.

If the green version is correct, stage and commit it.

Restoring from File History

Right-click the file and select Open File History.

Choose the version you want to restore.

Restore and commit the file.

3. Full Repository Recovery

Create a Restore Branch

If the repository becomes corrupted, create a restore branch:

git checkout -b restore

Restore Files Individually

Use file history to restore each file.

Commit each restored file to preserve the recovery.

4. Recommended Workflow

After Completing a Page

Commit the changes.

Create a checkpoint branch.

Continue working.

If Issues Arise

Switch to the checkpoint branch.

Copy the working files.

Paste them into your main branch.

Commit and continue.

This workflow ensures that your project remains safe and recoverable at all times.
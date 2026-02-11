# Admin Panel Security

The Admin Panel has been moved to this `secure_admin` folder to prevent accidental deployment to the public website.

## How to Access
To manage the application:
1.  Open the `admin.html` file in your browser locally (double-click it).
2.  Or serve it locally using a simple HTTP server.

## Security Note
-   The public `www` folder does **not** contain these files.
-   When deploying to Netlify, ensure you publish the `www` folder.
-   **IMPORTANT**: Run the `security.sql` script in your Supabase SQL Editor to enable Row Level Security (RLS). This prevents unauthorized users from modifying the database, even if they find your API keys.

## Deployment
The `netlify.toml` file in the root directory is configured to publish the `www` folder and ignore this directory.

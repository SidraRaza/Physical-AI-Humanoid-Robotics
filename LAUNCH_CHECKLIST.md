# Production Launch Checklist

This checklist outlines the essential steps to ensure a smooth and successful production deployment for the 'my-ai-textbook' project.

## Frontend (Docusaurus) Deployment

- [ ] **GitHub Pages Configuration:** Verify GitHub Pages is enabled for the `main` branch (or `gh-pages` branch if using the old method) and pointing to the `frontend/build` directory.
- [ ] **Custom Domain (Optional):** If a custom domain is used, ensure DNS records (CNAME, A records) are correctly configured and propagated.
- [ ] **URL and Base URL:** Confirm `docusaurus.config.ts` has the correct `url` (`https://sidraraza.github.io`) and `baseUrl` (`/my-ai-textbook/`).
- [ ] **Build Verification:** Manually trigger a Docusaurus build (`npm run build` in `frontend/`) and inspect the `frontend/build` output for any errors or missing assets.
- [ ] **Broken Link Check:** Run Docusaurus's built-in broken link checker (`npm run build` will do this automatically) and address any reported issues.
- [ ] **Mobile Responsiveness:** Test the deployed site on various mobile devices and screen sizes to ensure proper rendering and responsiveness.
- [ ] **Browser Compatibility:** Verify functionality and display across different web browsers (Chrome, Firefox, Safari, Edge).
- [ ] **Accessibility (A11y) Review:** Conduct a basic accessibility review to ensure compliance with relevant guidelines.

## Backend (FastAPI) Deployment

- [ ] **Deployment Platform Configuration:** Set up the chosen deployment platform (Railway/Render) with the `backend/Dockerfile`.
- [ ] **Environment Variables:** Ensure `FRONTEND_URL` is correctly configured on the deployment platform to `https://sidraraza.github.io/my-ai-textbook`.
- [ ] **Health Check Endpoint:** Verify the `/health` endpoint (`https://<your-backend-url>/health`) returns a `200 OK` status and the expected response (`{"status": "ok", "message": "Backend is healthy"}`).
- [ ] **Database Connection (if applicable):** If a database is used, confirm connection strings and credentials are securely configured as environment variables on the deployment platform.
- [ ] **API Endpoint Testing:** Use tools like Postman or curl to test critical backend API endpoints.
- [ ] **Error Logging and Monitoring:** Set up logging and monitoring for the backend application to capture errors and performance metrics.

## General Deployment Considerations

- [ ] **SSL/TLS Certificates:** Confirm SSL/TLS certificates are correctly configured for both frontend and backend domains to ensure secure communication.
- [ ] **Performance Testing:** Conduct basic load testing or performance monitoring to identify any bottlenecks.
- [ ] **Security Scan:** Run a basic security scan on both frontend and backend to identify common vulnerabilities.
- [ ] **Backup Strategy:** Establish a backup strategy for critical data and configurations.
- [ ] **Rollback Plan:** Document a clear rollback plan in case of deployment issues.
- [ ] **Documentation Update:** Update any relevant documentation (e.g., README.md, deployment guide) with deployment instructions and important notes.

## Post-Launch

- [ ] **Monitor Application Logs:** Continuously monitor application logs for unexpected errors or warnings.
- [ ] **Monitor Performance Metrics:** Keep an eye on CPU, memory, network usage, and response times.
- [ ] **Gather User Feedback:** Collect and analyze user feedback to identify areas for improvement.
- [ ] **Regular Maintenance:** Schedule regular updates and security patches for all dependencies and platforms.

# Project Documentation

Welcome to the project documentation! This documentation is organized into several sections to help you find the information you need quickly.

## Documentation Structure

### 📚 [API Documentation](./api/README.md)
- OpenAPI/Swagger specifications
- API endpoints documentation
- Authentication and authorization
- Rate limiting and quotas
- Error handling

### 🏗️ [Architecture](./architecture/README.md)
- System overview
- Service architecture
- Data flow diagrams
- Infrastructure diagrams
- Security architecture

### 👩‍💻 [Development Guide](./development/README.md)
- Local development setup
- Development workflow
- Testing guidelines
- Code style guide
- Contributing guidelines

### 🚀 [Deployment Guide](./deployment/README.md)
- Environment setup
- Deployment procedures
- Configuration management
- Monitoring and logging
- Backup and recovery

### 📖 [User Guides](./guides/README.md)
- End-user documentation
- Admin documentation
- Dashboard user guide
- Billing and subscription
- Troubleshooting

## Documentation Maintenance

### Keeping Documentation in Sync

1. **API Documentation**
   - OpenAPI/Swagger specs are generated from code annotations
   - Run `npm run docs:generate` to update API docs
   - Review and commit changes with related code changes

2. **Environment Setup**
   - `.env.example` files are kept in sync with actual requirements
   - Update when adding new environment variables
   - Document any changes in the deployment guide

3. **Architecture Changes**
   - Update diagrams when making architectural changes
   - Document decisions in ADRs (Architecture Decision Records)
   - Keep infrastructure-as-code in sync with documentation

### Contributing to Documentation

1. Follow the established structure
2. Use clear, concise language
3. Include examples where helpful
4. Update the table of contents
5. Test all code examples
6. Review for technical accuracy

## Tools and Resources

- **Markdown Editor**: VS Code with Markdown extensions
- **Diagrams**: Mermaid.js for flowcharts and diagrams
- **API Documentation**: Swagger/OpenAPI
- **Documentation Site**: Docusaurus (optional)

## Getting Help

If you find any issues with the documentation:
1. Open an issue in the repository
2. Tag it with `documentation`
3. Provide specific details about what needs to be updated

## License

This documentation is licensed under the same terms as the project. 
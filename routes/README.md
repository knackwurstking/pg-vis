# Routes Directory Organization

## Overview

The `routes` directory contains the complete web interface layer for the pg-vis application. It implements HTTP route handlers, template rendering, static asset serving, and user authentication using the Echo web framework.

## Directory Structure

```
routes/
├── README.md                    # This documentation file
├── routes.go                    # Main routing setup and core handlers
├── utils/                       # Shared utility functions
│   └── utils.go                # HTTP utilities and helper functions
├── feed/                        # Activity feed routes
│   ├── feed.go                 # Feed page handlers
│   └── data.go                 # Feed data API endpoints
├── nav/                         # Navigation component routes
│   ├── nav.go                  # Navigation route setup
│   └── feed-counter.go         # Feed counter badge endpoint
├── profile/                     # User profile routes
│   ├── profile.go              # Profile page handlers
│   └── cookies.go              # Session management endpoints
├── troublereports/              # Trouble report routes
│   ├── troublereports.go       # Trouble report page handlers
│   ├── data.go                 # Trouble report data API
│   └── edit-dialog.go          # Trouble report CRUD operations
├── static/                      # Static assets (CSS, JS, images)
│   ├── css/                    # Stylesheets
│   ├── js/                     # JavaScript files
│   ├── *.png, *.ico           # Icons and images
│   ├── manifest.json          # PWA manifest
│   └── service-worker.js      # Service worker for PWA
└── templates/                   # HTML templates
    ├── *.html                  # Main page templates
    ├── feed/                   # Feed-specific templates
    ├── nav/                    # Navigation templates
    ├── profile/                # Profile templates
    └── trouble-reports/        # Trouble report templates
```

## Package Organization

### Main Package (`routes.go`)

The main routes package provides:

- **Core Route Setup**: `Serve()` function that configures all application routes
- **Authentication**: Cookie-based session management and API key authentication
- **Static Assets**: Embedded file system serving for CSS, JS, and images
- **Template Rendering**: Base template parsing and execution
- **Home/Login/Logout**: Core application page handlers

**Key Components:**

- `Options` struct for configuration
- `LoginPageData` for login page context
- `handleApiKeyLogin()` for authentication processing
- Embedded file systems for templates and static assets

### Utilities Package (`utils/`)

Comprehensive utility functions for HTTP operations:

**Context Management:**

- `GetUserFromContext()` - Retrieve authenticated user
- `SetUserInContext()` - Store user in request context
- `GetAPIKeyFromContext()` - Get API key from context
- `SetAPIKeyInContext()` - Store API key in context

**Request Processing:**

- `ParseIDParam()` - Extract and validate URL parameters
- `ParseIntQuery()` - Parse integer query parameters
- `ParsePaginationParams()` - Handle pagination
- `ParseRequiredIDQuery()` - Parse required ID from query
- `ParseSearchQuery()` - Extract search parameters

**Response Handling:**

- `JSONResponse()` - Send JSON responses
- `JSONError()` - Send error responses
- `JSONSuccess()` - Send success responses
- `HandlePgvisError()` - Convert pgvis errors to HTTP responses

**Validation & Security:**

- `ValidateContentType()` - Check request content types
- `RequireAdmin()` - Verify admin privileges
- `SanitizeInput()` - Clean user input
- `ValidateStringLength()` - Validate string constraints

### Feature Packages

#### Feed Package (`feed/`)

- **Purpose**: Activity feed display and data retrieval
- **Routes**: `/feed`, `/feed/data`
- **Features**: Real-time activity feeds, pagination support
- **Templates**: Feed display and data rendering

#### Navigation Package (`nav/`)

- **Purpose**: Navigation components and indicators
- **Routes**: `/nav/feed-counter`
- **Features**: Unread feed counters, navigation badges
- **Templates**: Navigation elements and counters

#### Profile Package (`profile/`)

- **Purpose**: User profile management and session handling
- **Routes**: `/profile`, `/profile/cookies`
- **Features**: Profile editing, session management, cookie viewing
- **Templates**: Profile pages and cookie management

#### Trouble Reports Package (`troublereports/`)

- **Purpose**: Issue tracking and trouble report management
- **Routes**: `/trouble-reports`, `/trouble-reports/data`, `/trouble-reports/dialog-edit`
- **Features**: CRUD operations, dialog-based editing, admin controls
- **Templates**: Report listing, editing dialogs, data tables

## Authentication & Security

### Session Management

- **Cookie-based Authentication**: Uses secure HTTP-only cookies
- **Session Storage**: Database-backed session management
- **API Key Authentication**: Support for API key-based access
- **Session Cleanup**: Automatic cleanup of expired sessions

### Security Features

- **Input Sanitization**: All user inputs are sanitized
- **SQL Injection Prevention**: Parameterized queries throughout
- **XSS Protection**: HTML escaping in templates
- **CSRF Protection**: Form validation and token management
- **Admin Authorization**: Role-based access control

## Template System

### Template Organization

- **Layout Template**: `layout.html` provides base page structure
- **Feature Templates**: Organized by functionality in subdirectories
- **Component Templates**: Reusable components (navigation, etc.)
- **HTMX Integration**: Dynamic content loading and updates

### Template Features

- **Embedded Assets**: Templates embedded in Go binary
- **Dynamic Content**: Server-side rendering with data binding
- **Progressive Enhancement**: JavaScript-optional functionality
- **Responsive Design**: Mobile-friendly layouts

## Static Asset Management

### Asset Organization

- **CSS**: Compiled stylesheets and frameworks
- **JavaScript**: HTMX, utilities, and application scripts
- **Images**: Icons, logos, and PWA assets
- **Fonts**: Web font files (Bootstrap Icons)

### Progressive Web App (PWA)

- **Manifest**: `manifest.json` for PWA configuration
- **Service Worker**: Offline functionality and caching
- **Icons**: Multiple sizes for different devices
- **Installation**: App-like installation capability

## API Endpoints

### Data Endpoints

- `GET /feed/data` - Retrieve activity feed data
- `GET /trouble-reports/data` - Get trouble report data
- `DELETE /trouble-reports/data` - Remove trouble reports
- `GET /nav/feed-counter` - Get unread feed count

### Form Endpoints

- `POST /trouble-reports/dialog-edit` - Create trouble reports
- `PUT /trouble-reports/dialog-edit` - Update trouble reports
- `POST /profile` - Update user profile
- `DELETE /profile/cookies` - Remove sessions

## Error Handling

### Standardized Error Responses

- **HTTP Status Codes**: Appropriate codes for different error types
- **Error Messages**: User-friendly error descriptions
- **Validation Errors**: Detailed field-specific validation feedback
- **System Errors**: Safe error messages that don't leak internals

### Error Flow

1. **Input Validation**: Client-side and server-side validation
2. **Business Logic Errors**: Domain-specific error handling
3. **Database Errors**: Proper error propagation and logging
4. **Response Formatting**: Consistent error response structure

## Development Guidelines

### Code Organization

- **Single Responsibility**: Each package handles one domain
- **DRY Principle**: Shared utilities in `utils/` package
- **Error Handling**: Consistent error patterns throughout
- **Documentation**: Comprehensive function and package documentation

### Testing Strategy

- **Unit Tests**: Test individual functions and handlers
- **Integration Tests**: Test complete request/response cycles
- **Template Tests**: Verify template rendering
- **Security Tests**: Validate input sanitization and authentication

### Performance Considerations

- **Static Asset Caching**: Efficient asset serving
- **Template Caching**: Pre-compiled template caching
- **Database Optimization**: Efficient queries and pagination
- **Memory Management**: Proper resource cleanup

## Configuration

### Environment Variables

- `SERVER_ADDR` - Server listening address
- `SERVER_PATH_PREFIX` - URL path prefix for routes
- `ADMINS` - Comma-separated list of admin user IDs

### Cookie Configuration

- **Name**: `pgvis-api-key`
- **Expiration**: 6 months
- **Security**: HTTP-only, secure flags in production
- **Path**: Application-specific path

## Deployment

### Build Process

- **Embedded Assets**: Templates and static files embedded in binary
- **Single Binary**: Self-contained deployment artifact
- **Configuration**: Environment-based configuration
- **Logging**: Structured logging with appropriate levels

### Production Considerations

- **HTTPS**: SSL/TLS termination at reverse proxy
- **Static Assets**: CDN or reverse proxy caching
- **Session Storage**: Database-backed sessions for scalability
- **Monitoring**: Health checks and metrics endpoints

## Future Enhancements

### Planned Features

- **WebSocket Support**: Real-time updates for feeds
- **API Versioning**: RESTful API with version management
- **Rate Limiting**: Request throttling and abuse prevention
- **Audit Logging**: Comprehensive activity logging

### Architecture Improvements

- **Middleware Pipeline**: Extended middleware for cross-cutting concerns
- **Template Inheritance**: More sophisticated template system
- **Asset Pipeline**: Advanced asset processing and optimization
- **Caching Layer**: Redis or memory-based caching

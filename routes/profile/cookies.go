// Package profile session management handlers.
//
// This file provides HTTP handlers for managing user sessions (cookies)
// within the profile interface. It handles session listing, deletion,
// and security-related operations for user session management.
//
// Key Features:
//   - Session listing with detailed information
//   - Individual session termination
//   - Security context and device recognition
//   - Real-time session updates via HTMX
//   - Session analytics and monitoring
package profile

import (
	"html/template"
	"io/fs"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/charmbracelet/log"
	"github.com/labstack/echo/v4"

	"github.com/knackwurstking/pg-vis/pgvis"
	"github.com/knackwurstking/pg-vis/routes/utils"
)

// Constants for session management
const (
	// CookieValueParam is the query parameter name for cookie values
	CookieValueParam = "value"
	// SessionExpirationWarningDays defines when to warn about expiring sessions
	SessionExpirationWarningDays = 7
	// MaxSessionsPerUser defines the maximum allowed sessions per user
	MaxSessionsPerUser = 10
)

// SessionInfo represents extended session information for display
type SessionInfo struct {
	*pgvis.Cookie
	// IsCurrent indicates if this is the current session
	IsCurrent bool `json:"is_current"`
	// DeviceType describes the type of device (mobile, desktop, tablet)
	DeviceType string `json:"device_type"`
	// BrowserName describes the browser name
	BrowserName string `json:"browser_name"`
	// IsExpiringSoon indicates if the session expires within warning period
	IsExpiringSoon bool `json:"is_expiring_soon"`
	// TimeAgo provides a human-readable time since last activity
	TimeAgo string `json:"time_ago"`
}

// GETCookies handles the request to display user's active sessions.
// It retrieves all sessions for the authenticated user and renders them
// with enhanced information including device type and security context.
//
// Parameters:
//   - templates: File system containing HTML templates
//   - ctx: Echo context for the HTTP request
//   - db: Database connection for data operations
//
// Returns:
//   - *echo.HTTPError: HTTP error if the operation fails
func GETCookies(templates fs.FS, ctx echo.Context, db *pgvis.DB) *echo.HTTPError {
	// Get authenticated user from context
	user, httpErr := utils.GetUserFromContext(ctx)
	if httpErr != nil {
		log.Warnf("Unauthorized access to cookies endpoint: %v", httpErr)
		return httpErr
	}

	// Log the session access for security monitoring
	utils.LogRequest(ctx, "Session management access")
	log.Debugf("User %s (%d) accessing session management", user.UserName, user.TelegramID)

	// Retrieve user's active sessions
	cookies, err := db.Cookies.ListApiKey(user.ApiKey)
	if err != nil {
		log.Errorf("Failed to retrieve sessions for user %s: %v", user.UserName, err)
		return utils.HandlePgvisError(ctx, err)
	}

	// Sort sessions by most recent activity first
	sortedCookies := pgvis.SortCookies(cookies)

	// Enhance session information
	sessionInfos := enhanceSessionInfo(sortedCookies, ctx)

	// Check for security concerns
	if securityWarning := checkSessionSecurity(sessionInfos); securityWarning != "" {
		log.Warnf("Security warning for user %s: %s", user.UserName, securityWarning)
	}

	// Parse and execute the cookies template
	t, err := template.ParseFS(templates, "templates/profile/cookies.html")
	if err != nil {
		log.Errorf("Failed to parse cookies template: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError,
			"Failed to load session management template")
	}

	// Execute template with enhanced session data
	if err := t.Execute(ctx.Response(), sessionInfos); err != nil {
		log.Errorf("Failed to execute cookies template: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError,
			"Failed to render session management page")
	}

	return nil
}

// DELETECookies handles the request to terminate a specific user session.
// It validates the session exists, belongs to the user, and safely removes it.
//
// Parameters:
//   - templates: File system containing HTML templates
//   - ctx: Echo context for the HTTP request
//   - db: Database connection for data operations
//
// Returns:
//   - *echo.HTTPError: HTTP error if the operation fails
func DELETECookies(templates fs.FS, ctx echo.Context, db *pgvis.DB) *echo.HTTPError {
	// Get authenticated user from context
	user, httpErr := utils.GetUserFromContext(ctx)
	if httpErr != nil {
		log.Warnf("Unauthorized session deletion attempt: %v", httpErr)
		return httpErr
	}

	// Extract and validate cookie value parameter
	cookieValue := utils.SanitizeInput(ctx.QueryParam(CookieValueParam))
	if cookieValue == "" {
		log.Warnf("Session deletion attempted without cookie value by user %s", user.UserName)
		return echo.NewHTTPError(http.StatusBadRequest,
			"Session identifier is required")
	}

	// Log the session deletion attempt for security monitoring
	utils.LogRequest(ctx, "Session deletion attempt")
	log.Infof("User %s (%d) attempting to delete session: %s",
		user.UserName, user.TelegramID, maskCookieValue(cookieValue))

	// Verify the session belongs to the current user
	if err := validateSessionOwnership(cookieValue, user, db); err != nil {
		log.Warnf("Invalid session deletion attempt by user %s: %v", user.UserName, err)
		return utils.HandlePgvisError(ctx, err)
	}

	// Check if this is the current session (should not be deleted)
	currentSessionValue := getCurrentSessionValue(ctx)
	if cookieValue == currentSessionValue {
		log.Warnf("User %s attempted to delete current session", user.UserName)
		return echo.NewHTTPError(http.StatusBadRequest,
			"Cannot delete current session. Please use logout instead.")
	}

	// Remove the session from database
	if err := db.Cookies.Remove(cookieValue); err != nil {
		log.Errorf("Failed to delete session for user %s: %v", user.UserName, err)
		return utils.HandlePgvisError(ctx, err)
	}

	log.Infof("Session successfully deleted for user %s: %s",
		user.UserName, maskCookieValue(cookieValue))

	// Return updated session list
	return GETCookies(templates, ctx, db)
}

// enhanceSessionInfo enriches basic cookie data with additional display information
func enhanceSessionInfo(cookies []*pgvis.Cookie, ctx echo.Context) []*SessionInfo {
	if len(cookies) == 0 {
		return []*SessionInfo{}
	}

	currentSessionValue := getCurrentSessionValue(ctx)
	sessionInfos := make([]*SessionInfo, len(cookies))

	for i, cookie := range cookies {
		sessionInfos[i] = &SessionInfo{
			Cookie:         cookie,
			IsCurrent:      cookie.Value == currentSessionValue,
			DeviceType:     detectDeviceType(cookie.UserAgent),
			BrowserName:    detectBrowserName(cookie.UserAgent),
			IsExpiringSoon: isSessionExpiringSoon(cookie),
			TimeAgo:        formatTimeAgo(cookie.GetLastLoginTime()),
		}
	}

	return sessionInfos
}

// validateSessionOwnership verifies that a session belongs to the current user
func validateSessionOwnership(cookieValue string, user *pgvis.User, db *pgvis.DB) error {
	// Retrieve the session from database
	session, err := db.Cookies.Get(cookieValue)
	if err != nil {
		if pgvis.IsNotFound(err) {
			return pgvis.NewValidationError("session", "session not found", cookieValue)
		}
		return pgvis.WrapError(err, "failed to retrieve session for validation")
	}

	// Verify the session belongs to the current user
	if session.ApiKey != user.ApiKey {
		return pgvis.NewAuthorizationError("session does not belong to user", user.UserName)
	}

	return nil
}

// getCurrentSessionValue extracts the current session value from the request context
func getCurrentSessionValue(ctx echo.Context) string {
	cookie, err := ctx.Cookie("pgvis-api-key") // Use the same cookie name as defined in routes
	if err != nil {
		return ""
	}
	return cookie.Value
}

// detectDeviceType analyzes user agent to determine device type
func detectDeviceType(userAgent string) string {
	userAgent = strings.ToLower(userAgent)

	switch {
	case strings.Contains(userAgent, "mobile"):
		return "mobile"
	case strings.Contains(userAgent, "tablet") || strings.Contains(userAgent, "ipad"):
		return "tablet"
	default:
		return "desktop"
	}
}

// detectBrowserName analyzes user agent to determine browser name
func detectBrowserName(userAgent string) string {
	userAgent = strings.ToLower(userAgent)

	switch {
	case strings.Contains(userAgent, "firefox"):
		return "Firefox"
	case strings.Contains(userAgent, "chrome") && !strings.Contains(userAgent, "edge"):
		return "Chrome"
	case strings.Contains(userAgent, "safari") && !strings.Contains(userAgent, "chrome"):
		return "Safari"
	case strings.Contains(userAgent, "edge"):
		return "Edge"
	case strings.Contains(userAgent, "opera"):
		return "Opera"
	default:
		return "Unknown"
	}
}

// isSessionExpiringSoon checks if a session will expire within the warning period
func isSessionExpiringSoon(cookie *pgvis.Cookie) bool {
	if cookie == nil {
		return false
	}

	warningTime := time.Now().Add(SessionExpirationWarningDays * 24 * time.Hour)
	return cookie.IsExpiredAfter(time.Since(warningTime))
}

// formatTimeAgo provides a human-readable time since last activity
func formatTimeAgo(t time.Time) string {
	duration := time.Since(t)

	switch {
	case duration < time.Minute:
		return "gerade eben"
	case duration < time.Hour:
		minutes := int(duration.Minutes())
		if minutes == 1 {
			return "vor 1 Minute"
		}
		return "vor " + strconv.Itoa(minutes) + " Minuten"
	case duration < 24*time.Hour:
		hours := int(duration.Hours())
		if hours == 1 {
			return "vor 1 Stunde"
		}
		return "vor " + strconv.Itoa(hours) + " Stunden"
	case duration < 7*24*time.Hour:
		days := int(duration.Hours() / 24)
		if days == 1 {
			return "vor 1 Tag"
		}
		return "vor " + strconv.Itoa(days) + " Tagen"
	default:
		return t.Format("02.01.2006")
	}
}

// checkSessionSecurity analyzes sessions for potential security concerns
func checkSessionSecurity(sessions []*SessionInfo) string {
	if len(sessions) == 0 {
		return ""
	}

	// Check for too many active sessions
	if len(sessions) > MaxSessionsPerUser {
		return "user has excessive number of active sessions"
	}

	// Check for sessions from unusual locations or devices
	deviceTypes := make(map[string]int)
	for _, session := range sessions {
		deviceTypes[session.DeviceType]++
	}

	// Check for sessions that might indicate account compromise
	if len(deviceTypes) > 3 {
		return "sessions detected from multiple device types"
	}

	return ""
}

// maskCookieValue masks a cookie value for safe logging
func maskCookieValue(value string) string {
	if len(value) <= 8 {
		return strings.Repeat("*", len(value))
	}
	return value[:4] + strings.Repeat("*", len(value)-8) + value[len(value)-4:]
}

// CleanupExpiredSessions removes expired sessions for a user
func CleanupExpiredSessions(user *pgvis.User, db *pgvis.DB) error {
	// This would be called periodically to clean up expired sessions
	// Implementation would depend on having expiration tracking in the database

	log.Debugf("Cleaning up expired sessions for user %s", user.UserName)

	// Get all user sessions
	cookies, err := db.Cookies.ListApiKey(user.ApiKey)
	if err != nil {
		return pgvis.WrapError(err, "failed to retrieve sessions for cleanup")
	}

	// Remove expired sessions
	removedCount := 0
	for _, cookie := range cookies {
		if cookie.IsExpired() {
			if err := db.Cookies.Remove(cookie.Value); err != nil {
				log.Warnf("Failed to remove expired session for user %s: %v", user.UserName, err)
				continue
			}
			removedCount++
		}
	}

	if removedCount > 0 {
		log.Infof("Cleaned up %d expired sessions for user %s", removedCount, user.UserName)
	}

	return nil
}

// GetSessionStatistics returns statistics about user sessions
func GetSessionStatistics(user *pgvis.User, db *pgvis.DB) (map[string]interface{}, error) {
	cookies, err := db.Cookies.ListApiKey(user.ApiKey)
	if err != nil {
		return nil, pgvis.WrapError(err, "failed to retrieve sessions for statistics")
	}

	sessionInfos := enhanceSessionInfo(cookies, nil)

	deviceCounts := make(map[string]int)
	browserCounts := make(map[string]int)
	expiringSoon := 0

	for _, session := range sessionInfos {
		deviceCounts[session.DeviceType]++
		browserCounts[session.BrowserName]++
		if session.IsExpiringSoon {
			expiringSoon++
		}
	}

	return map[string]interface{}{
		"total_sessions":    len(sessionInfos),
		"device_breakdown":  deviceCounts,
		"browser_breakdown": browserCounts,
		"expiring_soon":     expiringSoon,
		"last_activity": func() string {
			if len(sessionInfos) > 0 {
				return sessionInfos[0].TimeAgo
			}
			return "Nie"
		}(),
	}, nil
}

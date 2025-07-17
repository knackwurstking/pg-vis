// Package profile provides HTTP route handlers for user profile management.
//
// This package implements the profile management interface, allowing users to
// view and modify their profile information, manage active sessions, and
// handle account settings. It provides both web interface and API endpoints
// for profile-related operations.
//
// Key Features:
//   - User profile viewing and editing
//   - Session management and security
//   - Username change functionality
//   - Cookie/session listing and management
//   - Real-time updates via HTMX
package profile

import (
	"html/template"
	"io/fs"
	"net/http"
	"time"

	"github.com/charmbracelet/log"
	"github.com/labstack/echo/v4"

	"github.com/knackwurstking/pg-vis/pgvis"
	"github.com/knackwurstking/pg-vis/routes/utils"
)

// Constants for profile management
const (
	// MinUsernameLength defines the minimum allowed username length
	MinUsernameLength = 1
	// MaxUsernameLength defines the maximum allowed username length
	MaxUsernameLength = 100
	// ProfileTemplateSet defines the templates needed for profile pages
	ProfileTemplateSet = "templates/layout.html,templates/profile.html,templates/nav/feed.html"
)

// Profile represents the data structure for profile page rendering.
// It contains user information and associated session data.
type Profile struct {
	// User contains the authenticated user's information
	User *pgvis.User `json:"user"`

	// Cookies contains the user's active sessions
	Cookies []*pgvis.Cookie `json:"cookies"`

	// LastActivity contains the timestamp of the user's last activity
	LastActivity time.Time `json:"last_activity"`

	// SessionCount contains the number of active sessions
	SessionCount int `json:"session_count"`
}

// CookiesSorted returns the user's cookies sorted by last login time.
// This provides a consistent ordering for display purposes.
func (p *Profile) CookiesSorted() []*pgvis.Cookie {
	if p.Cookies == nil {
		return []*pgvis.Cookie{}
	}
	return pgvis.SortCookies(p.Cookies)
}

// HasMultipleSessions returns true if the user has more than one active session.
func (p *Profile) HasMultipleSessions() bool {
	return len(p.Cookies) > 1
}

// GetMostRecentSession returns the most recently used session.
func (p *Profile) GetMostRecentSession() *pgvis.Cookie {
	sorted := p.CookiesSorted()
	if len(sorted) > 0 {
		return sorted[0]
	}
	return nil
}

// IsAdminUser returns true if the current user has administrator privileges.
func (p *Profile) IsAdminUser() bool {
	return p.User != nil && p.User.IsAdmin()
}

// Serve sets up all profile-related HTTP routes and handlers.
// It configures endpoints for profile viewing, editing, and session management.
//
// Parameters:
//   - templates: Embedded file system containing HTML templates
//   - serverPathPrefix: URL path prefix for all routes
//   - e: Echo instance to register routes with
//   - db: Database connection for data operations
func Serve(templates fs.FS, serverPathPrefix string, e *echo.Echo, db *pgvis.DB) {
	// Profile page handler
	e.GET(serverPathPrefix+"/profile", handleProfilePage(templates, db))

	// Session management endpoints
	e.GET(serverPathPrefix+"/profile/cookies", handleGetCookies(templates, db))
	e.DELETE(serverPathPrefix+"/profile/cookies", handleDeleteCookie(templates, db))

	// Profile update endpoints
	e.POST(serverPathPrefix+"/profile", handleProfileUpdate(templates, db))
	e.PUT(serverPathPrefix+"/profile", handleProfileUpdate(templates, db))
}

// handleProfilePage creates the handler for the main profile page.
func handleProfilePage(templates fs.FS, db *pgvis.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Log the profile page access
		utils.LogRequest(c, "Profile page access")

		// Get authenticated user
		user, httpErr := utils.GetUserFromContext(c)
		if httpErr != nil {
			return httpErr
		}

		// Initialize profile data
		pageData := &Profile{
			User:         user,
			Cookies:      []*pgvis.Cookie{},
			LastActivity: time.Now(),
		}

		// Handle username change if submitted
		if err := handleUserNameChange(c, pageData, db); err != nil {
			log.Warnf("Username change failed for user %s: %v", user.UserName, err)
			return utils.HandlePgvisError(c, err)
		}

		// Load user's active sessions
		if err := loadUserSessions(pageData, db); err != nil {
			log.Errorf("Failed to load sessions for user %s: %v", user.UserName, err)
			// Don't fail the page load, just log the error
		}

		// Render the profile page
		return renderProfilePage(c, templates, pageData)
	}
}

// handleGetCookies creates the handler for retrieving user sessions.
func handleGetCookies(templates fs.FS, db *pgvis.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		return GETCookies(templates, c, db)
	}
}

// handleDeleteCookie creates the handler for deleting user sessions.
func handleDeleteCookie(templates fs.FS, db *pgvis.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		return DELETECookies(templates, c, db)
	}
}

// handleProfileUpdate creates the handler for profile updates.
func handleProfileUpdate(templates fs.FS, db *pgvis.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Get authenticated user
		user, httpErr := utils.GetUserFromContext(c)
		if httpErr != nil {
			return httpErr
		}

		// Initialize profile data
		pageData := &Profile{
			User:         user,
			Cookies:      []*pgvis.Cookie{},
			LastActivity: time.Now(),
		}

		// Handle the profile update
		if err := handleUserNameChange(c, pageData, db); err != nil {
			log.Warnf("Profile update failed for user %s: %v", user.UserName, err)
			return utils.HandlePgvisError(c, err)
		}

		// Load updated session data
		if err := loadUserSessions(pageData, db); err != nil {
			log.Errorf("Failed to load sessions after update for user %s: %v", user.UserName, err)
		}

		// Render the updated profile page
		return renderProfilePage(c, templates, pageData)
	}
}

// handleUserNameChange processes username change requests.
// It validates the new username and updates the database if valid.
//
// Parameters:
//   - ctx: Echo context containing form data
//   - pageData: Profile data to update
//   - db: Database connection for user operations
//
// Returns:
//   - error: Validation or database error if the change fails
func handleUserNameChange(ctx echo.Context, pageData *Profile, db *pgvis.DB) error {
	// Parse form parameters
	formParams, _ := ctx.FormParams()
	newUserName := utils.SanitizeInput(formParams.Get("user-name"))

	// Skip if no username provided or unchanged
	if newUserName == "" || newUserName == pageData.User.UserName {
		return nil
	}

	// Validate new username
	if err := validateUsername(newUserName); err != nil {
		return err
	}

	log.Infof("Username change request: %s -> %s (User ID: %d)",
		pageData.User.UserName, newUserName, pageData.User.TelegramID)

	// Create updated user object
	updatedUser := pgvis.NewUser(
		pageData.User.TelegramID,
		newUserName,
		pageData.User.ApiKey,
	)
	updatedUser.LastFeed = pageData.User.LastFeed

	// Update in database
	if err := db.Users.Update(pageData.User.TelegramID, updatedUser); err != nil {
		return pgvis.WrapErrorf(err, "failed to update username for user %d", pageData.User.TelegramID)
	}

	// Update the page data with new username
	pageData.User.UserName = newUserName

	log.Infof("Username successfully changed to: %s (User ID: %d)",
		newUserName, pageData.User.TelegramID)

	return nil
}

// validateUsername validates a username according to application rules.
//
// Parameters:
//   - username: The username to validate
//
// Returns:
//   - error: Validation error if the username is invalid
func validateUsername(username string) error {
	if len(username) < MinUsernameLength {
		return pgvis.NewValidationError("user-name",
			"username is too short", len(username))
	}

	if len(username) > MaxUsernameLength {
		return pgvis.NewValidationError("user-name",
			"username is too long", len(username))
	}

	// Additional validation could be added here:
	// - Check for forbidden characters
	// - Check for reserved usernames
	// - Check for profanity

	return nil
}

// loadUserSessions loads the user's active sessions and populates profile data.
//
// Parameters:
//   - pageData: Profile data to populate
//   - db: Database connection for cookie operations
//
// Returns:
//   - error: Database error if loading fails
func loadUserSessions(pageData *Profile, db *pgvis.DB) error {
	cookies, err := db.Cookies.ListApiKey(pageData.User.ApiKey)
	if err != nil {
		return pgvis.WrapErrorf(err, "failed to load sessions for user %s", pageData.User.UserName)
	}

	// Update profile data
	pageData.Cookies = cookies
	pageData.SessionCount = len(cookies)

	// Update last activity from most recent session
	if mostRecent := pageData.GetMostRecentSession(); mostRecent != nil {
		pageData.LastActivity = mostRecent.GetLastLoginTime()
	}

	return nil
}

// renderProfilePage renders the profile page template with the provided data.
//
// Parameters:
//   - c: Echo context for response
//   - templates: Template file system
//   - pageData: Data to render in the template
//
// Returns:
//   - error: Template parsing or execution error
func renderProfilePage(c echo.Context, templates fs.FS, pageData *Profile) error {
	// Parse profile page templates
	t, err := template.ParseFS(templates,
		"templates/layout.html",
		"templates/profile.html",
		"templates/nav/feed.html",
	)
	if err != nil {
		log.Errorf("Failed to parse profile templates: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError,
			"Failed to load page templates")
	}

	// Execute template with profile data
	if err := t.Execute(c.Response(), pageData); err != nil {
		log.Errorf("Failed to execute profile template: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError,
			"Failed to render page")
	}

	return nil
}

// ProfileStats represents statistics about a user's profile and activity.
type ProfileStats struct {
	// TotalSessions is the total number of sessions created
	TotalSessions int `json:"total_sessions"`

	// ActiveSessions is the number of currently active sessions
	ActiveSessions int `json:"active_sessions"`

	// LastLoginTime is the timestamp of the most recent login
	LastLoginTime time.Time `json:"last_login_time"`

	// AccountAge is the duration since account creation
	AccountAge time.Duration `json:"account_age"`
}

// GetProfileStats calculates and returns profile statistics for a user.
//
// Parameters:
//   - user: The user to calculate stats for
//   - db: Database connection for data operations
//
// Returns:
//   - *ProfileStats: Calculated statistics
//   - error: Database error if calculation fails
func GetProfileStats(user *pgvis.User, db *pgvis.DB) (*ProfileStats, error) {
	stats := &ProfileStats{}

	// Get active sessions
	cookies, err := db.Cookies.ListApiKey(user.ApiKey)
	if err != nil {
		return nil, pgvis.WrapError(err, "failed to load user sessions for stats")
	}

	stats.ActiveSessions = len(cookies)

	// Find most recent login
	if len(cookies) > 0 {
		sorted := pgvis.SortCookies(cookies)
		stats.LastLoginTime = sorted[0].GetLastLoginTime()
	}

	// Note: TotalSessions and AccountAge would require additional
	// database tables to track historical data

	return stats, nil
}

// Package troublereports provides HTTP route handlers for trouble report management.
//
// This package implements the trouble report management interface, allowing users to
// create, view, edit, and delete trouble reports. It provides both web interface
// and API endpoints for trouble report operations with comprehensive validation,
// security controls, and real-time updates.
//
// Key Features:
//   - Trouble report CRUD operations
//   - Administrative controls and permissions
//   - Real-time updates via HTMX
//   - Search and filtering capabilities
//   - Attachment handling (planned)
//   - Audit trail and activity tracking
//   - Role-based access control
package troublereports

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

// Constants for trouble report management
const (
	// TroubleReportTemplateSet defines the templates needed for trouble report pages
	TroubleReportTemplateSet = "templates/layout.html,templates/trouble-reports.html,templates/nav/feed.html"
	// MaxTroubleReportsPerPage defines the maximum number of reports per page
	MaxTroubleReportsPerPage = 50
	// DefaultTroubleReportsPerPage defines the default number of reports per page
	DefaultTroubleReportsPerPage = 20
	// MaxSearchQueryLength defines the maximum length for search queries
	MaxSearchQueryLength = 500
)

// TroubleReportPageData represents the data structure for trouble report page rendering.
type TroubleReportPageData struct {
	// User contains the authenticated user's information
	User *pgvis.User `json:"user"`

	// TroubleReports contains the reports to display
	TroubleReports []*pgvis.TroubleReport `json:"trouble_reports"`

	// TotalCount contains the total number of available reports
	TotalCount int `json:"total_count"`

	// SearchQuery contains the current search query if any
	SearchQuery string `json:"search_query"`

	// IsAdmin indicates if the current user has admin privileges
	IsAdmin bool `json:"is_admin"`

	// LastUpdated contains the timestamp of the last update
	LastUpdated time.Time `json:"last_updated"`
}

// TroubleReportStats represents statistics about trouble reports.
type TroubleReportStats struct {
	// TotalReports is the total number of reports in the system
	TotalReports int `json:"total_reports"`

	// RecentReports is the number of reports created in the last 7 days
	RecentReports int `json:"recent_reports"`

	// UserReports is the number of reports created by the current user
	UserReports int `json:"user_reports"`

	// LastCreated is the timestamp of the most recently created report
	LastCreated time.Time `json:"last_created"`
}

// Serve sets up all trouble report-related HTTP routes and handlers.
// It configures endpoints for report viewing, creation, editing, deletion,
// and data management with proper authentication and authorization.
//
// Parameters:
//   - templates: Embedded file system containing HTML templates
//   - serverPathPrefix: URL path prefix for all routes
//   - e: Echo instance to register routes with
//   - db: Database connection for data operations
func Serve(templates fs.FS, serverPathPrefix string, e *echo.Echo, db *pgvis.DB) {
	// Main trouble reports page
	e.GET(serverPathPrefix+"/trouble-reports", handleTroubleReportsPage(templates, db))

	// Data management endpoints
	e.GET(serverPathPrefix+"/trouble-reports/data", handleGetTroubleReportData(templates, db))
	e.DELETE(serverPathPrefix+"/trouble-reports/data", handleDeleteTroubleReport(templates, db))

	// Dialog-based editing endpoints
	e.GET(serverPathPrefix+"/trouble-reports/dialog-edit", handleGetEditDialog(templates, db))
	e.POST(serverPathPrefix+"/trouble-reports/dialog-edit", handleCreateTroubleReport(templates, db))
	e.PUT(serverPathPrefix+"/trouble-reports/dialog-edit", handleUpdateTroubleReport(templates, db))

	// Search and filtering endpoints
	e.GET(serverPathPrefix+"/trouble-reports/search", handleSearchTroubleReports(templates, db))

	// Statistics and analytics endpoints
	e.GET(serverPathPrefix+"/trouble-reports/stats", handleGetTroubleReportStats(db))

	// Bulk operations (admin only)
	e.POST(serverPathPrefix+"/trouble-reports/bulk-delete", handleBulkDeleteTroubleReports(db))
	e.POST(serverPathPrefix+"/trouble-reports/export", handleExportTroubleReports(db))
}

// handleTroubleReportsPage creates the handler for the main trouble reports page.
func handleTroubleReportsPage(templates fs.FS, db *pgvis.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Log the page access
		utils.LogRequest(c, "Trouble reports page access")

		// Get authenticated user
		user, httpErr := utils.GetUserFromContext(c)
		if httpErr != nil {
			return httpErr
		}

		// Initialize page data
		pageData := &TroubleReportPageData{
			User:           user,
			TroubleReports: []*pgvis.TroubleReport{},
			IsAdmin:        user.IsAdmin(),
			LastUpdated:    time.Now(),
		}

		// Load trouble report statistics
		if err := loadTroubleReportStatistics(pageData, db); err != nil {
			log.Errorf("Failed to load trouble report statistics for user %s: %v", user.UserName, err)
			// Don't fail the page load, just log the error
		}

		// Render the trouble reports page
		return renderTroubleReportsPage(c, templates, pageData)
	}
}

// handleGetTroubleReportData creates the handler for retrieving trouble report data.
func handleGetTroubleReportData(templates fs.FS, db *pgvis.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		return GETData(templates, c, db)
	}
}

// handleDeleteTroubleReport creates the handler for deleting trouble reports.
func handleDeleteTroubleReport(templates fs.FS, db *pgvis.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		return DELETEData(templates, c, db)
	}
}

// handleGetEditDialog creates the handler for the edit dialog.
func handleGetEditDialog(templates fs.FS, db *pgvis.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		return GETDialogEdit(templates, c, db, nil)
	}
}

// handleCreateTroubleReport creates the handler for creating new trouble reports.
func handleCreateTroubleReport(templates fs.FS, db *pgvis.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Log the creation attempt
		utils.LogRequest(c, "Trouble report creation attempt")

		// Get authenticated user for logging
		user, httpErr := utils.GetUserFromContext(c)
		if httpErr != nil {
			return httpErr
		}

		log.Infof("User %s creating new trouble report", user.UserName)

		return POSTDialogEdit(templates, c, db)
	}
}

// handleUpdateTroubleReport creates the handler for updating trouble reports.
func handleUpdateTroubleReport(templates fs.FS, db *pgvis.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Log the update attempt
		utils.LogRequest(c, "Trouble report update attempt")

		// Get authenticated user for logging
		user, httpErr := utils.GetUserFromContext(c)
		if httpErr != nil {
			return httpErr
		}

		// Get the report ID being updated
		reportID := c.QueryParam("id")
		log.Infof("User %s updating trouble report %s", user.UserName, reportID)

		return PUTDialogEdit(templates, c, db)
	}
}

// handleSearchTroubleReports creates the handler for searching trouble reports.
func handleSearchTroubleReports(templates fs.FS, db *pgvis.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Get authenticated user
		user, httpErr := utils.GetUserFromContext(c)
		if httpErr != nil {
			return httpErr
		}

		// Parse search query
		searchQuery, httpErr := utils.ParseSearchQuery(c)
		if httpErr != nil {
			return httpErr
		}

		log.Debugf("User %s searching trouble reports: %s", user.UserName, searchQuery)

		// TODO: Implement search functionality
		// For now, delegate to the regular data handler
		return GETData(templates, c, db)
	}
}

// handleGetTroubleReportStats creates the handler for retrieving statistics.
func handleGetTroubleReportStats(db *pgvis.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Get authenticated user
		user, httpErr := utils.GetUserFromContext(c)
		if httpErr != nil {
			return httpErr
		}

		// Generate statistics
		stats, err := generateTroubleReportStats(user, db)
		if err != nil {
			log.Errorf("Failed to generate trouble report stats for user %s: %v", user.UserName, err)
			return utils.HandlePgvisError(c, err)
		}

		return utils.JSONResponse(c, http.StatusOK, stats)
	}
}

// handleBulkDeleteTroubleReports creates the handler for bulk deletion (admin only).
func handleBulkDeleteTroubleReports(db *pgvis.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Require admin privileges
		if httpErr := utils.RequireAdmin(c); httpErr != nil {
			return httpErr
		}

		// Get authenticated user for logging
		user, httpErr := utils.GetUserFromContext(c)
		if httpErr != nil {
			return httpErr
		}

		log.Infof("Admin %s attempting bulk delete of trouble reports", user.UserName)

		// TODO: Implement bulk delete functionality
		return utils.JSONError(c, http.StatusNotImplemented, "Bulk delete not yet implemented")
	}
}

// handleExportTroubleReports creates the handler for exporting trouble reports.
func handleExportTroubleReports(db *pgvis.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Get authenticated user
		user, httpErr := utils.GetUserFromContext(c)
		if httpErr != nil {
			return httpErr
		}

		log.Infof("User %s requesting trouble report export", user.UserName)

		// TODO: Implement export functionality
		return utils.JSONError(c, http.StatusNotImplemented, "Export not yet implemented")
	}
}

// loadTroubleReportStatistics loads statistics for the trouble reports page.
func loadTroubleReportStatistics(pageData *TroubleReportPageData, db *pgvis.DB) error {
	// Get all trouble reports for counting
	reports, err := db.TroubleReports.List()
	if err != nil {
		return pgvis.WrapError(err, "failed to load trouble reports for statistics")
	}

	pageData.TotalCount = len(reports)

	return nil
}

// generateTroubleReportStats generates comprehensive statistics about trouble reports.
func generateTroubleReportStats(user *pgvis.User, db *pgvis.DB) (*TroubleReportStats, error) {
	// Get all trouble reports
	reports, err := db.TroubleReports.List()
	if err != nil {
		return nil, pgvis.WrapError(err, "failed to load trouble reports for statistics")
	}

	stats := &TroubleReportStats{
		TotalReports: len(reports),
	}

	// Calculate time-based statistics
	now := time.Now()
	weekAgo := now.AddDate(0, 0, -7)

	for _, report := range reports {
		// Count recent reports (last 7 days)
		if report.Modified != nil && report.Modified.GetTime().After(weekAgo) {
			stats.RecentReports++
		}

		// Count user's reports
		if report.Modified != nil && report.Modified.User != nil &&
			report.Modified.User.TelegramID == user.TelegramID {
			stats.UserReports++
		}

		// Track most recent creation
		if report.Modified != nil {
			if stats.LastCreated.IsZero() || report.Modified.GetTime().After(stats.LastCreated) {
				stats.LastCreated = report.Modified.GetTime()
			}
		}
	}

	return stats, nil
}

// renderTroubleReportsPage renders the main trouble reports page template.
func renderTroubleReportsPage(c echo.Context, templates fs.FS, pageData *TroubleReportPageData) error {
	// Parse trouble reports page templates
	t, err := template.ParseFS(templates,
		"templates/layout.html",
		"templates/trouble-reports.html",
		"templates/nav/feed.html",
	)
	if err != nil {
		log.Errorf("Failed to parse trouble reports templates: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError,
			"Failed to load page templates")
	}

	// Execute template with page data
	if err := t.Execute(c.Response(), pageData); err != nil {
		log.Errorf("Failed to execute trouble reports template: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError,
			"Failed to render page")
	}

	return nil
}

// ValidateTroubleReportAccess validates that a user can access a specific trouble report.
func ValidateTroubleReportAccess(user *pgvis.User, reportID int64, db *pgvis.DB) error {
	// Admins can access all reports
	if user.IsAdmin() {
		return nil
	}

	// Get the report to check ownership
	report, err := db.TroubleReports.Get(reportID)
	if err != nil {
		if pgvis.IsNotFound(err) {
			return pgvis.NewValidationError("report_id", "trouble report not found", reportID)
		}
		return pgvis.WrapError(err, "failed to retrieve trouble report for access validation")
	}

	// Check if user created this report
	if report.Modified != nil && report.Modified.User != nil {
		if report.Modified.User.TelegramID == user.TelegramID {
			return nil
		}
	}

	// For now, allow all authenticated users to view reports
	// TODO: Implement more granular access controls
	return nil
}

// GetTroubleReportStatistics returns comprehensive trouble report statistics.
func GetTroubleReportStatistics(user *pgvis.User, db *pgvis.DB) (map[string]interface{}, error) {
	stats, err := generateTroubleReportStats(user, db)
	if err != nil {
		return nil, pgvis.WrapError(err, "failed to generate trouble report statistics")
	}

	return map[string]interface{}{
		"total_reports":  stats.TotalReports,
		"recent_reports": stats.RecentReports,
		"user_reports":   stats.UserReports,
		"last_created":   stats.LastCreated,
		"user_is_admin":  user.IsAdmin(),
		"generated_at":   time.Now(),
	}, nil
}

// CleanupOldTroubleReports removes old trouble reports based on retention policies.
// This function should be called periodically by a background job.
func CleanupOldTroubleReports(db *pgvis.DB, olderThan time.Duration) error {
	// TODO: Implement cleanup functionality when we have timestamp tracking
	log.Infof("Trouble report cleanup not yet implemented (retention: %v)", olderThan)
	return nil
}

// TODO: Implement search functionality
// func SearchTroubleReports(query string, db *pgvis.DB) ([]*pgvis.TroubleReport, error) {
//     // Implement full-text search across title and content
//     return nil, nil
// }

// TODO: Implement export functionality
// func ExportTroubleReports(format string, db *pgvis.DB) ([]byte, error) {
//     // Implement export to JSON, CSV, PDF, etc.
//     return nil, nil
// }

// TODO: Implement bulk operations
// func BulkDeleteTroubleReports(ids []int64, user *pgvis.User, db *pgvis.DB) error {
//     // Implement bulk deletion with proper authorization
//     return nil
// }

// Package nav provides navigation-related HTTP route handlers.
//
// This package implements navigation components for the pg-vis web interface,
// including feed counters, notification badges, and other navigation elements
// that help users understand system state and activity.
package nav

import (
	"io/fs"

	"github.com/labstack/echo/v4"

	"github.com/knackwurstking/pg-vis/pgvis"
)

// Serve sets up all navigation-related HTTP routes.
// It configures endpoints for navigation components such as feed counters
// and notification badges.
//
// Parameters:
//   - templates: Embedded file system containing HTML templates
//   - serverPathPrefix: URL path prefix for all routes
//   - e: Echo instance to register routes with
//   - db: Database connection for data operations
func Serve(templates fs.FS, serverPathPrefix string, e *echo.Echo, db *pgvis.DB) {
	// Feed counter endpoint for navigation badge
	e.GET(serverPathPrefix+"/nav/feed-counter", func(c echo.Context) error {
		return GETFeedCounter(templates, c, db)
	})
}

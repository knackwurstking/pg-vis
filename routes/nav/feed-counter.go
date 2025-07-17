// Package nav feed counter implementation.
//
// This file provides the feed counter functionality for the navigation bar,
// which displays the number of unread feed items for the authenticated user.
package nav

import (
	"html/template"
	"io/fs"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/knackwurstking/pg-vis/pgvis"
	"github.com/knackwurstking/pg-vis/routes/utils"
)

// FeedCounter represents the data structure for the navigation feed counter.
// It contains the count of unread feed items for display in the navigation bar.
type FeedCounter struct {
	// Count is the number of unread feed items for the current user
	Count int `json:"count"`
}

// GETFeedCounter handles the feed counter endpoint for the navigation bar.
// It calculates and returns the number of unread feed items for the authenticated user.
//
// Parameters:
//   - templates: File system containing HTML templates
//   - c: Echo context for the HTTP request
//   - db: Database connection for data operations
//
// Returns:
//   - *echo.HTTPError: HTTP error if the operation fails
func GETFeedCounter(templates fs.FS, c echo.Context, db *pgvis.DB) *echo.HTTPError {
	// Get authenticated user from context
	user, herr := utils.GetUserFromContext(c)
	if herr != nil {
		return herr
	}

	// Initialize counter data
	data := &FeedCounter{Count: 0}

	// Get recent feeds to calculate unread count
	feeds, err := db.Feeds.ListRange(0, 100)
	if err != nil {
		return utils.HandlePgvisError(c, err)
	}

	// Calculate unread feed count
	// Count feeds with ID greater than user's last seen feed
	for _, feed := range feeds {
		if feed.ID > user.LastFeed {
			data.Count++
		} else {
			// Since feeds are ordered by ID descending, we can break early
			break
		}
	}

	// Parse and execute template
	t, err := template.ParseFS(templates, "templates/nav/feed-counter.html")
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	if err := t.Execute(c.Response(), data); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return nil
}

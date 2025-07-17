// Package feed provides HTTP route handlers for activity feed management.
//
// This package implements the activity feed interface, allowing users to
// view real-time system activities, events, and notifications. It provides
// both web interface and API endpoints for feed-related operations.
//
// Key Features:
//   - Real-time activity feed display
//   - Automatic feed updates via HTMX
//   - User-specific feed filtering
//   - Feed pagination and performance optimization
//   - WebSocket support for live updates (planned)
//   - Feed analytics and monitoring
package feed

import (
	"html/template"
	"io/fs"
	"net/http"
	"strconv"
	"time"

	"github.com/charmbracelet/log"
	"github.com/labstack/echo/v4"

	"github.com/knackwurstking/pg-vis/pgvis"
	"github.com/knackwurstking/pg-vis/routes/utils"
)

// Constants for feed management
const (
	// DefaultFeedLimit defines the default number of feed items to display
	DefaultFeedLimit = 50
	// MaxFeedLimit defines the maximum number of feed items per request
	MaxFeedLimit = 100
	// FeedRefreshInterval defines how often the feed auto-refreshes (in seconds)
	FeedRefreshInterval = 30
	// FeedTemplateSet defines the templates needed for feed pages
	FeedTemplateSet = "templates/layout.html,templates/feed.html"
)

// FeedPageData represents the data structure for feed page rendering.
type FeedPageData struct {
	// User contains the authenticated user's information
	User *pgvis.User `json:"user"`

	// Feeds contains the feed items to display
	Feeds []*pgvis.Feed `json:"feeds"`

	// TotalCount contains the total number of available feed items
	TotalCount int `json:"total_count"`

	// UnreadCount contains the number of unread feed items for this user
	UnreadCount int `json:"unread_count"`

	// LastRefresh contains the timestamp of the last feed refresh
	LastRefresh time.Time `json:"last_refresh"`

	// AutoRefreshEnabled indicates if auto-refresh is enabled
	AutoRefreshEnabled bool `json:"auto_refresh_enabled"`
}

// FeedDataResponse represents the data structure for feed data API responses.
type FeedDataResponse struct {
	// Feeds contains the feed items
	Feeds []*pgvis.Feed `json:"feeds"`

	// HasMore indicates if there are more items available
	HasMore bool `json:"has_more"`

	// NextOffset contains the offset for the next page
	NextOffset int `json:"next_offset"`

	// UpdatedAt contains the timestamp when this data was generated
	UpdatedAt time.Time `json:"updated_at"`
}

// Serve sets up all feed-related HTTP routes and handlers.
// It configures endpoints for feed viewing, data retrieval, and real-time updates.
//
// Parameters:
//   - templates: Embedded file system containing HTML templates
//   - serverPathPrefix: URL path prefix for all routes
//   - e: Echo instance to register routes with
//   - db: Database connection for data operations
func Serve(templates fs.FS, serverPathPrefix string, e *echo.Echo, db *pgvis.DB) {
	// Feed page handler
	e.GET(serverPathPrefix+"/feed", handleFeedPage(templates, db))

	// Feed data API endpoints
	e.GET(serverPathPrefix+"/feed/data", handleGetFeedData(templates, db))
	e.POST(serverPathPrefix+"/feed/refresh", handleRefreshFeed(templates, db))

	// Feed management endpoints
	e.PUT(serverPathPrefix+"/feed/mark-read", handleMarkFeedRead(db))
	e.DELETE(serverPathPrefix+"/feed/:id", handleDeleteFeedItem(db))

	// TODO: WebSocket endpoints for real-time updates
	// e.GET(serverPathPrefix+"/feed/ws", handleFeedWebSocket(db))
}

// handleFeedPage creates the handler for the main feed page.
func handleFeedPage(templates fs.FS, db *pgvis.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Log the feed page access
		utils.LogRequest(c, "Feed page access")

		// Get authenticated user
		user, httpErr := utils.GetUserFromContext(c)
		if httpErr != nil {
			return httpErr
		}

		// Initialize page data
		pageData := &FeedPageData{
			User:               user,
			Feeds:              []*pgvis.Feed{},
			LastRefresh:        time.Now(),
			AutoRefreshEnabled: true,
		}

		// Load feed statistics
		if err := loadFeedStatistics(pageData, db); err != nil {
			log.Errorf("Failed to load feed statistics for user %s: %v", user.UserName, err)
			// Don't fail the page load, just log the error
		}

		// Render the feed page
		return renderFeedPage(c, templates, pageData)
	}
}

// handleGetFeedData creates the handler for retrieving feed data.
func handleGetFeedData(templates fs.FS, db *pgvis.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Log the data request
		utils.LogRequest(c, "Feed data request")

		// Get authenticated user
		user, httpErr := utils.GetUserFromContext(c)
		if httpErr != nil {
			return httpErr
		}

		// Parse pagination parameters
		offset, limit, httpErr := utils.ParsePaginationParams(c)
		if httpErr != nil {
			return httpErr
		}

		// Enforce feed limits
		if limit > MaxFeedLimit {
			limit = MaxFeedLimit
		}
		if limit == 0 {
			limit = DefaultFeedLimit
		}

		log.Debugf("Loading feed data for user %s: offset=%d, limit=%d",
			user.UserName, offset, limit)

		// Load feed data from database
		feeds, err := db.Feeds.ListRange(offset, limit)
		if err != nil {
			log.Errorf("Failed to load feed data for user %s: %v", user.UserName, err)
			return utils.HandlePgvisError(c, err)
		}

		// Update user's last feed view
		if err := updateUserLastFeed(user, feeds, db); err != nil {
			log.Warnf("Failed to update last feed for user %s: %v", user.UserName, err)
			// Don't fail the request, just log the warning
		}

		// Render feed data template
		return renderFeedData(c, templates, feeds)
	}
}

// handleRefreshFeed creates the handler for manual feed refresh.
func handleRefreshFeed(templates fs.FS, db *pgvis.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Log the refresh request
		utils.LogRequest(c, "Feed refresh request")

		// Get authenticated user
		user, httpErr := utils.GetUserFromContext(c)
		if httpErr != nil {
			return httpErr
		}

		log.Debugf("Manual feed refresh requested by user %s", user.UserName)

		// Delegate to the data handler for refresh
		return handleGetFeedData(templates, db)(c)
	}
}

// handleMarkFeedRead creates the handler for marking feed items as read.
func handleMarkFeedRead(db *pgvis.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Get authenticated user
		user, httpErr := utils.GetUserFromContext(c)
		if httpErr != nil {
			return httpErr
		}

		// Parse feed ID parameter
		feedID, httpErr := utils.ParseRequiredIDQuery(c, "id")
		if httpErr != nil {
			return httpErr
		}

		log.Debugf("Marking feed %d as read for user %s", feedID, user.UserName)

		// Update user's last feed to mark as read
		user.LastFeed = int(feedID)
		if err := db.Users.Update(user.TelegramID, user); err != nil {
			log.Errorf("Failed to mark feed as read for user %s: %v", user.UserName, err)
			return utils.HandlePgvisError(c, err)
		}

		return utils.JSONSuccess(c, map[string]interface{}{
			"message": "Feed marked as read",
			"feed_id": feedID,
		})
	}
}

// handleDeleteFeedItem creates the handler for deleting feed items (admin only).
func handleDeleteFeedItem(db *pgvis.DB) echo.HandlerFunc {
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

		// Parse feed ID from URL parameter
		feedIDStr := c.Param("id")
		feedID, err := strconv.ParseInt(feedIDStr, 10, 64)
		if err != nil || feedID <= 0 {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid feed ID")
		}

		log.Infof("Admin %s deleting feed item %d", user.UserName, feedID)

		// Delete the feed item
		if err := db.Feeds.Delete(int(feedID)); err != nil {
			log.Errorf("Failed to delete feed item %d: %v", feedID, err)
			return utils.HandlePgvisError(c, err)
		}

		log.Infof("Feed item %d successfully deleted by admin %s", feedID, user.UserName)

		return utils.JSONSuccess(c, map[string]interface{}{
			"message": "Feed item deleted",
			"feed_id": feedID,
		})
	}
}

// loadFeedStatistics loads feed-related statistics for the page data.
func loadFeedStatistics(pageData *FeedPageData, db *pgvis.DB) error {
	// Get total feed count
	totalCount, err := db.Feeds.Count()
	if err != nil {
		return pgvis.WrapError(err, "failed to load total feed count")
	}
	pageData.TotalCount = totalCount

	// Calculate unread count for this user
	if pageData.User != nil {
		unreadCount, err := calculateUnreadFeedCount(pageData.User, db)
		if err != nil {
			return pgvis.WrapError(err, "failed to calculate unread feed count")
		}
		pageData.UnreadCount = unreadCount
	}

	return nil
}

// calculateUnreadFeedCount calculates the number of unread feed items for a user.
func calculateUnreadFeedCount(user *pgvis.User, db *pgvis.DB) (int, error) {
	// Get recent feeds to count unread items
	feeds, err := db.Feeds.ListRange(0, MaxFeedLimit)
	if err != nil {
		return 0, pgvis.WrapError(err, "failed to retrieve feeds for unread count")
	}

	unreadCount := 0
	for _, feed := range feeds {
		if feed.ID > user.LastFeed {
			unreadCount++
		} else {
			// Since feeds are ordered by ID descending, we can break early
			break
		}
	}

	return unreadCount, nil
}

// updateUserLastFeed updates the user's last viewed feed ID.
func updateUserLastFeed(user *pgvis.User, feeds []*pgvis.Feed, db *pgvis.DB) error {
	if len(feeds) == 0 {
		return nil
	}

	// Update to the most recent feed ID
	mostRecentFeedID := feeds[0].ID
	if mostRecentFeedID > user.LastFeed {
		user.LastFeed = mostRecentFeedID

		if err := db.Users.Update(user.TelegramID, user); err != nil {
			return pgvis.WrapError(err, "failed to update user's last feed")
		}

		log.Debugf("Updated last feed for user %s to %d", user.UserName, mostRecentFeedID)
	}

	return nil
}

// renderFeedPage renders the main feed page template.
func renderFeedPage(c echo.Context, templates fs.FS, pageData *FeedPageData) error {
	// Parse feed page templates
	t, err := template.ParseFS(templates,
		"templates/layout.html",
		"templates/feed.html",
	)
	if err != nil {
		log.Errorf("Failed to parse feed templates: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError,
			"Failed to load page templates")
	}

	// Execute template with page data
	if err := t.Execute(c.Response(), pageData); err != nil {
		log.Errorf("Failed to execute feed template: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError,
			"Failed to render page")
	}

	return nil
}

// renderFeedData renders the feed data template for HTMX updates.
func renderFeedData(c echo.Context, templates fs.FS, feeds []*pgvis.Feed) error {
	// Create data structure for template
	data := struct {
		Feeds []*pgvis.Feed
	}{
		Feeds: feeds,
	}

	// Parse feed data template
	t, err := template.ParseFS(templates, "templates/feed/data.html")
	if err != nil {
		log.Errorf("Failed to parse feed data template: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError,
			"Failed to load feed data template")
	}

	// Execute template with feed data
	if err := t.Execute(c.Response(), data); err != nil {
		log.Errorf("Failed to execute feed data template: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError,
			"Failed to render feed data")
	}

	return nil
}

// GetFeedStatistics returns comprehensive feed statistics.
func GetFeedStatistics(user *pgvis.User, db *pgvis.DB) (map[string]interface{}, error) {
	// Get total feed count
	totalCount, err := db.Feeds.Count()
	if err != nil {
		return nil, pgvis.WrapError(err, "failed to get total feed count")
	}

	// Calculate unread count
	unreadCount, err := calculateUnreadFeedCount(user, db)
	if err != nil {
		return nil, pgvis.WrapError(err, "failed to calculate unread count")
	}

	// Get recent activity
	recentFeeds, err := db.Feeds.ListRange(0, 10)
	if err != nil {
		return nil, pgvis.WrapError(err, "failed to get recent feeds")
	}

	var lastActivity time.Time
	if len(recentFeeds) > 0 {
		lastActivity = recentFeeds[0].GetTime()
	}

	return map[string]interface{}{
		"total_feeds":        totalCount,
		"unread_count":       unreadCount,
		"last_activity":      lastActivity,
		"user_last_feed":     user.LastFeed,
		"recent_feeds_count": len(recentFeeds),
	}, nil
}

// CleanupOldFeeds removes old feed entries to maintain performance.
// This function should be called periodically by a background job.
func CleanupOldFeeds(db *pgvis.DB, olderThan time.Duration) error {
	cutoffTime := time.Now().Add(-olderThan)
	cutoffTimestamp := cutoffTime.UnixMilli()

	log.Infof("Starting feed cleanup for entries older than %v", olderThan)

	deletedCount, err := db.Feeds.DeleteBefore(cutoffTimestamp)
	if err != nil {
		return pgvis.WrapError(err, "failed to cleanup old feeds")
	}

	if deletedCount > 0 {
		log.Infof("Cleaned up %d old feed entries", deletedCount)
	} else {
		log.Debugf("No old feed entries found for cleanup")
	}

	return nil
}

// TODO: WebSocket implementation for real-time feed updates
// func handleFeedWebSocket(db *pgvis.DB) echo.HandlerFunc {
//     return func(c echo.Context) error {
//         // WebSocket upgrade and real-time feed streaming
//         // This would allow for instant feed updates without polling
//         return nil
//     }
// }

// TODO: Feed filtering and search functionality
// func handleFeedFilter(templates fs.FS, db *pgvis.DB) echo.HandlerFunc {
//     return func(c echo.Context) error {
//         // Filter feeds by type, date range, user, etc.
//         return nil
//     }
// }

// TODO: Feed export functionality
// func handleFeedExport(db *pgvis.DB) echo.HandlerFunc {
//     return func(c echo.Context) error {
//         // Export feeds to JSON, CSV, or other formats
//         return nil
//     }
// }

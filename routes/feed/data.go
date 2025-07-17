// Package feed data handling and rendering.
//
// This file provides HTTP handlers for feed data operations, including
// data retrieval, rendering, and real-time updates. It handles the core
// feed display logic and integrates with the template system for
// dynamic content rendering.
//
// Key Features:
//   - Feed data retrieval with pagination
//   - Template rendering for feed items
//   - User activity tracking and updates
//   - Performance optimization for large feeds
//   - Error handling and logging
package feed

import (
	"fmt"
	"html/template"
	"io/fs"
	"net/http"
	"strings"
	"time"

	"github.com/charmbracelet/log"
	"github.com/labstack/echo/v4"

	"github.com/knackwurstking/pg-vis/pgvis"
	"github.com/knackwurstking/pg-vis/routes/utils"
)

// Constants for feed data handling
const (
	// DefaultFeedDataLimit defines the default number of feed items to retrieve
	DefaultFeedDataLimit = 50
	// MaxFeedDataLimit defines the maximum number of feed items per request
	MaxFeedDataLimit = 200
	// FeedItemTemplate defines the HTML template for individual feed items
	FeedItemTemplate = `<article id="feed-%d" class="feed-item" data-feed-id="%d" role="article">
		<header class="feed-item-header">
			<div class="feed-meta">
				<span class="feed-id">#%d</span>
				<time datetime="%s" title="%s">%s</time>
			</div>
		</header>
		<main class="feed-content">%s</main>
		<footer class="feed-footer">
			<small class="feed-timestamp">%s</small>
		</footer>
	</article>`
)

// Data represents the data structure for feed rendering.
// It contains the feed items and associated metadata for template rendering.
type Data struct {
	// Feeds contains the list of feed items to display
	Feeds []*pgvis.Feed `json:"feeds"`

	// TotalCount contains the total number of available feeds
	TotalCount int `json:"total_count"`

	// HasMore indicates if there are more feeds available
	HasMore bool `json:"has_more"`

	// LoadedAt contains the timestamp when this data was loaded
	LoadedAt time.Time `json:"loaded_at"`

	// UserLastFeed contains the user's last viewed feed ID
	UserLastFeed int `json:"user_last_feed"`
}

// Render generates HTML content for a feed item with enhanced formatting.
// It creates a structured, accessible HTML representation of the feed entry.
//
// Parameters:
//   - f: The feed item to render
//
// Returns:
//   - template.HTML: Safe HTML content for template rendering
func (d *Data) Render(f *pgvis.Feed) template.HTML {
	if f == nil {
		return template.HTML(`<div class="feed-error">Invalid feed item</div>`)
	}

	// Format timestamps
	feedTime := time.UnixMilli(f.Time).Local()
	isoTime := feedTime.Format(time.RFC3339)
	displayTime := feedTime.Format("02.01.2006 15:04")
	tooltipTime := feedTime.Format("Monday, 02. January 2006 um 15:04:05")

	// Sanitize and enhance content
	content := enhanceFeedContent(f.Main)

	// Generate the feed item HTML
	html := fmt.Sprintf(FeedItemTemplate,
		f.ID,                         // article id
		f.ID,                         // data-feed-id
		f.ID,                         // feed ID display
		isoTime,                      // datetime attribute
		tooltipTime,                  // title tooltip
		displayTime,                  // time display
		content,                      // main content
		formatRelativeTime(feedTime), // footer timestamp
	)

	return template.HTML(html)
}

// GetFeedCount returns the number of feeds in the data set.
func (d *Data) GetFeedCount() int {
	if d.Feeds == nil {
		return 0
	}
	return len(d.Feeds)
}

// IsEmpty returns true if there are no feeds in the data set.
func (d *Data) IsEmpty() bool {
	return d.GetFeedCount() == 0
}

// GetLatestFeedID returns the ID of the most recent feed, or 0 if no feeds.
func (d *Data) GetLatestFeedID() int {
	if d.IsEmpty() {
		return 0
	}
	return d.Feeds[0].ID
}

// GetOldestFeedID returns the ID of the oldest feed, or 0 if no feeds.
func (d *Data) GetOldestFeedID() int {
	if d.IsEmpty() {
		return 0
	}
	return d.Feeds[len(d.Feeds)-1].ID
}

// GETData handles the request to retrieve and render feed data.
// It loads feed items from the database, updates user activity,
// and renders the data using templates.
//
// Parameters:
//   - templates: File system containing HTML templates
//   - c: Echo context for the HTTP request
//   - db: Database connection for data operations
//
// Returns:
//   - *echo.HTTPError: HTTP error if the operation fails
func GETData(templates fs.FS, c echo.Context, db *pgvis.DB) *echo.HTTPError {
	// Log the data request
	utils.LogRequest(c, "Feed data request")

	// Get authenticated user
	user, httpErr := utils.GetUserFromContext(c)
	if httpErr != nil {
		log.Warnf("Unauthorized feed data access: %v", httpErr)
		return httpErr
	}

	// Parse pagination parameters
	offset, limit, httpErr := parseFeedDataParams(c)
	if httpErr != nil {
		return httpErr
	}

	log.Debugf("Loading feed data for user %s: offset=%d, limit=%d",
		user.UserName, offset, limit)

	// Initialize data structure
	data := &Data{
		Feeds:        make([]*pgvis.Feed, 0),
		LoadedAt:     time.Now(),
		UserLastFeed: user.LastFeed,
	}

	// Load feeds from database
	if err := loadFeedData(data, offset, limit, db); err != nil {
		log.Errorf("Failed to load feed data for user %s: %v", user.UserName, err)
		return utils.HandlePgvisError(c, err)
	}

	// Update user's last feed view
	if err := updateUserLastFeedView(user, data, db); err != nil {
		log.Warnf("Failed to update last feed for user %s: %v", user.UserName, err)
		// Don't fail the request, just log the warning
	}

	// Render the feed data template
	return renderFeedDataTemplate(c, templates, data)
}

// parseFeedDataParams extracts and validates pagination parameters from the request.
func parseFeedDataParams(c echo.Context) (offset, limit int, httpErr *echo.HTTPError) {
	// Parse offset parameter
	offset, httpErr = utils.ParseIntQuery(c, "offset", 0, 0, 10000)
	if httpErr != nil {
		return 0, 0, httpErr
	}

	// Parse limit parameter
	limit, httpErr = utils.ParseIntQuery(c, "limit", DefaultFeedDataLimit, 1, MaxFeedDataLimit)
	if httpErr != nil {
		return 0, 0, httpErr
	}

	return offset, limit, nil
}

// loadFeedData retrieves feed data from the database and populates the data structure.
func loadFeedData(data *Data, offset, limit int, db *pgvis.DB) error {
	// Load feeds with pagination
	feeds, err := db.Feeds.ListRange(offset, limit)
	if err != nil {
		return pgvis.WrapErrorf(err, "failed to load feeds (offset: %d, limit: %d)", offset, limit)
	}

	// Populate data structure
	data.Feeds = feeds

	// Get total count for pagination info
	totalCount, err := db.Feeds.Count()
	if err != nil {
		log.Warnf("Failed to get total feed count: %v", err)
		// Don't fail the request, just set a reasonable estimate
		data.TotalCount = len(feeds)
	} else {
		data.TotalCount = totalCount
	}

	// Determine if there are more feeds available
	data.HasMore = (offset + len(feeds)) < data.TotalCount

	log.Debugf("Loaded %d feeds (total: %d, has_more: %t)",
		len(feeds), data.TotalCount, data.HasMore)

	return nil
}

// updateUserLastFeedView updates the user's last viewed feed to track reading progress.
func updateUserLastFeedView(user *pgvis.User, data *Data, db *pgvis.DB) error {
	if data.IsEmpty() {
		return nil
	}

	// Get the most recent feed ID
	latestFeedID := data.GetLatestFeedID()

	// Only update if this is newer than the user's current last feed
	if latestFeedID > user.LastFeed {
		// Create updated user object
		updatedUser := &pgvis.User{
			TelegramID: user.TelegramID,
			UserName:   user.UserName,
			ApiKey:     user.ApiKey,
			LastFeed:   latestFeedID,
		}

		// Update in database
		if err := db.Users.Update(user.TelegramID, updatedUser); err != nil {
			return pgvis.WrapErrorf(err,
				"failed to update last feed for user %s from %d to %d",
				user.UserName, user.LastFeed, latestFeedID)
		}

		log.Debugf("Updated last feed for user %s: %d -> %d",
			user.UserName, user.LastFeed, latestFeedID)

		// Update local user object
		user.LastFeed = latestFeedID
		data.UserLastFeed = latestFeedID
	}

	return nil
}

// renderFeedDataTemplate renders the feed data using the appropriate template.
func renderFeedDataTemplate(c echo.Context, templates fs.FS, data *Data) *echo.HTTPError {
	// Parse the feed data template
	t, err := template.ParseFS(templates, "templates/feed/data.html")
	if err != nil {
		log.Errorf("Failed to parse feed data template: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError,
			"Failed to load feed template")
	}

	// Execute the template with feed data
	if err := t.Execute(c.Response(), data); err != nil {
		log.Errorf("Failed to execute feed data template: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError,
			"Failed to render feed data")
	}

	log.Debugf("Successfully rendered %d feed items", data.GetFeedCount())
	return nil
}

// enhanceFeedContent processes and enhances feed content for better display.
func enhanceFeedContent(content string) string {
	if content == "" {
		return `<p class="feed-empty">No content available</p>`
	}

	// Basic content enhancement
	enhanced := strings.TrimSpace(content)

	// Add CSS classes for better styling if content doesn't already have them
	if !strings.Contains(enhanced, "class=") {
		// Wrap plain text in paragraph tags
		if !strings.Contains(enhanced, "<") {
			enhanced = fmt.Sprintf(`<p class="feed-text">%s</p>`, enhanced)
		}
	}

	return enhanced
}

// formatRelativeTime formats a time as a relative time string in German.
func formatRelativeTime(t time.Time) string {
	duration := time.Since(t)

	switch {
	case duration < time.Minute:
		return "gerade eben"
	case duration < time.Hour:
		minutes := int(duration.Minutes())
		if minutes == 1 {
			return "vor 1 Minute"
		}
		return fmt.Sprintf("vor %d Minuten", minutes)
	case duration < 24*time.Hour:
		hours := int(duration.Hours())
		if hours == 1 {
			return "vor 1 Stunde"
		}
		return fmt.Sprintf("vor %d Stunden", hours)
	case duration < 7*24*time.Hour:
		days := int(duration.Hours() / 24)
		if days == 1 {
			return "vor 1 Tag"
		}
		return fmt.Sprintf("vor %d Tagen", days)
	case duration < 30*24*time.Hour:
		weeks := int(duration.Hours() / (24 * 7))
		if weeks == 1 {
			return "vor 1 Woche"
		}
		return fmt.Sprintf("vor %d Wochen", weeks)
	default:
		return t.Format("02.01.2006")
	}
}

// GetFeedDataStatistics returns statistics about the feed data.
func GetFeedDataStatistics(db *pgvis.DB) (map[string]interface{}, error) {
	// Get total feed count
	totalCount, err := db.Feeds.Count()
	if err != nil {
		return nil, pgvis.WrapError(err, "failed to get total feed count")
	}

	// Get recent feeds for analysis
	recentFeeds, err := db.Feeds.ListRange(0, 100)
	if err != nil {
		return nil, pgvis.WrapError(err, "failed to get recent feeds")
	}

	// Calculate statistics
	var oldestTime, newestTime time.Time
	if len(recentFeeds) > 0 {
		newestTime = recentFeeds[0].GetTime()
		oldestTime = recentFeeds[len(recentFeeds)-1].GetTime()
	}

	// Calculate activity rate (feeds per day)
	var activityRate float64
	if len(recentFeeds) > 1 {
		timeSpan := newestTime.Sub(oldestTime)
		if timeSpan > 0 {
			activityRate = float64(len(recentFeeds)) / timeSpan.Hours() * 24
		}
	}

	return map[string]interface{}{
		"total_feeds":   totalCount,
		"recent_feeds":  len(recentFeeds),
		"newest_time":   newestTime,
		"oldest_time":   oldestTime,
		"activity_rate": activityRate, // feeds per day
		"last_updated":  time.Now(),
	}, nil
}

// ValidateFeedData validates feed data for consistency and correctness.
func ValidateFeedData(data *Data) error {
	if data == nil {
		return pgvis.NewValidationError("data", "feed data cannot be nil", nil)
	}

	// Validate feed count consistency
	if data.Feeds == nil {
		data.Feeds = make([]*pgvis.Feed, 0)
	}

	actualCount := len(data.Feeds)
	expectedCount := data.GetFeedCount()

	if actualCount != expectedCount {
		return pgvis.NewValidationError("feed_count",
			"inconsistent feed count", map[string]int{
				"actual":   actualCount,
				"expected": expectedCount,
			})
	}

	// Validate individual feed items
	for i, feed := range data.Feeds {
		if feed == nil {
			return pgvis.NewValidationError("feed",
				fmt.Sprintf("feed at index %d is nil", i), i)
		}

		if feed.ID <= 0 {
			return pgvis.NewValidationError("feed_id",
				fmt.Sprintf("invalid feed ID at index %d", i), feed.ID)
		}

		if feed.Time <= 0 {
			return pgvis.NewValidationError("feed_time",
				fmt.Sprintf("invalid feed timestamp at index %d", i), feed.Time)
		}
	}

	return nil
}

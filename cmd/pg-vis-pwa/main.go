package main

import (
	"os"
	"pg-vis-pwa/ui"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

var (
	ServerAddr = os.Getenv("PGVISPWA_SERVER_ADDR")
	ServerPath = os.Getenv("PGVISPWA_SERVER_PATH")
)

func init() {
	if ServerAddr == "" {
		panic("Environment variable missing: PGVISPWA_SERVER_ADDR")
	}
}

func main() {
	e := echo.New()

	setHandlers(e)

	e.Use(middleware.Logger())

	if err := e.Start(ServerAddr); err != nil {
		e.Logger.Fatal(err)
	}
}

func setHandlers(e *echo.Echo) {
	e.GET(ServerPath+"/*", echo.StaticDirectoryHandler(ui.Dist(), false))
}

define SYSTEMD_SERVICE_FILE
[Unit]
Description=PG Vis PWA
After=network.target

[Service]
EnvironmentFile=%h/.config/rpi-server-project/.env
ExecStart=pg-vis-pwa

[Install]
WantedBy=default.target
endef

init:
	@cd ui && npm install || exit $?
	@go mod tidy -v || exit $?

build:
	@cd ui && npm run build || exit $?
	@go mod tidy -v || exit $?
	@go build -v -o ./bin/pg-vis-pwa ./cmd/pg-vis-pwa || exit $?

export SYSTEMD_SERVICE_FILE
linux-install:
	@echo "$$SYSTEMD_SERVICE_FILE" > ${HOME}/.config/systemd/user/pg-vis-pwa.service || exit $?

	@systemctl --user daemon-reload

	@echo "--> Created a service file @ ${HOME}/.config/systemd/user/pg-vis-pwa.service"

	@sudo cp ./bin/pg-vis-pwa /usr/local/bin/ || exit $?

linux-start:
	@systemctl --user restart pg-vis-pwa || exit $?

linux-stop:
	@systemctl --user stop pg-vis-pwa || exit $?

linux-log:
	@journalctl --user -u pg-vis-pwa --follow --output cat

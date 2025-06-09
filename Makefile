all: init build

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

clean:
	git clean -xfd

init:
	@cd ui && npm ci
	@go mod tidy -v 

build:
	@cd ui && make build-web
	@go mod tidy -v 
	@go build -v -o ./bin/pg-vis-pwa ./cmd/pg-vis-pwa 

export SYSTEMD_SERVICE_FILE
linux-install:
	@echo "$$SYSTEMD_SERVICE_FILE" > ${HOME}/.config/systemd/user/pg-vis-pwa.service 
	@systemctl --user daemon-reload
	@echo "--> Created a service file @ ${HOME}/.config/systemd/user/pg-vis-pwa.service"
	@sudo cp ./bin/pg-vis-pwa /usr/local/bin/ 

linux-start:
	@systemctl --user restart pg-vis-pwa 

linux-stop:
	@systemctl --user stop pg-vis-pwa 

linux-log:
	@journalctl --user -u pg-vis-pwa --follow --output cat

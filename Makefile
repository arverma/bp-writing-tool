.PHONY: help setup dev build clean

help:
	@echo "Available targets:"
	@echo "  setup   - Install Node.js and Python dependencies, set up Python venv"
	@echo "  dev     - Run the Electron app in development mode"
	@echo "  build   - Build the Electron app and create DMG"
	@echo "  clean   - Remove build output and Python venv"

setup:
	npm install
	cd python && python3 -m venv venv && \
		. venv/bin/activate && \
		pip install -r requirements.txt
	@mkdir -p assets

# Run Electron app in dev mode
# (Python venv must be set up first)
dev:
	npm run dev

# Build Electron app and DMG
build: setup
	npm run build

# Clean build output and Python venv
clean:
	rm -rf dist python/venv 
.PHONY: install test lint run up full-engines

install:
	python -m pip install -e ".[dev]"

test:
	pytest -q

lint:
	ruff check src tests

run:
	uvicorn permit_signal.api:app --reload

up:
	docker compose up --build

full-engines:
	INSTALL_FULL_ENGINES=true docker compose build --no-cache

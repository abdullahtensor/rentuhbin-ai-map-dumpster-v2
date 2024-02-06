#!/bin/bash

export $(cat .env | xargs)
echo "Running server on port $PORT"
MYPYPATH=./src mypy src/app/main.py
cd src/

uvicorn app.main:app --host 0.0.0.0 --reload --port $BACKEND_PORT&
#uvicorn app.main:app --reload

cd ../frontend/

# Start both the backend and frontend concurrently
npm ci
npm start --host 0.0.0.0 &

# Wait for both processes to finish
wait

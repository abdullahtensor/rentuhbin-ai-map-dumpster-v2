# #!/bin/bash

# export $(cat .env | xargs)
# echo "Running server on port $PORT"

# MYPYPATH=./src mypy src/app/main.py

# if [ $? -ne 0 ]; then
#     echo "Mypy had some errors please fix before proceeding..."
#     exit $?
# fi


# black src/
# pylint -j4 src/
# cd src/

# uvicorn app.main:app --reload

# cd ..


#!/bin/bash

#!/bin/bash

export $(cat .env | xargs)
echo "Running server on port $PORT"

# Run MyPy checks
MYPYPATH=./src mypy src/app/main.py

if [ $? -ne 0 ]; then
    echo "Mypy had some errors please fix before proceeding..."
    exit $?
fi

# Format code using Black
black src/

# Run pylint
pylint -j4 src/

# Change to the backend directory
cd src/

# Start the backend server using uvicorn
uvicorn app.main:app --host 0.0.0.0 --reload --port $BACKEND_PORT&
# uvicorn app.main:app --host 0.0.0.0 --port $PORT

# sleep 5
# Change to the frontend directory ('public' in this case)
cd ../frontend/

# Start both the backend and frontend concurrently
npm ci
npm start --host 0.0.0.0 &

# Wait for both processes to finish
wait

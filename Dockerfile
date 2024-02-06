FROM continuumio/miniconda3:23.5.2-0
# EXPOSE 8000
EXPOSE 8080
# EXPOSE 3000
# EXPOSE 80
# Install pre-commit

# Install Node.js and npm
RUN apt-get update && \
    apt-get install -y nodejs npm
WORKDIR /app

ADD ./scripts/setup.sh /app/scripts/setup.sh
ADD ./requirements.txt /app/requirements.txt
# ADD ./deps /app/deps

RUN bash ./scripts/setup.sh

RUN pip install -r requirements.txt
# RUN pip install pre-commit
# RUN pip install mypy -types
ADD ./ /app
CMD ["bash", "./scripts/run.sh"]
#!/usr/bin/env bash
if [ -z "$(docker images -q app)" ]; then
        docker build -t app .
fi

# xxx wrapper this somewhere
docker run -d --name app -p 3306:3306 -p 8081:8081 app

docker exec -it app bash

#!/bin/bash
case $1 in
    "build")
    case $2 in
        "inspect")
        case $3 in
            "--env-cp")
            echo "Copying new environment file"
            cp ./environment.ts ./coney-inspect/src/environments/environment.docker.prod.ts
            ;;
            *)
            ;;
        esac
        cd coney-inspect
        docker build --no-cache -t coney/coney-inspect .
        cd ..
        ;;
        "chat")
        case $3 in
            "--env-cp")
            echo "Copying new environment file"
            cp ./environment.ts ./coney-chat/src/environments/environment.docker.prod.ts
            ;;
            *)
            ;;
        esac
        cd coney-chat
        docker build --no-cache -t coney/coney-chat .
        cd ..
        ;;
        "create")
        case $3 in
            "--env-cp")
            echo "Copying new environment file"
            cp ./environment.ts ./coney-create/src/environments/environment.docker.prod.ts
            ;;
            *)
            ;;
        esac
        cd coney-create
        docker build --no-cache -t coney/coney-create .
        cd ..
        ;;
        "api")
        cd coney-api
        docker build --no-cache -t coney/coney-api .
        cd ..
        ;;
        "--env-cp")
        echo "Copying new environment file"
        cp ./environment.ts ./coney-create/src/environments/environment.docker.prod.ts
        cp ./environment.ts ./coney-chat/src/environments/environment.docker.prod.ts
        cp ./environment.ts ./coney-inspect/src/environments/environment.docker.prod.ts
        docker-compose build --no-cache
        ;;
        *)
        docker-compose build --no-cache
        ;;
    esac
    ;;
    "up")
    case $2 in
        "inspect")
        docker-compose up -d --no-deps coney-inspect
        ;;
        "chat")
        docker-compose up -d --no-deps coney-chat
        ;;
        "create")
        docker-compose up -d --no-deps coney-create
        ;;
        "api")
        docker-compose up -d --no-deps coney-api
        ;;
        *)
        docker-compose up -d --force-recreate
        ;;
    esac
    ;;
    "stop")
    case $2 in
        "inspect")
        docker-compose stop coney-inspect
        ;;
        "chat")
        docker-compose stop coney-chat
        ;;
        "create")
        docker-compose stop coney-create
        ;;
        "api")
        docker-compose stop coney-api
        ;;
        *)
        docker-compose down
        ;;
    esac
    ;;
    "help")
    echo -e "\nUsage: <command> [image] [options]"
    echo -e "\nCommands:  \n\t build \t\t Builds the selected image with the available 'environment.ts' file "
    echo -e "\t up \t\t Starts the selected container (all if no image is specified) "
    echo -e "\t stop \t\t Stops the selected container (all if no image is specified) \n "
    echo -e "Images:  \n\t api \t\t Coney's Application Programming Interface "
    echo -e "\t create \t Conversation editor"
    echo -e "\t chat \t\t User's chat endpoint"
    echo -e "\t inspect \t Realtime data visualization tool \n"
    echo -e "Options:  \n\t --env-cp \t Rewrites the environment.ts file in the Angular service(s)"
    ;;
    *)
    echo "Unknown command"    # unknown option
    ;;
esac
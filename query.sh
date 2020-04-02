#!/bin/sh

apk add --no-cache curl

while true;
do
    sleep 5
    if curl -s -I http://coney-neo4j:7474 | grep -q "200 OK"
    then
        echo "Neo4j Ready - Adding constraints"
        # Create constraint on conversation ids to avoid multiple insertion when starting containers multiple times
        curl -X POST -H 'Content-type: application/json' http://neo4j:coney@coney-neo4j:7474/db/data/transaction/commit -d '{"statements": [{"statement": "CREATE CONSTRAINT ON (c:Conversation) ASSERT c.conv_id IS UNIQUE;"}]}'
        echo "Neo4j Ready - Add coney-data"
        curl -X POST -H 'Content-type: application/json' http://neo4j:coney@coney-neo4j:7474/db/data/transaction/commit -d '{"statements": [{"statement": "MERGE (c:Conversation {conv_id: \"id-1956709265-1582704450313\", conv_title: \"Coney-demo\", conv_type: \"\", json_url: \"/opt/coney-data/Coney-demo.txt\", lang: \"en\", accessLevel: 1, status: \"saved\"});"}]}'
        break
    else
        echo "Neo4j Not Ready"
        continue
    fi
done 

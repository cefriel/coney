package com.cefriel.coneyapi.model.db.entities;

public class Edge {

    private int startId;
    private int endId;

    public Edge(int startId, int endId){
        this.endId = endId;
        this.startId = startId;
    }

    public int getStartId() { return startId; }

    public int getEndId() { return endId; }

}

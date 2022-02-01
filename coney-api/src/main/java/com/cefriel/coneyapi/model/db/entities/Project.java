package com.cefriel.coneyapi.model.db.entities;

import org.neo4j.ogm.annotation.GeneratedValue;
import org.neo4j.ogm.annotation.Id;

public class Project {

    @Id
    @GeneratedValue
    Long id;

    String name;

    public Project(){};

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}

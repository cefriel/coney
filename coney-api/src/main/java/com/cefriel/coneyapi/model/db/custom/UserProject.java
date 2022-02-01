package com.cefriel.coneyapi.model.db.custom;

import org.springframework.data.neo4j.annotation.QueryResult;

@QueryResult
public class UserProject {

    String projectName;
    int accessLevel;

    public UserProject(){}

    public String getProjectName() {
        return projectName;
    }

    public int getAccessLevel() {
        return accessLevel;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public void setAccessLevel(int accessLevel) {
        this.accessLevel = accessLevel;
    }
}

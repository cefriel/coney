package com.cefriel.coneyapi.model.db.entities;

import com.google.gson.JsonObject;
import org.neo4j.ogm.annotation.GeneratedValue;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Id;

@NodeEntity
public class Conversation implements Comparable<Object> {


	@Id @GeneratedValue
    Long id;

    private String conv_id;
    private String conv_title;
    private String json_url;
    private String status;
    private int access_level;
    private String lang;

    public Conversation() {
		super();
	}

	public String getJsonUrl() {
        return json_url;
    }

    public void setJsonUrl(String json_url) {
        this.json_url = json_url;
    }

    public String getConversationId() {
        return conv_id;
    }

    public void setConversationId(String conv_id) {
        this.conv_id = conv_id;
    }

    public String getTitle() {
        return conv_title;
    }

    public void setTitle(String conv_title) {
        this.conv_title = conv_title;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getAccess_level() {
        return access_level;
    }

    public void setAccess_level(int access_level) {
        this.access_level = access_level;
    }

    public String getLang() {
        return lang;
    }

    public void setLang(String lang) {
        this.lang = lang;
    }

    public int compareTo(Object o)
    {
        Conversation other = (Conversation) o;
        return conv_title.compareTo(other.conv_title);
    }

    public JsonObject toJson(){
        JsonObject conversationJson = new JsonObject();
        conversationJson.addProperty("conversationId", this.conv_id);
        conversationJson.addProperty("title", this.conv_title);
        conversationJson.addProperty("status", this.status);
        conversationJson.addProperty("accessLevel", this.access_level);
        return conversationJson;
    }
    
    
}

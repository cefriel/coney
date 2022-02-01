package com.cefriel.coneyapi.model.db.entities;

import org.neo4j.ogm.annotation.GeneratedValue;
import org.neo4j.ogm.annotation.Id;
import org.neo4j.ogm.annotation.NodeEntity;

@NodeEntity
public class Tag {
    @Id
    @GeneratedValue
    Long id;

    String text;
    int blockId;
    String conversationId;
    String templateId;


    public Tag(){
    }

    public Tag(String text){
        this.text = text;
    }
    public Tag(String text, int blockId, String conversationId){
        this.text = text;
        this.blockId = blockId;
        this.conversationId = conversationId;
    }

    public Tag(String text, String templateId){
        this.text = text;
        this.templateId = templateId;
    }

    public String getText() {
        return text;
    }

    public int getBlockId() {
        return blockId;
    }

    public String getConversationId() {
        return conversationId;
    }
}

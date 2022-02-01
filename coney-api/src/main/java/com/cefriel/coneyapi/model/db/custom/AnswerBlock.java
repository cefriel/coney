package com.cefriel.coneyapi.model.db.custom;
import org.springframework.data.neo4j.annotation.QueryResult;

@QueryResult
public class AnswerBlock {

    int reteId;
    int neo4jId;
    int nextQuestionId;
    String type;
    String subtype;
    String ofConversation;
    String text;
    int value;
    int order;

    public AnswerBlock(){}

    public int getReteId() {
        return reteId;
    }

    public void setReteId(int reteId) {
        this.reteId = reteId;
    }

    public int getNeo4jId() {
        return neo4jId;
    }

    public void getNeo4jId(int reteId) {
        this.neo4jId = reteId;
    }

    public int getNextQuestionId() {
        return nextQuestionId;
    }

    public void setNextQuestionId(int nextQuestionId) {
        this.nextQuestionId = nextQuestionId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSubtype() {
        return subtype;
    }

    public void setSubtype(String subtype) {
        this.subtype = subtype;
    }

    public String getOfConversation() {
        return ofConversation;
    }

    public void setOfConversation(String ofConversation) {
        this.ofConversation = ofConversation;
    }

    public String getText() {
        if(text != null && text.length()>4 && text.substring(0, 4).equals("----")){
            return text.substring(4);
        }
        return text == null ? "" : text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }

    public int getOrder() {
        return order;
    }

    public void setOrder(int order) {
        this.order = order;
    }
}

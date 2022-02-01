package com.cefriel.coneyapi.model.db.custom;
import org.springframework.data.neo4j.annotation.QueryResult;

@QueryResult
public class QuestionBlock implements Comparable<Object> {

    private int reteId;
    private int neo4jId;
    private Integer depth;
    private String type;
    private String subtype;
    private String ofConversation;
    private String text;
    private String questionType;

    private String tag;
    private int orderInConversation;
    private int answersAmount;


    public QuestionBlock(){}

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


    public Integer getDepth() {
        return depth;
    }

    public void setDepth(int depth) {
        this.depth = depth;
    }

    @Override
    public int compareTo(Object o) {
        QuestionBlock qb = (QuestionBlock) o;
        return depth.compareTo(qb.getDepth());
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
        return text == null ? "" : text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getQuestionType() {
        return questionType;
    }

    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }

    public int getOrderInConversation() {
        return orderInConversation;
    }

    public void setOrderInConversation(int orderInConversation) {
        this.orderInConversation = orderInConversation;
    }

    public int getAnswersAmount() {
        return answersAmount;
    }

    public void setAnswersAmount(int answersAmount) {
        this.answersAmount = answersAmount;
    }

    public String getTag() {
        return tag == null ? "" : tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }
}

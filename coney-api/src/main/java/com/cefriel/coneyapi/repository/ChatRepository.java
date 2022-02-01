package com.cefriel.coneyapi.repository;

import com.cefriel.coneyapi.model.db.entities.Block;
import com.cefriel.coneyapi.model.db.entities.Conversation;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends Neo4jRepository<Block, Long> {

    @Query("MATCH (c:Conversation) " +
            "WHERE c.status='published' " +
            "RETURN c LIMIT 1")
    Conversation getConversation();

    @Query("MATCH (c:Conversation) " +
            "WHERE c.conv_id = {0} AND c.status = 'published' " +
            "RETURN c LIMIT 1")
    Conversation getConversationById(String conversationId);

    @Query("MATCH (c:Conversation) " +
            "WHERE c.conv_id = {0}" +
            "RETURN c LIMIT 1")
    Conversation getConversationPreviewById(String conversationId);

    @Query("MATCH (c:Conversation {conv_id:{0}})<-[r:STARTEND {project_id:{1}}]-(u:User {user_id:{2}})" +
            "RETURN count(r)")
    int getStartCountForProject(String conversationId, String projectId, String userId);

    @Query("MATCH (c:Conversation {conv_id:{0}})-[:STARTS]->(n:Block)" +
            "RETURN n LIMIT 1")
    Block getFirstBlock(String conversationId);


    @Query("MATCH (prev {block_id:{0}})-[:LEADS_TO]->(o) " +
            "WHERE prev.of_conversation = {1} " +
            "RETURN o")
    List<Block> getNextBlock(int blockId, String conversationId);

    @Query("MATCH (b:Block {block_id:{0}}) " +
            "WHERE b.of_conversation = {1} " +
            "RETURN b LIMIT 1")
    Block getSingleBlockById(int blockId, String conversationId);

    @Query("MATCH (u:User {user_id:{0}})-[a:ANSWERED {session:{1}}]->(ans)<-[:LEADS_TO]-(b:Block {block_id: {2}})" +
            "WHERE b.of_conversation = {3} " +
            "DETACH DELETE a")
    void deleteAnswer(String userId, String session, int blockId, String conversationId);

    @Query("MATCH (u:User {user_id:{0}})-[a:STARTEND {session:{1}}]->(o:Conversation {conv_id:{2}}) " +
            "REMOVE a.end_timestamp")
    void deleteEndTimestamp(String userId, String session, String conversationId);

    @Query("MATCH (u:User {user_id:{0}}),(prev {block_id:{1}})-[:LEADS_TO]->(o)-[:LEADS_TO]->(next) " +
            "WHERE prev.of_conversation = {4} " +
            "MERGE (u)-[a:ANSWERED {timestamp:{2}, value:{3}, session:{5}}]->(o) " +
            "RETURN next")
    Block getNextOfSingleAnswerBlock(String userId, int blockId, String timestamp, String answer, String conversationId, String session);

    @Query("MATCH (u:User {user_id:{0}}),(prev {block_id:{1}})-[:LEADS_TO]->(o)-[:LEADS_TO]->(next) " +
            "WHERE prev.of_conversation = {4} AND o.order = {3} " +
            "MERGE (u)-[a:ANSWERED {timestamp:{2}, session:{5}}]->(o) " +
            "RETURN next")
    Block getNextOfMultipleAnswerBlock(String userId, int blockId, String timestamp, int answer, String conversationId, String session);

    @Query("MATCH (u:User {user_id:{0}}),(prev {block_id:{1}})-[:LEADS_TO]->(o)-[:LEADS_TO]->(next) " +
            "WHERE prev.of_conversation = {4} AND o.order = {3} " +
            "MERGE (u)-[a:ANSWERED {timestamp:{2}, session:{5}}]->(o) " +
            "RETURN next")
    Block getNextOfCheckboxAnswerBlock(String userId, int blockId, String timestamp, int answer, String conversationId, String session);

    @Query("MATCH (o:Conversation {conv_id:{1}}) " +
            "MERGE (u:User {user_id:{0}}) " +
            "CREATE (u)-[a:STARTEND {start_timestamp:{2}, session:{3}, project_name: {4}, project_id: {5}, lang: {6}}]->(o) " +
            "RETURN a.start_timestamp;")
    String createStartRelationship(String userId, String conversationId, String timestamp, String session, String projectName, String projectId, String lang);

    @Query("MATCH (u:User {user_id:{0}})-[a:STARTEND]->(o:Conversation {conv_id:{1}}) " +
            "WHERE a.session={3}" +
            "SET a.end_timestamp={2}" +
            "RETURN a.end_timestamp;")
    String createEndRelationship(String userId, String conversationId, String timestamp, String session);

    @Query("MATCH (u:User {user_id:{0}})-[a:STARTEND]->(o:Conversation {conv_id:{1}}) " +
            " WHERE NOT EXISTS(a.end_timestamp)" +
            "RETURN a.session LIMIT 1;")
    String wasTheConversationStarted(String userId, String conversationId);

    @Query("MATCH (u:User {user_id:{0}})-[a:STARTEND]->(o:Conversation {conv_id:{1}}) " +
            " WHERE EXISTS(a.end_timestamp)" +
            "RETURN a.session LIMIT 1;")
    String wasTheConversationFinished(String userId, String conversationId);

    @Query("MATCH (c:Conversation)<-[st:STARTEND {session:{2}}]-(u:User {user_id:{0}})-[a:ANSWERED {session:{2}}]->(ans) " +
            "WHERE ans.of_conversation = {1}" +
            "DETACH DELETE a, st")
    void deletePreviousAnswers(String userId, String conversationId, String session);

    @Query("MATCH (u:User {user_id:{0}})-[st:STARTEND {session: {2}}]->(c:Conversation {conv_id:{1}})," +
            "(prev:Block {block_id:{3}, of_conversation:{1}})-[:LEADS_TO]->(o:Block)<-[a:ANSWERED {session: {2}}]-(u) " +
            "WHERE NOT EXISTS(st.end_timestamp) " +
            "RETURN o")
    List<Block> getAnswerOfUser(String userId, String conversationId, String session, int blockId);

    @Query("MATCH (c:Conversation {conv_id:{0}}) RETURN c.conv_title LIMIT 1")
    String getConversationTitle(String conversationId);

    @Query("MATCH (c:Conversation {conv_id:{0}})-[:HAS_TRANSLATION]->(t:Translation) return t.lang")
    List<String> getLanguagesOfConversation(String conversationId);

    @Query("MATCH (c:Conversation {conv_id:{0}}) return c.lang")
    String getDefaultLanguageOfConversation(String conversationId);

    @Query("MATCH (c:Conversation {conv_id:{0}})-[:HAS_TRANSLATION]->(t:Translation {lang:{1}})-[:HAS_TT_NODE]->(tt:TTNode) " +
            "WHERE tt.of_block={2} return tt.text LIMIT 1")
    String getBlockTranslation(String conversationId, String lang, long blockId);

    @Query("MATCH (b:Block {of_conversation: {0}}) " +
            "WHERE b.block_id < 0 " +
            "DETACH DELETE b " +
            "RETURN count(b)>0 ")
    String deletePreviewBlocks(String conversationId);

    @Query("MATCH (b:User)-[a]->(z) " +
            "WHERE b.user_id=\"preview\" AND a.session={0} " +
            "DELETE a RETURN count(a)>0")
    String deletePreviewRelationships(String session);

    @Query("MATCH (u:User {user_id: 'preview'})-[rel]->(c) " +
            "WHERE c.of_conversation={0} OR c.conv_id={0} " +
            "DELETE rel")
    void deletePreviewUserOfConv(String conversationId);
}

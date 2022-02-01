package com.cefriel.coneyapi.repository;


import com.cefriel.coneyapi.model.db.custom.AnswerBlock;
import com.cefriel.coneyapi.model.db.custom.ConversationResponse;
import com.cefriel.coneyapi.model.db.custom.QuestionBlock;
import com.cefriel.coneyapi.model.db.custom.UserProject;
import com.cefriel.coneyapi.model.db.entities.Block;
import com.cefriel.coneyapi.model.db.entities.Conversation;
import com.cefriel.coneyapi.model.db.entities.Tag;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends Neo4jRepository<Conversation, Long> {

	@Query("MATCH (cust:Customer {username: {0}})-[wo:WORKS_ON]->(pr:Project)<-[:BELONGS_TO]-(c:Conversation) " +
			"WHERE wo.access_level >= c.access_level " +
			"RETURN c.conv_title AS conversationTitle, c.conv_id AS conversationId, " +
			"c.access_level AS accessLevel, c.status AS status, pr.name AS projectName")
	List<ConversationResponse> searchConversation(String customer);

	@Query("MATCH (c:Conversation) " +
			"RETURN c.conv_title AS conversationTitle, c.conv_id AS conversationId, " +
			"c.access_level AS accessLevel, c.status AS status")
	List<ConversationResponse> searchAllConversation();

	@Query("MATCH (cust:Customer {username: {0}})-[wo:WORKS_ON]->(pr:Project), " +
            "(pr)<-[bt:BELONGS_TO]-(c:Conversation {conv_id:{1}}) " +
            "RETURN EXISTS ( (cust)-[wo:WORKS_ON]-(pr)-[bt]-(c) ) AND wo.access_level >= c.access_level")
	String hasUserPermission(String username, String conversationId);

	@Query("MATCH (c:Customer {username: {0}}) RETURN c.password LIMIT 1")
	String getCustomerByUsername(String username);

	@Query("MATCH (c:Customer {username: {0}}) SET c.password={1} return c.password")
	String updateCustomerPassword(String username, String password);

	@Query("MATCH (c:Customer {username: {0}}) SET c.delete='true' ")
	void setCustomerForDeletion(String username);

	@Query("MATCH (c:Conversation {conv_id: {0}})" +
			" RETURN c.status")
	String getSingleConversationStatus(String conversationId);

	@Query("MATCH (c:Conversation) " +
			"WHERE c.conv_id = {0} " +
			"RETURN c.json_url")
	String findJsonUrlByConversationId(String conversationId);

	@Query("MATCH (c:Conversation {conv_id:{0}}) OPTIONAL MATCH " +
			"(c)-[:HAS_TRANSLATION]->(t:Translation)-[:HAS_TT_NODE]->(tt:TTNode) " +
			"DETACH DELETE c, t, tt " +
			"RETURN true")
	String deleteConversation(String conversationId);

	@Query("MATCH (c:Conversation) " +
			"WHERE c.conv_id = {0} " +
			"SET c.status = {1} " +
			"RETURN count(c)>0")
	String updateConversationStatus(String conversationId, String status);

	@Query("MATCH (conv:Conversation {conv_id: {1}})-[:BELONGS_TO]->(pr:Project)<-[:BELONGS_TO]-(c:Conversation) " +
			"WHERE c.conv_title = {0} " +
			"AND NOT c.conv_id = {1} " +
			"RETURN count(c)>0")
	String findExistingTitle(String title, String conversationId);

	@Query("MATCH (b:Block) " +
			"WHERE b.of_conversation={0} " +
			"DETACH DELETE b")
	void deleteConversationNodes(String conversationId);


	@Query("MERGE (c:Conversation {conv_id: {0}}) " +
			"SET c.conv_title= {1}, c.json_url= {2}, " +
			"c.status=\"saved\" " +
			"RETURN count(c)>0")
	String updateConversation(String conversationId, String title,
									  String jsonUrl);

	@Query("MERGE (c:Conversation {conv_id: {0}}) " +
			"MERGE (pr:Project {name: {3}}) " +
			"MERGE (c)-[:BELONGS_TO]->(pr) " +
			"SET c.conv_title= {1}, c.json_url= {2}, " +
			"c.status=\"saved\", c.access_level={4}, c.lang={5} " +
			"RETURN count(c)>0")
	String createOrUpdateNewConversation(String conversationId, String title,
									  String jsonUrl, String projectName, int accessLevel, String lang);

	@Query("MERGE (c:Conversation {conv_id: {0}}) " +
			"SET c.conv_title= {1}, c.json_url= {2}, " +
			"c.status=\"saved\", c.lang={3} " +
			"RETURN count(c)>0")
	String createOrUpdateNewOpenConversation(String conversationId, String title,
										 String jsonUrl, String lang);

	@Query("MATCH (c:Customer {username: {0}})-[wo:WORKS_ON]->(pr:Project) " +
			"RETURN pr.name AS projectName, wo.access_level AS accessLevel")
	List<UserProject> getCustomerProjects(String username);

	@Query("MATCH (c:Conversation {conv_id: {0}})-[:BELONGS_TO]->(pr:Project) " +
			"RETURN pr.name LIMIT 1")
	String getConversationProject(String conversationId);

	//CREATE CONVERSATION BLOCKS AND RELATIONSHIPS

	@Query("CREATE (b:Block {block_id: {0}, block_type: \"Question\", " +
			"block_subtype: {1}, text: {2}, of_conversation: {3}, visualization: {4}})" +
			"RETURN b.block_id")
	String uploadQuestionNode(int blockId, String block_subtype, String text, String of_conversation, String visualization);

	@Query("CREATE (b:Block {block_id: {0}, block_type: \"Talk\", block_subtype: {1}, " +
			"text: {2}, url: {3}, image_url: {4}, of_conversation: {5}})" +
			"RETURN b.block_id")
	String uploadTalkNode(int blockId, String block_subtype, String text, String url,
						  String image_url, String of_conversation);

	@Query("CREATE (b:Block {block_id: {0}, block_type: \"Answer\", block_subtype: {1}, " +
			"text: {2}, value: {3}, order: {4}, of_conversation: {5}, points: {6}})" +
			"RETURN b.block_id")
	String uploadAnswerNode(int blockId, String block_subtype, String text, int value, int order,
							String of_conversation, int points);

	@Query("MATCH (a:Block {block_id: {0}, of_conversation: {2}}),(b:Block {block_id: {1}, of_conversation: {2}})" +
			" CREATE (a)-[r:LEADS_TO]->(b)" +
			" RETURN type(r) AS res")
	List<String> uploadRelationships(int startId, int endId, String conversationId);


	//DELETE QUERIES
	@Query("MATCH (b:Block) " +
			"WHERE b.block_id = {0} " +
			"AND b.of_conversation = {1} " +
			"DETACH DELETE b")
	void deleteBlock(int blockId, String conversationId);

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

	@Query("MATCH (c:Conversation {conv_id: {0}})," +
			"(o:Block {of_conversation: {0}})-[:LEADS_TO]->(ob:Block) " +
			"WHERE NOT (o)<-[:LEADS_TO]-(:Block)" +
			"CREATE (c)-[:STARTS]->(o) " +
			"RETURN c.conv_id " +
			"LIMIT 1")
	String createStartRelationship(String conversationId);


	@Query("MATCH (b:Block {block_id: {1}, of_conversation:{0}}) MERGE (t:Tag {text:{2}})" +
			"CREATE (t)<-[rel:ABOUT]-(b)" +
			"RETURN type(rel)")
	String createTagsAndRelationship(String conversationId, int blockId, String tagName);

	@Query("MERGE (t:Tag {text: {0}}) RETURN t.text")
	String uploadTags(String tag);


	@Query("MATCH (t:Tag) " +
			"RETURN DISTINCT t")
	List<Tag> searchTags(String conversationId);

	@Query("MATCH (c:Conversation {conv_id:{0}})-[:STARTS|LEADS_TO*]->(b:Block) " +
			"WHERE b.block_type='Question' return DISTINCT b")
	List<Block> getOrderedQuestions(String conversationId);

	@Query("MATCH (b:Block {block_id: {0}, of_conversation: {1}})-[:LEADS_TO]->(a:Block {block_type: 'Answer'}) return a")
	List<Block> getAnswersToQuestion(int blockId, String conversationId);

	//TEST
	@Query("MATCH (c:Conversation {conv_id:{0}})-[a:STARTS|LEADS_TO*]->(b:Block) " +
			"WHERE b.block_type='Question' WITH b, LENGTH(a) AS depth  return DISTINCT " +
			"id(b) as neo4jId, b.block_id as reteId, " +
			"b.block_type as type, b.block_subtype as subtype, b.of_conversation as ofConversation, " +
			"b.visualization as questionType, b.text as text, depth")
	List<QuestionBlock> getOrderedQuestionsToPrint(String conversationId);

	@Query("MATCH (b:Block {block_id: {0}, of_conversation: {1}})-[:LEADS_TO]->(a:Block {block_type: 'Answer'})" +
			" OPTIONAL MATCH n=(a)-[:LEADS_TO*]->(nq:Block {block_type:\"Question\"}) " +
			" WITH a,nq ORDER BY length(n) ASC " +
			" RETURN DISTINCT id(a) as neo4jId, a.block_id as reteId, " +
			"a.block_type as type, a.block_subtype as subtype, a.of_conversation as ofConversation, " +
			"a.value as value, a.text as text, a.order as order, nq.block_id as nextQuestionId LIMIT {2}")
	List<AnswerBlock> getAnswersToQuestionToPrint(int blockId, String conversationId, int answersAmount);

	@Query("MATCH (b:Block {of_conversation: {1}})-[:LEADS_TO]->(a:Block {block_type: 'Answer'}) " +
			"WHERE id(b)={0} return count(a)")
	int getAnswersOfBlockAmount(int blockId, String conversationId);
	// TEST


	@Query("MATCH (t:Tag)<-[:ABOUT]-(b:Block {block_id:{0}, of_conversation: {1}}) return t.text LIMIT 1")
	String getTagOfBlock(int blockId, String conversationId);

	@Query("MATCH (c:Conversation {conv_id:{0}}) MERGE (c)-[:HAS_TRANSLATION]->(t:Translation {lang:{1}}) " +
			"MERGE (t)-[:HAS_TT_NODE]->(tt:TTNode {of_block:{2}}) SET tt.text={3} return tt.text")
	String uploadBlockTranslation(String conversationId, String lang, int block_id, String text );


	@Query("Match (c:Conversation {conv_id:{0}})-[:STARTS|LEADS_TO*]->(b:Block) " +
			"WHERE b.block_type={1} return DISTINCT b")
	List<Block> getOrderedBlocksOfType(String conversationId, String blockType);
}

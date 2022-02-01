package com.cefriel.coneyapi.repository;

import com.cefriel.coneyapi.model.db.entities.Block;
import com.cefriel.coneyapi.model.db.entities.Conversation;
import com.cefriel.coneyapi.model.db.custom.UserProject;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminRepository extends Neo4jRepository<Block, Long> {

    //GET METHODS

    @Query("MATCH (c:Customer) return c.username")
    List<String> getCustomers();

    @Query("MATCH (c:Customer)-[:WORKS_ON]->(pr:Project {name:{0}}) " +
            "RETURN c.username")
    List<String> getCustomersOfProject(String projectName);

    @Query("MATCH (cust:Customer)-[wo:WORKS_ON]->(pr:Project)<-[:BELONGS_TO]-(c:Conversation {conv_id: {0}}) " +
            "WHERE wo.access_level >= c.access_level " +
            "RETURN cust.username")
    List<String> getCustomersOfConversation(String conversationId);

    @Query("MATCH (cust:Customer)-[wo:WORKS_ON]->(pr:Project {name: {1}})<-[:BELONGS_TO]-(c:Conversation {conv_id: {0}}) \" +\n" +
            " WHERE wo.access_level >= c.access_level " +
            " RETURN cust.username")
    List<String> getCustomersOfConversationAndProject(String conversationId, String projectName);

    @Query("MATCH (c:Conversation) RETURN c")
    List<Conversation> getConversations();

    @Query("MATCH (c:Conversation)-[:BELONGS_TO]->(pr:Project {name: {0}}) RETURN c")
    List<Conversation> getConversationsOfProject(String projectName);

    @Query("MATCH (cust:Customer {username: {0}})-[wo:WORKS_ON]->(pr:Project)<-[:BELONGS_TO]-(c:Conversation) " +
            "WHERE wo.access_level >= c.access_level " +
            "RETURN c")
    List<Conversation> getConversationsOfCustomer(String username);

    @Query("MATCH (cust:Customer {username: {0}})-[wo:WORKS_ON]->(pr:Project {name: {1}})<-[:BELONGS_TO]-(c:Conversation) " +
            "WHERE wo.access_level >= c.access_level " +
            "RETURN c")
    List<Conversation> getConversationsOfCustomerAndProject(String username, String projectName);

    @Query("MATCH (pr:Project) return pr.name AS projectName")
    List<UserProject> getProjects();

    @Query("MATCH (c:Customer {username: {0}})-[wo:WORKS_ON]->(pr:Project) " +
            "RETURN pr.name AS projectName, wo.access_level AS accessLevel")
    List<UserProject> getProjectsOfCustomer(String username);

    @Query("MATCH (c:Conversation {conv_id: {0}})-[:BELONGS_TO]->(pr:Project) RETURN pr.name AS projectName")
    List<UserProject> getProjectOfConversation(String conversationId);

    @Query("MATCH (c:Customer {username: {0}})-[wo:WORKS_ON]->(pr:Project)" +
            "<-[:BELONGS_TO]-(co:Conversation {conv_id: {1}}) " +
            "RETURN pr.name AS projectName, wo.access_level AS accessLevel")
    List<UserProject> getProjectsOfCustomerAndConversation(String username, String conversationId);


    //CREATE METHODS

    @Query("MATCH (c:Customer {username:{0}}) RETURN count(c)")
    int checkIfUsernameIsTaken(String username);

    @Query("CREATE (c:Customer {username: {0}, password: {1}}) return c.username")
    String createCustomer(String username, String password);

    @Query("CREATE (pr:Project {name: {0}}) return pr.name")
    String createProject(String projectName);

    @Query("MATCH (c:Conversation {conv_id: {0}}), (pr:Project {name: {1}}) " +
            "MERGE (c)-[wo:BELONGS_TO]->(pr) RETURN count(wo)>0")
    boolean linkConversationToProject(String conversationId, String projectName);

    @Query("MATCH (c:Customer {username: {0}}), (pr:Project {name: {1}}) " +
            "MERGE (c)-[wo:WORKS_ON]->(pr) " +
            "SET wo.access_level = {2} " +
            "RETURN wo.access_level")
    int linkCustomerToProject(String username, String projectName, int accessLevel);


    //EDIT METHODS

    @Query("MATCH (c:Conversation  {conv_id: {0}}) " +
            "SET c.access_level = {1} " +
            "RETURN c.access_level")
    int changeConversationAccessLevel(String conversationId, int accessLevel);

    @Query("MATCH (c:Customer {username: {0}})-[wo:WORKS_ON]->(pr:Project { name: {1}}) " +
            "SET wo.access_level = {2} " +
            "RETURN wo.access_level")
    int changeCustomerProjectAccessLevel(String username, String projectName, int access_level);

    @Query("MATCH (c:Customer {username: {0}}) " +
            "SET c.password = {1} " +
            "RETURN c.password")
    String changeCustomerPassword(String username, String newPassword);

    @Query("MATCH (pr:Project {name: {0}}) " +
            "SET pr.name = {1} " +
            "RETURN pr.name")
    String changeProjectName(String oldName, String newName);

    //DELETE METHODS

    @Query("MATCH (c:Customer {username: {0}}) DETACH DELETE c")
    void deleteCustomer(String username);

    @Query("MATCH (pr:Project {name: {0}}) DETACH DELETE pr")
    void deleteProject(String projectName);

    @Query("MATCH (c:Conversation {conv_id: {0}})-[bt:BELONGS_TO]->(pr:Project {name: {1}}) " +
            "DELETE bt")
    void deleteConversationProjectLink(String conversationId, String projectName);

    @Query("MATCH (c:Customer {username: {0}})-[wo:WORKS_ON]->(pr:Project {name: {1}}) " +
            "DELETE wo")
    void deleteCustomerProjectLink(String username, String projectName);


    //UTILITY METHODS

    @Query("MATCH (c:Customer {username: {0}}) " +
            "RETURN count(c)>0 ")
    boolean isUsernameTaken(String username);

    @Query("MATCH (pr:Project {name: {0}}) " +
            "RETURN count(pr)>0 ")
    boolean isProjectNameTaken(String projectName);

    @Query("MATCH (c:Customer {username: {0}}) " +
            "RETURN c.adm")
    String isUserAdmin(String username);
}

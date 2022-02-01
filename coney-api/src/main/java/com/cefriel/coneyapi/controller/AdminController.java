package com.cefriel.coneyapi.controller;


import com.cefriel.coneyapi.exception.MethodNotAllowedException;
import com.cefriel.coneyapi.model.db.entities.Conversation;
import com.cefriel.coneyapi.model.db.custom.UserProject;
import com.cefriel.coneyapi.service.AdminService;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import io.swagger.annotations.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/adm/")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);
    private AdminService adminService;

    public AdminController(AdminService adminService){
        this.adminService = adminService;
    }

    @ApiOperation(value = "Returns filterd customers")
    @RequestMapping(value = "/getCustomers", method = RequestMethod.POST)
    public List<String> getCustomers(@RequestBody String data) {

        JsonParser parser = new JsonParser();
        JsonObject json = (JsonObject) parser.parse(data);
        String filterType = json.get("filter").getAsString();


        logger.info("[CONTROL] Getting customers with "+filterType+" filter");
        String filter = "";
        String filter2 = "";
        if(filterType.equals("project")){
            filter = json.get("projectName").getAsString();
        } else if(filterType.equals("conversation")){
            filter = json.get("conversationId").getAsString();
        } else if(filterType.equals("both")){
            filter = json.get("conversationId").getAsString();
            filter2 = json.get("projectName").getAsString();
        }

        return adminService.getCustomers(filterType, filter, filter2);
    }

    @ApiOperation(value = "Returns filterd conversations")
    @RequestMapping(value = "/getConversations", method = RequestMethod.POST)
    public List<Conversation> getConversations(@RequestBody String data) {

        JsonParser parser = new JsonParser();
        JsonObject json = (JsonObject) parser.parse(data);
        String filterType = json.get("filter").getAsString();

        logger.info("[CONTROL] Getting conversations with "+filterType+" filter");
        String filter = "";
        String filter2 = "";

        if(filterType.equals("project")){
            filter = json.get("projectName").getAsString();
        } else if(filterType.equals("customer")){
            filter = json.get("username").getAsString();
        } else if(filterType.equals("both")){
            filter = json.get("username").getAsString();
            filter2 = json.get("projectName").getAsString();
        }

        return adminService.getConversations(filterType, filter, filter2);
    }

    @ApiOperation(value = "Returns filterd projects")
    @RequestMapping(value = "/getProjects", method = RequestMethod.POST)
    public List<UserProject> getProjects(@RequestBody String data) {

        JsonParser parser = new JsonParser();
        JsonObject json = (JsonObject) parser.parse(data);
        String filterType = json.get("filter").getAsString();

        logger.info("[CONTROL] Getting customers with "+filterType+" filter");
        String filter = "";
        String filter2 = "";
        if(filterType.equals("customer")){
            filter = json.get("username").getAsString();
        } else if(filterType.equals("conversation")){
            filter = json.get("conversationId").getAsString();
        } else if(filterType.equals("both")){
            filter2 = json.get("conversationId").getAsString();
            filter = json.get("username").getAsString();
        }

        return adminService.getProjects(filterType, filter, filter2);
    }


    @ApiOperation(value = "Inserts data in DB")
    @RequestMapping(value = "/insertData", method = RequestMethod.POST)
    public boolean insertData(@RequestBody String data) throws MethodNotAllowedException {

        JsonParser parser = new JsonParser();
        JsonObject json = (JsonObject) parser.parse(data);
        String filterType = json.get("filter").getAsString();
        boolean res;
        logger.info("[CONTROL] Inserting "+filterType+" data in db");

        switch (filterType) {
            case "customer": {
                logger.info("[CONTROL] Inserting Customer");
                String username = json.get("username").getAsString();
                String password = json.get("password").getAsString();
                String qry = adminService.createCustomer(username, password);

                if(qry.equals("auth")){
                    logger.error("[CONTROL] Not authorized");
                    return false;
                } else if (qry.equals("taken")){
                    logger.error("[CONTROL] The username is already taken");
                    throw new MethodNotAllowedException("The username is already taken");
                } else {
                    res = qry.equals(username);
                }
                break;
            }
            case "project": {
                logger.info("[CONTROL] Inserting Project");
                String projectName = json.get("projectName").getAsString();
                res = adminService.createProject(projectName);
                break;
            }
            case "linkCoP": {
                logger.info("[CONTROL] Inserting Conversation-Project Link");
                String conversationId = json.get("conversationId").getAsString();
                String projectName = json.get("projectName").getAsString();
                res = adminService.linkConversationToProject(conversationId, projectName);
                break;
            }
            case "linkCuP": {
                logger.info("[CONTROL] Inserting Customer-Project Link");
                String username = json.get("username").getAsString();
                String projectName = json.get("projectName").getAsString();
                int accessLevel = json.get("accessLevel").getAsInt();
                res = adminService.linkCustomerToProject(username, projectName, accessLevel);
                break;
            }
            default:
                res = false;
                break;
        }

        return res;
    }

    @ApiOperation(value = "Edits data in DB")
    @RequestMapping(value = "/editData", method = RequestMethod.POST)
    public boolean editData(@RequestBody String data) {

        JsonParser parser = new JsonParser();
        JsonObject json = (JsonObject) parser.parse(data);
        String filterType = json.get("filter").getAsString();
        boolean res;
        logger.info("[CONTROL] editing "+filterType+" data in db");

        switch (filterType) {
            case "convAL": {
                logger.info("[CONTROL] Conversation Access Level edit");
                String conversationId = json.get("conversationId").getAsString();
                int accessLevel = json.get("accessLevel").getAsInt();
                res = adminService.changeConversationAccessLevel(conversationId, accessLevel);
                break;
            }
            case "linkCPAL": {
                logger.info("[CONTROL] Link Cust-Project Access Level edit");
                String username = json.get("username").getAsString();
                String projectName = json.get("projectName").getAsString();
                int accessLevel = json.get("accessLevel").getAsInt();
                res = adminService.changeCustomerProjectAccessLevel(username, projectName, accessLevel);
                break;
            }
            case "password": {
                logger.info("[CONTROL] Password change");
                String username = json.get("username").getAsString();
                String newPw = json.get("newPw").getAsString();
                res = adminService.changeCustomerPassword(username, newPw);
                break;
            }
            case "projectName": {
                logger.info("[CONTROL] Project name change");
                String oldName = json.get("oldName").getAsString();
                String newName = json.get("newName").getAsString();
                res = adminService.changeProjectName(oldName, newName);
                break;
            }
            default:
                res = false;
                break;
        }

        return res;
    }

    @ApiOperation(value = "Deletes data in DB")
    @RequestMapping(value = "/deleteData", method = RequestMethod.POST)
    public boolean deleteData(@RequestBody String data) {

        JsonParser parser = new JsonParser();
        JsonObject json = (JsonObject) parser.parse(data);
        String filterType = json.get("filter").getAsString();
        boolean res = true;
        logger.info("[CONTROL] deleting "+filterType+" data in db");

        switch (filterType) {
            case "customer": {
                logger.info("[CONTROL] user delete");
                String username = json.get("username").getAsString();
                adminService.deleteCustomer(username);
                break;
            }
            case "project": {
                logger.info("[CONTROL] project delete");
                String projectName = json.get("projectName").getAsString();
                adminService.deleteProject(projectName);
                break;
            }
            case "linkCuP": {
                logger.info("[CONTROL] CuP link delete");
                String username = json.get("username").getAsString();
                String projectName = json.get("projectName").getAsString();
                adminService.deleteCustomerProjectLink(username, projectName);
                break;
            }
            case "linkCoP": {
                logger.info("[CONTROL] CoP delete");
                String conversationId = json.get("conversationId").getAsString();
                String projectName = json.get("projectName").getAsString();
                adminService.deleteConversationProjectLink(conversationId, projectName);
                break;
            }
            default:
                res = false;
                break;
        }

        return res;
    }

    @ApiOperation(value = "Checks if data exists in DB")
    @RequestMapping(value = "/checkExistence", method = RequestMethod.POST)
    public boolean checkExistence(@RequestBody String data){
        JsonParser parser = new JsonParser();
        JsonObject json = (JsonObject) parser.parse(data);
        String filterType = json.get("filter").getAsString();
        logger.info("[CONTROL] Contolling if "+filterType+" already exists");

        switch (filterType) {
            case "customer": {
                logger.info("[CONTROL] is username taken check");
                String username = json.get("username").getAsString();
                return adminService.isUsernameTaken(username);
            }
            case "project": {
                logger.info("[CONTROL] is project name taken check");
                String projectName = json.get("projectName").getAsString();
                return adminService.isProjectNameTaken(projectName);
            }
            default:
                return false;
        }
    }

    @RequestMapping(value = "/isAdmin", method = RequestMethod.GET)
    public boolean isAdmin(){
        return adminService.checkUserPermission();
    }

}

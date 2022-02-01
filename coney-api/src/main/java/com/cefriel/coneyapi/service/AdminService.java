package com.cefriel.coneyapi.service;

import com.cefriel.coneyapi.model.db.entities.Conversation;
import com.cefriel.coneyapi.model.db.custom.UserProject;
import com.cefriel.coneyapi.repository.AdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;


    @Autowired
    private PasswordEncoder bcryptEncoder;

    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);

    public AdminService(AdminRepository adminRepository){
        this.adminRepository = adminRepository;
    }

    public List<String> getCustomers(String filterType, String filter, String filter2){

        if(!checkUserPermission()){
            return null;
        }

        switch (filterType) {
            case "conversation":
                return adminRepository.getCustomersOfConversation(filter);
            case "project":
                return adminRepository.getCustomersOfProject(filter);
            case "both":
                return adminRepository.getCustomersOfConversationAndProject(filter, filter2);
            default:
                return adminRepository.getCustomers();
        }
    }

    public List<Conversation> getConversations(String filterType, String filter, String filter2){

        if(!checkUserPermission()){
            return null;
        }
        logger.info("[CONTROL] IN service, filtering for "+filterType);
        switch (filterType) {
            case "customer":
                return adminRepository.getConversationsOfCustomer(filter);
            case "project":
                return adminRepository.getConversationsOfProject(filter);
            case "both":
                return adminRepository.getConversationsOfCustomerAndProject(filter, filter2);
            default:
                logger.info(adminRepository.getConversations().toString());
                return adminRepository.getConversations();
        }
    }

    public List<UserProject> getProjects(String filterType, String filter, String filter2){

        if(!checkUserPermission()){
            return null;
        }

        switch (filterType) {
            case "conversation":
                return adminRepository.getProjectOfConversation(filter);
            case "customer":
                return adminRepository.getProjectsOfCustomer(filter);
            case "both":
                return adminRepository.getProjectsOfCustomerAndConversation(filter, filter2);
            default:
                return adminRepository.getProjects();
        }
    }

    //CREATE

    public String createCustomer(String username, String password){
        if(!checkUserPermission()){
            return "auth";
        }

        if(adminRepository.checkIfUsernameIsTaken(username) > 0){
            return "taken";
        }
        return adminRepository.createCustomer(username, bcryptEncoder.encode(password));
    }

    public boolean createProject(String projectName){
        if(!checkUserPermission()){
            return false;
        }
        return projectName.equals(adminRepository.createProject(projectName));
    }

    public boolean linkConversationToProject(String conversationId, String projectName){
        if(!checkUserPermission()){
            return false;
        }
        return adminRepository.linkConversationToProject(conversationId, projectName);
    }

    public boolean linkCustomerToProject(String username, String projectName, int accessLevel){
        if(!checkUserPermission()){
            return false;
        }
        return accessLevel == adminRepository.linkCustomerToProject(username, projectName, accessLevel);
    }

    //EDIT

    public boolean changeConversationAccessLevel(String conversationId, int accessLevel){
        if(!checkUserPermission()){
            return false;
        }
        return accessLevel == adminRepository.changeConversationAccessLevel(conversationId, accessLevel);
    }

    public boolean changeCustomerProjectAccessLevel(String username, String projectName, int accessLevel){
        if(!checkUserPermission()){
            return false;
        }
        return accessLevel == adminRepository.changeCustomerProjectAccessLevel(username, projectName, accessLevel);
    }

    public boolean changeCustomerPassword(String username, String newPassword){
        if(!checkUserPermission()){
            return false;
        }
        return newPassword.equals(adminRepository.changeCustomerPassword(username, bcryptEncoder.encode(newPassword)));
    }

    public boolean changeProjectName(String oldName, String newName){
        if(!checkUserPermission()){
            return false;
        }
        return newName.equals(adminRepository.changeProjectName(oldName, newName));
    }

    public void deleteCustomer(String username){
        if(checkUserPermission()){
            adminRepository.deleteCustomer(username);
        }
    }

    public void deleteProject(String projectName){
        if(checkUserPermission()){
            adminRepository.deleteProject(projectName);
        }
    }

    public void deleteConversationProjectLink(String conversationId, String projectName){
        adminRepository.deleteConversationProjectLink(conversationId, projectName);
    }

    public void deleteCustomerProjectLink(String username, String projectName){
        if(checkUserPermission()) {
            adminRepository.deleteCustomerProjectLink(username, projectName);
        }
    }

    public boolean isUsernameTaken(String username){
        if(!checkUserPermission()){
            return false;
        }
        return adminRepository.isUsernameTaken(username);
    }

    public boolean isProjectNameTaken(String projectName){
        if(!checkUserPermission()){
            return false;
        }
        return adminRepository.isProjectNameTaken(projectName);
    }

    public boolean checkUserPermission() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        if(username.equals("anonymousUser")){
            return true;
        }
        String check = adminRepository.isUserAdmin(username);
        if(check == null || !Boolean.valueOf(check)){
            logger.error("[CONTROL] User is not authorized to access this content");
            return false;
        }
        return true;
    }

}

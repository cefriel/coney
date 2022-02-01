package com.cefriel.coneyapi.controller;

import com.cefriel.coneyapi.exception.*;
import com.cefriel.coneyapi.model.db.entities.Tag;
import com.cefriel.coneyapi.model.db.custom.ConversationResponse;
import com.cefriel.coneyapi.model.db.custom.UserProject;
import com.cefriel.coneyapi.service.ConversationService;
import com.cefriel.coneyapi.utils.Utils;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import io.swagger.annotations.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RestController
@RequestMapping("/create/")
public class ConversationController {

	private static final Logger logger = LoggerFactory.getLogger(ConversationController.class);
	private Utils utils = new Utils();

	private final ConversationService conversationService;


    public ConversationController(ConversationService conversationService){
        this.conversationService = conversationService;
    }


	@ApiOperation(value = "Returns a list of all the matching conversations")
	@RequestMapping(value = "/searchConversation", method = RequestMethod.GET)
	public List<ConversationResponse> searchConversation() throws Exception {

		List<ConversationResponse> convList;

		try {
			convList = conversationService.searchConversation();
		} catch (Exception e) {
			logger.error("[CONVERSATION] Failed to get conversation list");
			throw new ParsingException("Failed to get conversation list");
		}

		logger.info("[CONVERSATION] Search conversation: List of {} conversations correctly retrieved", convList.size());
		return convList;
	}

	@ApiOperation(value = "Returns a the project of a conversation")
	@RequestMapping(value = "/getConversationProject", method = RequestMethod.GET)
	public String getConversationProject(@RequestParam(value = "conversationId") String conversationId) {
    	return conversationService.getConversationProject(conversationId);
	}

	@ApiOperation(value = "Returns the ReteJS-ready JSON")
    @RequestMapping(value = "/getConversationJson", method = RequestMethod.GET)
	public String findJsonUrlByConversationId(@RequestParam(value = "conversationId") String conversationId)
		throws ResourceNotFoundException, UserNotAuthorizedException {

    	String res;
		try {
			res = conversationService.findJsonUrlByConversationId(conversationId);

		} catch (Exception e) {
			logger.error("[CONVERSATION] Conversation with ID: "+conversationId+" not found");
			throw new ResourceNotFoundException("Conversation with ID: "+conversationId+" not found");
		}


		if(res.equals("not_auth")){
			throw new UserNotAuthorizedException("[CONVERSATION] User not authorized to access conversation: "+conversationId);
		}
		return utils.openJsonFile(res);
	}

	@ApiOperation(value="Returns a CSV with all the blocks for translation purposes")
	@RequestMapping(value = "/getTranslationCSV", method = RequestMethod.GET)
	public String getTranslationCSV(@RequestParam(value = "conversationId") String conversationId)
			throws ResourceNotFoundException, UserNotAuthorizedException, MethodNotAllowedException {

    	String res;
		try {
			res = conversationService.getLanguageTranslationCSV(conversationId);

		} catch (Exception e) {
			logger.error("[CONVERSATION] Conversation with ID: "+conversationId+" not found");
			throw new ResourceNotFoundException("Conversation with ID: "+conversationId+" not found");
		}

		if(res.equals("not_auth")){
			throw new UserNotAuthorizedException("[CONVERSATION] User not authorized to access conversation: "+conversationId);
		} else if(res.equals("not_published")){
			throw new MethodNotAllowedException("[CONVERSATION] The conversation has to be published");
		}

		return res;
	}


	@ApiOperation(value = "Uploads the translation in the database")
	@RequestMapping(value = "/uploadTranslation", method = RequestMethod.POST)
	public boolean uploadTranslation(@RequestBody String translation) throws Exception{

		JsonParser parser = new JsonParser();
		JsonObject translationJson = (JsonObject) parser.parse(translation);
		JsonArray translationBlocks = translationJson.get("blocks").getAsJsonArray();
		String language = translationJson.get("language").getAsString();
		String conversationId = translationJson.get("conversationId").getAsString();

		String res = conversationService.uploadTranslation(conversationId, language, translationBlocks);

    	return true;
	}


	@ApiOperation(value = "Returns all the available Tags")
	@RequestMapping(value = "/searchTags", method = RequestMethod.GET)
	public List<Tag> searchTags(@RequestParam(value = "convId", required = false) String convId) throws Exception {
    	List<Tag> tagList;

    	if(convId==null){
    		convId = "";
		}
    	try{
    		tagList = conversationService.searchTags(convId);
		} catch (Exception e){
    		logger.error("[CONVERSATION] No tags found");
    		throw new ResourceNotFoundException("No tags found");
		}

    	logger.info("[CONVERSATION] Returning tag list");
		return tagList;
	}


	@ApiOperation(value = "Returns all the available Tags")
	@RequestMapping(value = "/uploadTags", method = RequestMethod.POST)
	public boolean uploadTags(@RequestBody String tags) throws Exception {

		logger.info("[CONVERSATION] Saving tags in db");
		JsonParser parser = new JsonParser();
		JsonObject json = (JsonObject) parser.parse(tags);
		JsonArray tag_list = json.get("tags").getAsJsonArray();

		return conversationService.uploadTags(tag_list);
	}

	// DELETE - unpublish conversation
	@ApiOperation(value = "Sets conversation status to 'Unpublished'")
	@RequestMapping(value = "/unpublishConversation", method = RequestMethod.GET)
	public boolean unpublishConversationById(
			@RequestParam(value = "conversationId") String conversationId)
			throws ResourceNotFoundException, Exception {

    	if(!conversationService.isPublished(conversationId)){
    		logger.error("[CONVERSATION] ERROR: chat has to be published in order to be unpublished");
    		throw new Exception("chat has to be published in order to be unpublished");
		}

		// set to unpublished the conversation status
		boolean statusChange = conversationService.updateConversationStatus(conversationId, "unpublished");

		if(!statusChange){
			logger.error("[CONVERSATION] Error, no conversation found with ID: "+conversationId);
			throw new ResourceNotFoundException("No conversation found with ID: "+conversationId);
		}

		String json_url = conversationService.findJsonUrlByConversationId(conversationId);
		if(!utils.changeStatusInJson(json_url, "unpublished")){
			logger.error("[CONVERSATION] Error, unable to change status in json");
			throw new ResourceNotFoundException("Error, unable to change status in json");
		}

		logger.info("[CONVERSATION] Status successfully set to UNPUBLISHED");
		return true;

	}


	// DELETE request
	@ApiOperation(value = "Deletes a conversation")
	@RequestMapping(value = "/deleteConversation", method = RequestMethod.DELETE)
	public boolean deleteConversationById(@RequestParam(value = "conversationId") String conversationId,
										   @RequestParam(value = "status") String status)
			throws ResourceNotFoundException, MethodNotAllowedException, ParsingException {

		if (status.equals("saved")) {
			boolean convDeleted = conversationService.deleteConversation(conversationId);
			if (convDeleted) {
				logger.info("[CONVERSATION] Conversation with ID: "+conversationId+" correctly deleted");
				return true;
			} else {
				logger.error("[CONVERSATION] Conversation with ID: "+conversationId+" not found. Cannot delete the conversation.");
				throw new ResourceNotFoundException(
						"Cannot delete conversation; no conversations found with with ID: "+conversationId+"");
			}
		} else if (status.equals("published")) {
			logger.error("[CONVERSATION] Operation not allowed. Published conversation cannot be deleted. First unpublish conversation, than delete it");
			throw new MethodNotAllowedException("Operation not allowed. Published conversation cannot be deleted. First unpublish conversation, than delete it");

		} else if (status.equals("unpublished")){

			boolean nodesDeleted= conversationService.deleteConversationNodes(conversationId);
			if(nodesDeleted){
				logger.info("[CONVERSATION] Conversation nodes and relationships correctly deleted from DB");
				boolean convReteDeleted = conversationService.deleteConversation(conversationId);
				if (convReteDeleted) {
					logger.info("[CONVERSATION] Conversation correctly deleted from DB");

				} else {
					logger.info("[CONVERSATION] Failed to delete conversation from DB");
				}


			} else {
				logger.error("[CONVERSATION] Failed to delete conversation nodes and relationships, CANNOT delete conversation with ID: "+conversationId);
				throw new ResourceNotFoundException(
						"Failed to delete conversation nodes and relationships, CANNOT delete conversation with ID: "+conversationId);
			}
		} else {
			logger.error("[CONVERSATION] ParsingError: Status parameter not valid. Only allowed \"saved\" and \"published\"");
			throw new ParsingException("Status parameter not valid. Only allowed \"saved\" and \"published\"");
		}
		return false;
	}


	//create chat blocks regardless of status (to be deleted)
	@ApiOperation(value = "Creates chat block regardless of status, but with negative id")
	@RequestMapping(value = "/previewConversation", method = RequestMethod.POST)
	public String previewConversation(@RequestBody String convRete) throws Exception {

    	logger.info("[CONVERSATION] Conversation preview requested");
		JsonParser parser = new JsonParser();
		JsonObject json = (JsonObject) parser.parse(convRete);

		JsonObject res = new JsonObject();
		String status = json.get("status").getAsString();

		if(status.equals("published")){
			logger.info("Conversation already published, starting preview");
			res.addProperty("success", true);
			return res.toString();
		}

		//creates the nodes (but mark them as part of 'preview' with id>10000)
		String conversationId = json.get("conversationId").getAsString();
		JsonObject nodes = json.getAsJsonObject("nodes");
		if(nodes==null){
			logger.error("[CONVERSATION] ERROR: failed to get load nodes for preview");
			throw new ResourceNotFoundException("ERROR: failed to get load nodes for preview");
		}


		boolean check = conversationService.uploadNodesAndEdged(nodes, conversationId, true);

		if(check){
			res.addProperty("success", true);
		} else {
			res.addProperty("success", false);
		}
		return res.toString();
	}

	@ApiOperation(value="Deletes all the nodes created for the preview")
	@RequestMapping(value = "/deletePreview", method = RequestMethod.DELETE)
	public boolean deletePreview(@RequestParam(value = "conversationId") String conversationId,
								 @RequestParam(value = "session") String session)
		throws Exception {
    	logger.info("[CONVERSATION] Closing preview, deleting temp nodes of conv: "+conversationId);
    	return conversationService.deletePreview(conversationId, session);
	}

	@ApiOperation(value="Gets all the projects linked to the user")
	@RequestMapping(value = "/getCustomerProjects", method = RequestMethod.GET)
	public List<UserProject> getCustomerProjects()
			throws Exception {
		logger.info("[CONVERSATION] Getting projects");
		return conversationService.getCustomerProjects();
	}

	// POST
	@ApiOperation(value = "Saves the conversation in a node and locally (Body: ReteJS JSON file)")
	@RequestMapping(value = "/saveConversation", method = RequestMethod.POST)
	public String saveConversation(@RequestBody String convRete)
			throws Exception {

    	boolean convSaved = false;
    	logger.info("-"+SecurityContextHolder.getContext().getAuthentication().getName()+"-");
    	boolean commercial = !SecurityContextHolder.getContext().getAuthentication().getName().equals("anonymousUser");
		Utils utils = new Utils();
		JsonParser parser = new JsonParser();
		JsonObject json = (JsonObject) parser.parse(convRete);
		String projectName = ""; String lang = "";
		String conversationId = json.get("conversationId").getAsString();
		String title = json.get("title").getAsString();
		String status = json.get("status").getAsString();
		int accessLevel = 0;

		// check conversationId field
		// if null -> save as new node
		// else -> check for the status (if published I can't overwrite)
		if (conversationId.equals("")) {	//SAVE AS NEW
			//check for title existence
			if (conversationService.titleNotExists(title, conversationId)) {

				//generate id,
				conversationId = utils.generateId();

				//get the established access level
				try{

					//only for commercial use
					if(commercial){
						accessLevel = json.get("accessLevel").getAsInt();
						projectName = json.get("projectName").getAsString();
					}

					lang = json.get("lang").getAsString();
				} catch (Exception e){
					logger.error("[CONVERSATION] Some properties were not set, returning.");
					throw new ConflictException("Some properties were not set");
				}


				//try to update RETE JSON and save it locally
				String jsonUrl;
				try{
					json.addProperty("status", "saved");
					json.addProperty("conversationId", conversationId);
					jsonUrl = utils.saveJsonToFile(json, title);
				} catch (Exception e){
					e.printStackTrace();
					logger.error("[CONVERSATION] Unable to locally save the JSON file");
					throw new ConflictException("Unable to locally save the JSON file");
				}

				//if the file was saved then create the corresponding node in Neo4j
				if(jsonUrl!=null && commercial){
					convSaved = conversationService.createOrUpdateNewConversation(conversationId, title, jsonUrl, projectName, accessLevel, lang);
				} else if(jsonUrl != null){
					//open case
					convSaved = conversationService.createOrUpdateNewOpenConversation(conversationId, title, jsonUrl, lang);
				}

			} else {
				logger.error("[CONVERSATION] Another document with this title already exists");
				throw new ConflictException("The title inserted already exists");
			}

		} else if (status.equals("saved")) {  //SAVE OVERWRITE
			// if it's already saved just doublecheck for the title (if if changed)
			if (conversationService.titleNotExists(title, conversationId)) {

				String jsonUrl = utils.saveJsonToFile(json, title);
				if(jsonUrl!=null){

					convSaved = conversationService.createOrUpdateConversation(conversationId, title, jsonUrl);

				} else {
					logger.error("[CONVERSATION] Errors saving the conversation's JSON file locally.");
					throw new Exception("Errors saving the conversation's JSON file locally");
				}
				logger.info("[CONVERSATION] Conversation correctly overwritten ");
			} else {
				logger.error("[CONVERSATION] Another document with this title already exists");
				throw new ConflictException("The title inserted already exists");
			}
		} else if (status.equals("published")){
			logger.error("[CONVERSATION] Operation not allowed. Published conversation cannot be saved.");
			throw new MethodNotAllowedException(
					"You can't save an already published conversation. Publish it again or SaveAs with another name");
		} else if (status.equals("unpublished")){
			logger.error("[CONVERSATION] Operation not allowed. Unpublished conversation cannot be saved.");
			throw new MethodNotAllowedException("You can't save an unpublished conversation. Publish it again or SaveAs with another name");
		} else {
			logger.error("[CONVERSATION] Parsing error. The field status can be \"saved\" or \"published\". It can't be empty if the field conversationId is not empty.");
			throw new ParsingException("Parsing error. The field status can be \"saved\" or \"published\". It can't be empty if the field conversationId is not empty.");
		}

		if (!convSaved) {
			logger.error("[CONVERSATION] Errors saving the conversation");
			throw new Exception("Errors saving the conversation");
		}

		logger.info("[CONVERSATION] Conversation correctly saved");

		JsonObject res = new JsonObject();
		res.addProperty("conversationId", conversationId);
		res.addProperty("title", title);
		res.addProperty("status", "saved");

		if(projectName!=null && !projectName.equals("")){res.addProperty("projectName", projectName);}
		if(!lang.equals("")){ res.addProperty("lang", lang); }
		if(accessLevel!=0){ res.addProperty("accessLevel", accessLevel);}

		return res.toString();
	}

	//updates the conversation node and creates chat blocks
	@ApiOperation(value = "Publish the conversation and creates chat blocks (Body: ReteJS JSON file)")
	@RequestMapping(value = "/publishConversation", method = RequestMethod.POST)
	public String publishConversation(@RequestBody String convRete) throws Exception {


		boolean commercial = !SecurityContextHolder.getContext().getAuthentication().getName().equals("anonymousUser");

		JsonParser parser = new JsonParser();
		JsonObject json = (JsonObject) parser.parse(convRete);

		String conversationId = json.get("conversationId").getAsString();
		logger.info("Publish requested for conversation "+conversationId);
		String status = json.get("status").getAsString();
		String title = json.get("title").getAsString();

		String project = "";
		if(commercial){
			project = json.get("projectName").getAsString();
		}


		if (conversationId.equals("")) {
			//Not allowed to publish an unsaved conversation
			logger.error("[CONVERSATION] Operation not allowed. You can't publish a conversation without having saved it before.");
			throw new ConflictException("You can't publish a conversation without having saved it before.");

		} else {
			//Not allowed to publish an already published conversation
			if (status.equals("published")) {
				logger.error("[CONVERSATION] Operation not allowed. A published conversation cannot be re-published.");
				throw new ConflictException("You can't publish a published conversation.");

			} else if (status.equals("saved")) { // se il campo è valorizzato publish di una conversazione già salvata (saveRewrite + Update)

				if(saveConversation(convRete)!=null){
					//save the conversation again
					logger.info("Conversation saved");
					JsonObject nodes = (JsonObject) json.get("nodes");
					boolean check = conversationService.uploadNodesAndEdged(nodes, conversationId, false);
					if(check){
						json.addProperty("status", "published");
						utils.saveJsonToFile(json, title);
						logger.info("[CONVERSATION] Status successfully set to PUBLISHED");
					} else {
						json.addProperty("status", "saved");
					}
				}

			} else if (status.equals("unpublished")) {
				//just changes the status

				// set to unpublished the conversation status
				boolean statusChange = conversationService.updateConversationStatus(conversationId, "published");

				if(!statusChange){
					logger.error("[CONVERSATION] Error, no conversation found with ID: "+conversationId);
					throw new ResourceNotFoundException("Error, no conversation found with ID: "+conversationId);
				} else {
					json.addProperty("status", "published");
					utils.saveJsonToFile(json, title);
					logger.info("[CONVERSATION] Status successfully set to PUBLISHED");
				}

			} else {

				logger.error("[CONVERSATION] Parsing error. The field status can be empty, \"saved\" or \"published\" or \"unpublished\"");
				throw new ParsingException("Parsing error. The field status can be empty, \"saved\" or \"published\"");
			}
		}

		JsonObject res = new JsonObject();
		res.addProperty("conversationId", conversationId);
		res.addProperty("title", title);
		if(project!=""){res.addProperty("projectName", project);}
		res.addProperty("status", "published");
		return res.toString();
	}

	@ApiOperation(value = "Gets questions, answers and tags")
	@RequestMapping(value = "/getOrderedConversation", method = RequestMethod.GET)
	public String getOrderedConversation(@RequestParam(value="conversationId") String conversationId)
		throws ParsingException, ResourceNotFoundException {

    	String res = conversationService.getOrderedConversation(conversationId);

    	if(res == null){
    		throw new ParsingException("Parsing Exception");
		} else if(res.equals("no_nodes")){
			logger.error("No nodes found with this ID");
			throw new ResourceNotFoundException("No nodes found with this ID");
		}

    	return res;
	}

	@ApiOperation(value = "Gets questions, answers and tags")
	@RequestMapping(value = "/getOrderedQuestionsAndAnswers", method = RequestMethod.GET)
	public String getOrderedQuestionsAndAnswers(@RequestParam(value="conversationId") String conversationId)
			throws ParsingException, ResourceNotFoundException {
		String res = conversationService.getOrderedQuestionsAndAnswers(conversationId);
		if(res == null){
			throw new ParsingException("Parsing Exception");
		} else if(res.equals("no_nodes")){
			logger.error("No nodes found with this ID");
			throw new ResourceNotFoundException("No nodes found with this ID");
		}
		return res;
	}

	@ApiOperation(value="Gets all the projects linked to the user")
	@RequestMapping(value = "/deleteAccount", method = RequestMethod.GET)
	public String deleteAccount(@RequestParam(value = "username") String username) {
		conversationService.setCustomerForDeletion(username);
		return "true";
	}

	@ApiOperation(value="Changes users password")
	@RequestMapping(value = "/changePassword", method = RequestMethod.POST)
	public String changePassword(@RequestHeader("UserData") String auth_data)
			throws Exception {

    	String username;
    	String oldPw;
    	String newPw;
		String res;

		try{
			String [] data = auth_data.split(":");
			username = data[0];
			oldPw = data[1];
			newPw = data[2];

			res = conversationService.changeCustomerPassword(username, oldPw, newPw);

			if(res==null || !res.equals("true")){
				logger.error("[CONVERSATION] Unable to match a user with this password");
				throw new ResourceNotFoundException("Unable to match a user with this password");
			} else {
				return res;
			}
		} catch (Exception e){
			logger.error("[CONVERSATION] Invalid credentials");
		}
		return "false";
	}

}

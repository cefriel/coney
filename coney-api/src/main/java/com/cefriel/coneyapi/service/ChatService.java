package com.cefriel.coneyapi.service;

import com.cefriel.coneyapi.exception.MethodNotAllowedException;
import com.cefriel.coneyapi.exception.ParsingException;
import com.cefriel.coneyapi.exception.ResourceNotFoundException;
import com.cefriel.coneyapi.model.db.entities.Block;
import com.cefriel.coneyapi.model.db.entities.Conversation;
import com.cefriel.coneyapi.repository.ChatRepository;
import com.google.gson.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Random;

@Service
public class ChatService {

    @Autowired
    private ChatRepository chatRepository;

    private static final SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");

    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);
    // Logger è del package lsf4j (slf4j è la classe padre di log4j, quindi funzionerà anche se cambio log4j con altro)

    public ChatService(ChatRepository chatRepository){
        this.chatRepository = chatRepository;
    }

    /*
    Gets or create UserId
    Creates SessionId
    Generate timestamp and saves StartEnd(start) relationship
    Gets first node and all subsequent ones up until an Answer
    returns JSON(user:{}, session: {}, conversation:{}, blocks[block:{},...]
    */
    public String beginConversation(String userId, String conversationId, String projectName, String projectId, String oldSession, String lang)
            throws ResourceNotFoundException {

        JsonObject resultJson = new JsonObject();
        JsonArray blocksSequenceJson = new JsonArray();

        //if the userId is not set, randomly generate one

        if(userId==null || userId.equals("")) {
            logger.info("[CHAT] No user found, setting random u_id");
            Random rnd = new Random();
            int n = 100000 + rnd.nextInt(900000);
            userId = "u_"+n;
        }
        logger.info("[CHAT] u_id: "+userId);
        resultJson.addProperty("userId", userId);
        Conversation conversation;
        logger.info("[CHAT] resultJ: "+resultJson.toString());

        //get conversation Node
        if(userId.contains("preview")){
                conversation = chatRepository.getConversationPreviewById(conversationId);
        } else if(conversationId == null){
            conversation = chatRepository.getConversation();
        } else {
            conversation = chatRepository.getConversationById(conversationId);
        }

        conversationId = conversation.getConversationId();
        logger.info("[CHAT] Conversation found: id: "+conversationId);
        JsonObject conversationJson = conversation.toJson();

        if(conversationJson==null){
            return "no_conversation";
        }

        resultJson.add("conversation", conversationJson);

        Timestamp time = new Timestamp(System.currentTimeMillis());
        String timestamp = sdf.format(time);

        Random rnd = new Random();
        int s = 100000 + rnd.nextInt(900000);
        String session = "s_"+s;

        if(oldSession.equals("")) {
            resultJson.addProperty("session", session);
            String ts = chatRepository.createStartRelationship(userId, conversationId, timestamp, session, projectName, projectId, lang);
            logger.info("[CHAT] Start rel with timestamp and SessionId generated");

            if(("").equals(ts)){
                return "no_startend";
            }
        }

        logger.info("[CHAT] Relationship created, getting first Block");
        Block block = chatRepository.getFirstBlock(conversationId);

        if(block == null){
            return "no_firstblock";
        }

        block.setText(getBlockTranslation(block, conversationId, lang));

        JsonObject blockJson = block.toJson();
        blocksSequenceJson.add(blockJson);

        List<Block> seq;
        if(!oldSession.equals("")){
            seq = getNextBlock(block.getBlockId(), userId, oldSession, block.getOfConversation(), true);
            resultJson.addProperty("session", oldSession);
        } else {
            seq = getNextBlock(block.getBlockId(), userId, session, block.getOfConversation(), false);
        }

        if(seq==null || seq.size()==0){
            logger.error("[CHAT] ERROR: failed to get subsequent blocks");
        } else {
            for(Block b : seq){
                b.setText(getBlockTranslation(b, conversationId, lang));
                blockJson = b.toJson();
                blocksSequenceJson.add(blockJson);
            }
        }

        resultJson.add("blocks", blocksSequenceJson);
        return resultJson.toString();
    }

    //Checks whether the user had already started said conversation
    public String wasTheConversationStarted(String userId, String convId){

        String session = chatRepository.wasTheConversationStarted(userId, convId);

        if(session != null && !session.equals("")){
            return session;
        }
        return null;
    }

    //Returns the title of the conversation
    public String getConversationTitle(String conversationId){
        return chatRepository.getConversationTitle(conversationId);
    }

    //Checks whether the user had already finished said conversation
    public String wasTheConversationFinished(String userId, String conversationId){
        String session = chatRepository.wasTheConversationFinished(userId, conversationId);

        if(session != null && !session.equals("")){
            return session;
        }
        return null;
    }

    //Deletes old answers of a specific user-conv combination
    public void deletePreviousAnswers(String userId, String conversationId, String session){
        chatRepository.deletePreviousAnswers(userId, conversationId, session);
    }

    /*
    * Simply saves the answer (checkbox case),
    * the last "answer" will be redirected to the "continueConversation method
    */
    public void saveCheckboxAnswer(String userId, int blockId, String type, int answer,
                                   String conversationId, String session)
            throws ParsingException, ResourceNotFoundException{
        Block block;
        Timestamp time = new Timestamp(System.currentTimeMillis());
        String timestamp = sdf.format(time);
        logger.info("[CHAT] Saving CB answer to question with id: " + blockId +
                ", answer: "+answer+" - "+conversationId);

        block = chatRepository.getNextOfCheckboxAnswerBlock(userId, blockId, timestamp, answer, conversationId, session);
    }

    /*
    Gets userId, previous blockId, current answer (either value or text) and it's type, convId and session)
    Generate timestamp -> Saves answer based on type while getting next block
    Adds block to JSONArray
    Gets all subsequent blocks till end or Answer
    Adds them to JSONArray
    */
    public String continueConversation(String userId, int blockId, String type, String answer,
                                           String conversationId, String session, String lang)
    throws ParsingException, ResourceNotFoundException{

        JsonObject resultJson = new JsonObject();
        JsonArray blocksSequenceJson = new JsonArray();

        try {
            resultJson.addProperty("session", session);
            resultJson.addProperty("conversationId", conversationId);
            logger.info("[CHAT] Session: "+session+", conversation: "+conversationId);
        } catch (Exception e){
            return "invalid_json";
        }

        //gets current timestamp
        Timestamp time = new Timestamp(System.currentTimeMillis());
        String timestamp = sdf.format(time);
        logger.info("[CHAT] Preparing Answer of type: "+type+" to question with id: "+blockId+", answer: "+answer+" - "+conversationId);

        //saves answer and gets next block
        Block block = null;
        switch (type) {
            case "single":
                block = chatRepository.getNextOfSingleAnswerBlock(userId, blockId, timestamp, answer, conversationId, session);
                break;
            case "multiple":
                block = chatRepository.getNextOfMultipleAnswerBlock(userId, blockId, timestamp, Integer.parseInt(answer), conversationId, session);
                break;
            case "checkbox":
                block = chatRepository.getNextOfCheckboxAnswerBlock(userId, blockId, timestamp, Integer.parseInt(answer), conversationId, session);
                break;
        }

        if(block == null){
            return null;
        }

        block.setText(getBlockTranslation(block, conversationId, lang));

        JsonObject blockJson = block.toJson();
        blocksSequenceJson.add(blockJson);

        logger.info("[CHAT] Answer registered, processing next blocks");
        logger.info("[CHAT] Next: "+block.getText());
        List<Block> seq = getNextBlock(block.getBlockId(), userId, session, block.getOfConversation(), false);
        logger.info("[CHAT] SEQ returned, size: "+seq);
        if (seq != null && seq.size()>0) {
            logger.info("[CHAT] SEQ returned, size: "+seq.size());
            for(Block b : seq){

               if(!b.getBlockType().equals("end")){
                    b.setText(getBlockTranslation(b, conversationId, lang));
               }


                blockJson = b.toJson();
                blocksSequenceJson.add(blockJson);
            }
        } else {
            logger.error("[CHAT] get next returned null");
        }

        resultJson.add("blocks", blocksSequenceJson);

        return resultJson.toString();
    }

    public String redoQuestion(String userId, int blockId, String conversationId, String session, String lang) {

        JsonObject resultJson = new JsonObject();
        JsonArray blocksSequenceJson = new JsonArray();

        //Delete answer
        chatRepository.deleteAnswer(userId, session, blockId, conversationId);
        chatRepository.deleteEndTimestamp(userId, session, conversationId);

        //Return question and answers
        Block block = chatRepository.getSingleBlockById(blockId, conversationId);
        List<Block> answerSequence = chatRepository.getNextBlock(blockId, conversationId);

        if(answerSequence.size() == 0){
            return "no_answer";
        }

        block.setText(getBlockTranslation(block, conversationId, lang));
        blocksSequenceJson.add(block.toJson());
        for(Block b : answerSequence){
            b.setText(getBlockTranslation(b, conversationId, lang));
            blocksSequenceJson.add(b.toJson());
        }

        resultJson.add("blocks", blocksSequenceJson);
        return resultJson.toString();
    }


    /*
    Gets blockId, userId, SessionId and conversationId
    Gets next blocks (distance = 1)
        None -> The conversation is over -> creates block of type END and returns everything
        Block NOT of type Answer -> gets next blocks (distance = 1), recursive
        Block of type Answer -> [case1] new conversation =  returns everything
                                [case2] continuing old = gets next blocks
     */
    private List<Block> getNextBlock(int blockId, String userId, String session, String conversationId, boolean continueOld) {


        logger.info("[CHAT] Getting subsequent blocks of block_id: "+blockId);
        List<Block> blockSequence = chatRepository.getNextBlock(blockId, conversationId);
        logger.info("[CHAT] amount of next blocks: " + blockSequence.size());

        //WHEN it ends
        if(blockSequence.size()==0){
            logger.info("[CHAT] End of conversation reached, creating block with type 'end'");
            Block block = new Block();
            block.setBlockType("end");
            blockSequence.add(block);
            Timestamp time = new Timestamp(System.currentTimeMillis());
            String timestamp = sdf.format(time);

            String ck = chatRepository.createEndRelationship(userId, conversationId, timestamp, session);
            if(ck == null || ck.equals("")){
                logger.error("[CHAT] Failed to create END relationship");
            }
            logger.info("[CHAT] End relationship created");
            return blockSequence;
        }

        Block block;
        block = blockSequence.get(0);
        if(block == null){
            logger.info("[CHAT] Block null");
            return null;
        }

        if(!(block.getBlockType().equals("Answer"))){

            logger.info("[BLOCK_SEQUENCE] normal " + blockSequence.size());
            blockSequence.addAll(Objects.requireNonNull
                    (getNextBlock(block.getBlockId(), userId, session, conversationId, continueOld)));
            return blockSequence;

        }

        if(continueOld && block.getBlockType().equals("Answer")){

                logger.info("[CHAT] Continuing old conversation, getting next with session "+ session);
                List<Block> ansB = chatRepository.getAnswerOfUser(userId, conversationId, session, blockId);

                if(ansB!= null && ansB.size()!= 0 && ansB.get(0) != null){

                    blockSequence.clear();
                    //add answers
                    logger.info("[CHAT] Cont block " + ansB.get(0).getText());
                    for(Block ans : ansB){
                        ans.setBlockType("AnswerCont");
                    }

                    blockSequence.addAll(ansB);
                    blockSequence.addAll(Objects.requireNonNull
                            (getNextBlock(ansB.get(0).getBlockId(), userId, session,conversationId, continueOld)));
                }
        }

        return blockSequence;
    }

    public boolean deletePreview(String conversationId, String session){
        System.out.println(conversationId);
        String a = chatRepository.deletePreviewRelationships(session);
        String i = chatRepository.deletePreviewBlocks(conversationId);
        logger.info("[CONVERSATION] Deleting all preview blocks");

        chatRepository.deletePreviewUserOfConv(conversationId);
        return Boolean.valueOf(i) || Boolean.valueOf(a);
    }

    public List<String> getLanguagesOfConversation(String conversationId){
        List<String> languages = new ArrayList<>();
        String defLang = chatRepository.getDefaultLanguageOfConversation(conversationId);
        logger.info("[CHAT] Default lang: "+defLang);
        languages.add(defLang);
        List<String> otherLangs = chatRepository.getLanguagesOfConversation(conversationId);
        if(otherLangs!= null && otherLangs.size()!=0){
            languages.addAll(otherLangs);
        }
        return languages;
    }

    private String getBlockTranslation(Block b, String conversationId, String lang){

        if(lang.equals("default")){
            return b.getText();
        }

        String result;

        result = chatRepository.getBlockTranslation(conversationId, lang, b.getNeo4jId());

        if(result!=null && !result.equals("")){
            return result;
        } else {
            return b.getText();
        }
    }
}

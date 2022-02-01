package com.cefriel.coneyapi.controller;

import com.cefriel.coneyapi.exception.ParsingException;
import com.cefriel.coneyapi.exception.ResourceNotFoundException;
import com.cefriel.coneyapi.exception.UserNotAuthorizedException;
import com.cefriel.coneyapi.service.DataService;
import com.cefriel.coneyapi.utils.RDFUtils;
import com.cefriel.coneyapi.utils.Utils;
import io.swagger.annotations.ApiOperation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/data/")
public class DataController {

    private static final Logger logger = LoggerFactory.getLogger(DataController.class);
    private final DataService dataService;

    public DataController(DataService dataService){
        this.dataService = dataService;
    }

    @ApiOperation(value = "Gets answers to a specific conversation")
    @RequestMapping(value = "/getAnswersOfConversation", method = RequestMethod.GET)
    public String getAnswersOfConversation(@RequestParam(value="conversationId") String conversationId,
                                           @RequestParam(value = "anonymize", required = false) String anonymize)
            throws ResourceNotFoundException, ParsingException, UserNotAuthorizedException {


        if(anonymize == null || (!anonymize.equals("true") && !anonymize.equals("false"))){
            anonymize = "false";
        }

        logger.info("[DATA] Answers to conversation: "+conversationId+" requested");
        String res = dataService.getAnswersOfConversation(conversationId, Boolean.valueOf(anonymize));

        if(res == null){
            logger.error("[DATA] No Answers found at this conversation ID");
            throw new ResourceNotFoundException("[DATA] No Answers found at this conversation ID");
        }

        if(res.equals("")){
            logger.error("[DATA] Failed to convert response to csv");
            throw new ParsingException("[DATA] Failed to convert response to csv");
        }

        if(res.equals("not_auth")){
            logger.error("[DATA] User not authorized");
            throw new UserNotAuthorizedException("[DATA] User not authorized");
        }

        return res;
    }

    @ApiOperation(value = "Gets answers to a specific conversation in rdf format")
    @RequestMapping(value = "/getRDFOfAnswers", method = RequestMethod.GET)
    public String getRDFOfAnswers(@RequestParam(value="conversationId") String conversationId,
                                  @RequestParam(value="base", required = false) String base,
                                  @RequestParam(value = "format", required = false) String format,
                                  @RequestParam(value = "anonymize", required = false) String anonymize)
            throws ResourceNotFoundException, ParsingException, UserNotAuthorizedException {


        if(base == null){
            base = RDFUtils.CEF;
        }

        if(format == null){
            format = "turtle";
        }

        if(anonymize == null || (!anonymize.equals("true") && !anonymize.equals("false"))){
            anonymize = "false";
        }

        logger.info("[DATA] Answers to conversation: "+conversationId+" requested");
        String res = dataService.getRDFOfAnswers(conversationId, base, format, Boolean.valueOf(anonymize));

        if(res == null){
            logger.error("[DATA] No Answers found at this conversation ID");
            throw new ResourceNotFoundException("[DATA] No Answers found at this conversation ID");
        }

        if(res.equals("")){
            logger.error("[DATA] Failed to convert response to rdf");
            throw new ParsingException("[DATA] Failed to convert response to rdf");
        }
        if(res.equals("not_auth")){
            logger.error("[DATA] User not authorized");
            throw new UserNotAuthorizedException("[DATA] User not authorized");
        }

        return res;
    }

    @ApiOperation(value = "Gets blocks of a specific conversation in rdf format")
    @RequestMapping(value = "/getRDFOfConversation", method = RequestMethod.GET)
    public String getRDFOfConversation(@RequestParam(value = "conversationId") String conversationId,
                                       @RequestParam(value = "base", required = false) String base,
                                       @RequestParam(value = "format", required = false) String format)
            throws ParsingException, ResourceNotFoundException, UserNotAuthorizedException {


        if(base == null){
            base = RDFUtils.CEF;
        }

        if(format == null){
            format = "turtle";
        }

        logger.info("[DATA] Blocks of conversation: "+conversationId+" requested");
        String res = dataService.getRDFOfConversation(conversationId, base, format);

        if(res == null){
            logger.error("[DATA] No Blocks found at this conversation ID");
            throw new ResourceNotFoundException("[DATA] No Blocks found at this conversation ID");
        }

        if(res.equals("")){
            logger.error("[DATA] Failed to convert response to rdf");
            throw new ParsingException("[DATA] Failed to convert response to rdf");
        }
        if(res.equals("not_auth")){
            logger.error("[DATA] User not authorized");
            throw new UserNotAuthorizedException("[DATA] User not authorized");
        }

        return res;
    }


}

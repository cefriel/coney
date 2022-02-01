package com.cefriel.coneyapi.utils;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.eclipse.rdf4j.model.Model;
import org.eclipse.rdf4j.rio.RDFFormat;
import org.eclipse.rdf4j.rio.Rio;

import com.cefriel.coneyapi.model.db.entities.Block;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RDFUtils {

    private static final Logger logger = LoggerFactory.getLogger(RDFUtils.class);

	// Ontologies
	public static final String SUR = "https://w3id.org/survey-ontology#";
    public static final String RO = "http://purl.org/wf4ever/ro#";
    public static final String WFDESC = "http://purl.org/wf4ever/wfdesc#";
    public static final String WFPROV = "http://purl.org/wf4ever/wfprov#";
    public static final String PROV = "http://www.w3.org/ns/prov#";
    public static final String QB = "http://purl.org/linked-data/cube#";
    
    public static final String CEF = "http://www.cefriel.com/data#";
    
    public static void addDefaultNamespaces(Model model) {
    	model.setNamespace("sur", SUR);
    	model.setNamespace("ro", RO);
    	model.setNamespace("wfdesc", WFDESC);
    	model.setNamespace("wfprov", WFPROV);
    	model.setNamespace("prov", PROV);
    	model.setNamespace("qb", QB);
    	model.setNamespace("cef", CEF);
    }
    
    public static String getBlockId(String conversationId, Block b) {   	
    	String block_id = "Block_" + conversationId + "_" + b.getBlockId();
    	
    	if (b.getBlockType().toLowerCase().equals("answer") 
    			&& b.getBlockSubtype().toLowerCase().equals("checkbox")) {
    		int order = 0;
		    if(b.getOrder() != 0)
		        order = b.getOrder();
    		block_id = block_id + "_" + order;
    	}
    	
    	return block_id;
    }
    
    public static String writeRDFData(String format, Model model){
        logger.info("[DATA] Writing data outstream");
        String output;
        ByteArrayOutputStream outstream = new ByteArrayOutputStream();

        RDFFormat rdfFormat = getRDFFormat(format);

        Rio.write(model, outstream, rdfFormat);
        output = new String(outstream.toByteArray(), StandardCharsets.UTF_8);
        return output;
    }
    
    public static RDFFormat getRDFFormat(String format) {
        switch (format.toLowerCase()) {
            case "binary":
                return RDFFormat.BINARY;
            case "jsonld":
                return RDFFormat.JSONLD;
            case "n3":
                return RDFFormat.N3;
            case "nquads":
                return RDFFormat.NQUADS;
            case "ntriples":
                return RDFFormat.NTRIPLES;
            case "rdfxml":
                return RDFFormat.RDFXML;
            case "turtle":
                return RDFFormat.TURTLE;
            case "rdfa":
                return RDFFormat.RDFA;
            default:
                return null;
        }
    }
    
    public static String formatDateTime(String datetime) {
        String output = "";
    	DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");
        DateTimeFormatter formatterOutput = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
        try{
            output = LocalDateTime.parse(datetime, formatter).format(formatterOutput);
        } catch (Exception e){
            logger.error("[DATA] Error in parsing date: "+e.getMessage());
        }

        return output;
    }
	    
}

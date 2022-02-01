package com.cefriel.coneyapi.utils;

import com.cefriel.coneyapi.config.ApplicationConfig;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.SecureRandom;
import java.text.SimpleDateFormat;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Stream;

public class Utils {

    protected SecureRandom sr = new SecureRandom();
    private Map<String, String> mappingId = new HashMap<String, String>();

    private static final Logger logger = LoggerFactory.getLogger(Utils.class);
    
    private String absolutePath = ApplicationConfig.RETE_PATH;

    public String openJsonFile(String path){

        try {
            String res = new String(Files.readAllBytes(Paths.get(path)));
            logger.info("[UTILS] File read at path '" + path + "'");
            return res;
        } catch (IOException e){
            logger.error("[UTILS] Unable to read the file at location: " + path);
            return "";
        }
    }

    //changes the conversation "status" field in the saved json
    public boolean changeStatusInJson(String path, String status){

        String str_json;

        try {
            str_json = openJsonFile(path);

            JsonParser parser = new JsonParser();
            JsonObject json = (JsonObject) parser.parse(str_json);

            json.addProperty("status", status);
            String name = json.get("title").getAsString();

            saveJsonToFile(json, name);
        } catch (Exception e){
            str_json = null;
        }

        return str_json != null;

    }

    //Saves the json locally
    public String saveJsonToFile(JsonObject json, String name) {

        String timestamp = new SimpleDateFormat("yyyyMMddHHmm").format(new Date());
        String fileName = absolutePath+name+".txt";
        String pathVersions = absolutePath + "versions/" + name + "/";
        String fileNameVersioned = pathVersions + name + timestamp + ".txt";
        // Create dir
        new File(pathVersions).mkdirs();
        
        try (FileWriter fileVersioned = new FileWriter(fileNameVersioned)) {
        	fileVersioned.write(json.toString());
        	fileVersioned.close();
            logger.info("[UTILS] JSON Object successfully versioned to file at: '"+fileNameVersioned+"'");
        } catch (IOException e){
            logger.error("[UTILS] Failed to version JSON Object at: '"+fileNameVersioned+"'");
        }
        
        if (new File(pathVersions).list().length > 10)
	        try (Stream<Path> paths = Files.walk(Paths.get(pathVersions))) {
	            paths
	                .filter(Files::isRegularFile)
	                .map(p -> p.toFile())
	                .filter((File p) -> p.getName().contains(name))
	                .sorted(getReverseLastModifiedComparator())
	                .skip(10)
	                .forEach(x -> ((File) x).delete());
	        } catch (IOException e1) {
	        	logger.info("[UTILS] Failed deleting older versions of JSON Object at: '"+fileNameVersioned+"'");
			}
        
        try (FileWriter file = new FileWriter(fileName)) {
            file.write(json.toString());
            file.close();

            logger.info("[UTILS] JSON Object successfully copied to file at: '"+fileName+"'");
            return fileName;
        } catch (IOException e){
            logger.error("[UTILS] Failed to copy JSON Object at: '"+fileName+"'");
            return null;
        }
    }
    
    private static Comparator<File> getReverseLastModifiedComparator() {
        return (File o1, File o2) -> {
            if (o1.lastModified() < o2.lastModified()) {
                return 1;
            }
            if (o1.lastModified() > o2.lastModified()) {
                return -1;
            }
            return 0;
        };
    }

    public void deleteFile(String path){
        try {
            File file = new File(path);
            file.delete();
            
            String versionsPath = absolutePath + "versions/" + file.getName().replaceFirst("[.][^.]+$", "") + "/";
            logger.info("[UTILS] versionsPath " + versionsPath);
            Files.walk(Paths.get(versionsPath))
            	.sorted(Comparator.reverseOrder())
            	.map(Path::toFile)
            	.forEach(File::delete);
        } catch (Exception e){
            logger.error("Error in deleting old file");
        }
    }

    // Metodo per la generazione di id univoco
    public String generateId() {

        StringBuilder generatedId = new StringBuilder("id-");
        generatedId.append(sr.nextInt()).append("-").append(new Date().getTime());

        logger.debug("[UTILS] Generated new id {}", generatedId.toString());
        return generatedId.toString();
    }
  
}

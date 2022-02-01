package com.cefriel.coneyapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.data.neo4j.repository.config.EnableNeo4jRepositories;
import org.springframework.boot.builder.SpringApplicationBuilder;

@SpringBootApplication
@EnableNeo4jRepositories("com.cefriel.neo4j.repository")
public class ConeyApiApplication extends SpringBootServletInitializer {

	public static void main(String[] args) {
		SpringApplication.run(ConeyApiApplication.class, args);
	}

	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
		return application.sources(ConeyApiApplication.class);
	}
}

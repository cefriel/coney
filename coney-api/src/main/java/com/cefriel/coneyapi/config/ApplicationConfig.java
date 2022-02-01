package com.cefriel.coneyapi.config;

import org.neo4j.ogm.config.Configuration.Builder;
import org.neo4j.ogm.session.SessionFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.neo4j.repository.config.EnableNeo4jRepositories;
import org.springframework.data.neo4j.transaction.Neo4jTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;


@ComponentScan(basePackages = { "com.cefriel.coneyapi.service" })
@Configuration
@EnableTransactionManagement
@EnableSwagger2
@EnableNeo4jRepositories(basePackages = "com.cefriel.coneyapi.repository")
public class ApplicationConfig {

	public static final String NEO4J_URL = System.getenv("NEO4J_URL") != null ? System.getenv("NEO4J_URL") : "http://neo4j:neo4j@localhost:7474";
	public static final String RETE_PATH = System.getenv("RETE_PATH") != null ? System.getenv("RETE_PATH") : "/var/lib/tomcat/webapps/coney-retejs-files/";
	public static final boolean SWAGGER_ENABLE = System.getenv("SWAGGER_ENABLE") != null && Boolean.parseBoolean(System.getenv("SWAGGER_ENABLE"));;
	
	@Bean
	public org.neo4j.ogm.config.Configuration getConfiguration() {
		org.neo4j.ogm.config.Configuration config = new Builder().uri(NEO4J_URL).build();
		return config;
	}


	@Bean(name = "sessionFactory")
	public SessionFactory getSessionFactory() {
		return new SessionFactory(getConfiguration(), "com.cefriel.coneyapi.model.db");
	}
	
	@Bean(name = "transactionManager")
    public Neo4jTransactionManager transactionManager() {
        return new Neo4jTransactionManager(getSessionFactory());
    }

	@Bean
	public Docket api() {
		return new Docket(DocumentationType.SWAGGER_2).select()
				.apis(RequestHandlerSelectors.basePackage("com.cefriel.coneyapi.controller"))
				.paths(PathSelectors.ant("/*"))
				.build()
				.apiInfo(apiInfo())
				.enable(SWAGGER_ENABLE);
	}

	private ApiInfo apiInfo() {
		ApiInfo apiInfo = new ApiInfo("Coney API", "Coney API",
				"1.0.0", "https://github.com/cefriel/coney/blob/master/LICENSE.md","coney@cefriel.com", "Apache License, Version 2.0",
				"http://www.apache.org/licenses/LICENSE-2.0");
		return apiInfo;
	}
}
FROM maven:3.3-jdk-8 as builder
COPY . /usr/src/coney
WORKDIR /usr/src/coney
RUN mvn clean install -f /usr/src/coney && mkdir /usr/src/wars/
RUN find /usr/src/coney/ -iname '*.war' -exec cp {} /usr/src/wars/ \;

FROM tomcat:8.5.43
COPY --from=builder /usr/src/wars/coney-api-0.1.war /usr/local/tomcat/webapps/coney-api.war
ENV NEO4J_URL http://neo4j:coney@coney-neo4j:7474
ENV RETE_PATH /opt/coney-data/
ENV SWAGGER_ENABLE true
EXPOSE 8080
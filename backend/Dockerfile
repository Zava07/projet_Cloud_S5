# Backend Dockerfile (Spring Boot, Java 17, Maven multi-stage build)

# Stage 1 - build (also used for dev mode via docker-compose target: build)
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app

# For dev mode: copy wrapper files if they exist
COPY mvnw* ./
COPY .mvn .mvn/
RUN if [ -f ./mvnw ]; then chmod +x ./mvnw; fi

# copy pom first to leverage Docker cache
COPY pom.xml ./

# copy source and build
COPY src ./src
RUN mvn -B -DskipTests package

# Stage 2 - runtime

# Use the JDK here to allow running Maven or compiling tests during container-run/dev.
# For smaller production images, switch back to the JRE or use a multi-stage workflow.
FROM eclipse-temurin:17-jdk

WORKDIR /app
ARG JAR_FILE=target/*.jar
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

# Notes:
# - Ce Dockerfile suppose un projet Maven avec un fichier pom.xml à la racine du dossier `backend/`.
# - Si vous utilisez Gradle, adaptez le Dockerfile (utiliser une image gradle pour builder, puis copier le jar).

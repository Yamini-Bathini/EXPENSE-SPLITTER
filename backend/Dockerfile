FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Render sets SPRING_PROFILES_ACTIVE=render via render.yaml
# Railway sets SPRING_PROFILES_ACTIVE=production via env vars
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

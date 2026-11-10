package com.ecommerce.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${app.firebase.project-id:tonal-arcade-t07pf}")
    private String projectId;

    @Value("${app.firebase.database-id:ai-studio-apexstore100prod-e3cdf33d-7dbf-4bba-8144-ddfc618fde8d}")
    private String databaseId;

    @Value("${app.firebase.service-account-path:}")
    private String serviceAccountPath;

    @Bean
    public Firestore firestore() {
        FirestoreOptions.Builder optionsBuilder = FirestoreOptions.newBuilder()
                .setProjectId(projectId);

        if (databaseId != null && !databaseId.trim().isEmpty() && !"(default)".equalsIgnoreCase(databaseId.trim())) {
            optionsBuilder.setDatabaseId(databaseId.trim());
        }

        try {
            if (serviceAccountPath != null && !serviceAccountPath.trim().isEmpty()) {
                File file = new File(serviceAccountPath.trim());
                if (file.exists()) {
                    log.info("Loading Firebase credentials from file: {}", serviceAccountPath);
                    GoogleCredentials credentials = GoogleCredentials.fromStream(new FileInputStream(file));
                    optionsBuilder.setCredentials(credentials);
                } else {
                    log.warn("Firebase service account file not found at: {}. Using Application Default Credentials.", serviceAccountPath);
                    try {
                        optionsBuilder.setCredentials(GoogleCredentials.getApplicationDefault());
                    } catch (Exception ignored) {}
                }
            } else {
                try {
                    optionsBuilder.setCredentials(GoogleCredentials.getApplicationDefault());
                } catch (Exception e) {
                    log.info("Using default Firestore credentials builder for project: {} and db: {}", projectId, databaseId);
                }
            }
        } catch (Exception e) {
            log.warn("Credentials setup fallback: {}", e.getMessage());
        }

        Firestore firestore = optionsBuilder.build().getService();
        log.info("Firestore client initialized for project [{}] and database [{}]", projectId, databaseId);
        return firestore;
    }
}

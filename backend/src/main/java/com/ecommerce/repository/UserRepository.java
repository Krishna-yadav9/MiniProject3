package com.ecommerce.repository;

import com.ecommerce.model.Role;
import com.ecommerce.model.User;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class UserRepository {

    private static final Logger log = LoggerFactory.getLogger(UserRepository.class);
    private static final String COLLECTION_NAME = "users";
    private final Firestore firestore;
    private final Map<String, User> fallbackCache = new ConcurrentHashMap<>();

    public UserRepository(Firestore firestore) {
        this.firestore = firestore;
        seedDefaultAccounts();
    }

    private void seedDefaultAccounts() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // Initial Admin account
        User admin = new User(
                "user-admin-default",
                "admin@apexstore.com",
                encoder.encode("Admin@2026!"),
                "Store Administrator",
                Role.ROLE_ADMIN.name(),
                System.currentTimeMillis()
        );
        fallbackCache.put(admin.getId(), admin);

        // Initial Demo Customer account
        User customer = new User(
                "user-customer-default",
                "customer@example.com",
                encoder.encode("password123"),
                "Demo Customer",
                Role.ROLE_USER.name(),
                System.currentTimeMillis()
        );
        fallbackCache.put(customer.getId(), customer);
    }

    public User save(User user) {
        if (user.getId() == null || user.getId().trim().isEmpty()) {
            user.setId("user-" + System.currentTimeMillis());
        }
        if (user.getCreatedAt() <= 0) {
            user.setCreatedAt(System.currentTimeMillis());
        }
        fallbackCache.put(user.getId(), user);

        if (firestore != null) {
            try {
                firestore.collection(COLLECTION_NAME).document(user.getId()).set(user).get();
            } catch (Exception e) {
                log.info("Firestore save user fallback to local cache: {}", user.getEmail());
            }
        }
        return user;
    }

    public Optional<User> findById(String id) {
        if (firestore != null) {
            try {
                DocumentSnapshot snapshot = firestore.collection(COLLECTION_NAME).document(id).get().get();
                if (snapshot.exists()) {
                    User user = snapshot.toObject(User.class);
                    if (user != null) {
                        user.setId(snapshot.getId());
                        fallbackCache.put(user.getId(), user);
                        return Optional.of(user);
                    }
                }
            } catch (Exception e) {
                log.info("Firestore findById user fallback to local cache: {}", id);
            }
        }
        return Optional.ofNullable(fallbackCache.get(id));
    }

    public Optional<User> findByEmail(String email) {
        if (email == null) return Optional.empty();
        String normalizedEmail = email.trim().toLowerCase();

        if (firestore != null) {
            try {
                ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                        .whereEqualTo("email", normalizedEmail)
                        .limit(1)
                        .get();
                List<QueryDocumentSnapshot> documents = future.get().getDocuments();
                if (!documents.isEmpty()) {
                    QueryDocumentSnapshot doc = documents.get(0);
                    User user = doc.toObject(User.class);
                    if (user != null) {
                        user.setId(doc.getId());
                        fallbackCache.put(user.getId(), user);
                        return Optional.of(user);
                    }
                }
            } catch (Exception e) {
                log.info("Firestore unavailable, retrieving user from local cache: {}", normalizedEmail);
            }
        }

        return fallbackCache.values().stream()
                .filter(u -> u.getEmail() != null && u.getEmail().equalsIgnoreCase(normalizedEmail))
                .findFirst();
    }

    public boolean existsByEmail(String email) {
        return findByEmail(email).isPresent();
    }

    public List<User> findAll() {
        if (firestore != null) {
            try {
                ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME).get();
                List<QueryDocumentSnapshot> documents = future.get().getDocuments();
                if (!documents.isEmpty()) {
                    List<User> list = new ArrayList<>();
                    for (DocumentSnapshot doc : documents) {
                        User user = doc.toObject(User.class);
                        if (user != null) {
                            user.setId(doc.getId());
                            list.add(user);
                        }
                    }
                    return list;
                }
            } catch (Exception e) {
                log.info("Firestore unavailable, returning cached users");
            }
        }
        return new ArrayList<>(fallbackCache.values());
    }
}

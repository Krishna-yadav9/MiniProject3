package com.ecommerce.model;

import com.google.cloud.firestore.annotation.DocumentId;

public class User {
    @DocumentId
    private String id;
    private String email;
    private String password;
    private String name;
    private String role; // "ROLE_USER" or "ROLE_ADMIN"
    private long createdAt;

    public User() {
    }

    public User(String id, String email, String password, String name, String role, long createdAt) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.name = name;
        this.role = role;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }
}

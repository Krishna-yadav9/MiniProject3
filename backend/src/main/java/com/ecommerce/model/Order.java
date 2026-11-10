package com.ecommerce.model;

import com.google.cloud.firestore.annotation.DocumentId;
import java.util.ArrayList;
import java.util.List;

public class Order {
    @DocumentId
    private String id;
    private String userId;
    private String userEmail;
    private List<CartItem> items = new ArrayList<>();
    private double totalAmount;
    private String shippingAddress;
    private String status; // "PENDING", "PROCESSING", "SHIPPED", "DELIVERED"
    private long createdAt;

    public Order() {
    }

    public Order(String id, String userId, String userEmail, List<CartItem> items, double totalAmount, String shippingAddress, String status, long createdAt) {
        this.id = id;
        this.userId = userId;
        this.userEmail = userEmail;
        this.items = items != null ? items : new ArrayList<>();
        this.totalAmount = totalAmount;
        this.shippingAddress = shippingAddress;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items != null ? items : new ArrayList<>();
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public double getTotal() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }
}

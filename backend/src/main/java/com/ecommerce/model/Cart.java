package com.ecommerce.model;

import com.google.cloud.firestore.annotation.DocumentId;
import java.util.ArrayList;
import java.util.List;

public class Cart {
    @DocumentId
    private String userId;
    private List<CartItem> items = new ArrayList<>();
    private long updatedAt;

    public Cart() {
    }

    public Cart(String userId, List<CartItem> items, long updatedAt) {
        this.userId = userId;
        this.items = items != null ? items : new ArrayList<>();
        this.updatedAt = updatedAt;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items != null ? items : new ArrayList<>();
    }

    public long getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(long updatedAt) {
        this.updatedAt = updatedAt;
    }

    public double getTotalAmount() {
        return items.stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
    }
}

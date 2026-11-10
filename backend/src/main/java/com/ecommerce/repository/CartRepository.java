package com.ecommerce.repository;

import com.ecommerce.model.Cart;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class CartRepository {

    private static final Logger log = LoggerFactory.getLogger(CartRepository.class);
    private static final String COLLECTION_NAME = "carts";
    private final Firestore firestore;
    private final Map<String, Cart> fallbackCache = new ConcurrentHashMap<>();

    public CartRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    public Cart save(Cart cart) {
        if (cart.getUserId() == null || cart.getUserId().trim().isEmpty()) {
            throw new IllegalArgumentException("Cart userId cannot be null or empty");
        }
        cart.setUpdatedAt(System.currentTimeMillis());
        fallbackCache.put(cart.getUserId(), cart);

        if (firestore != null) {
            try {
                firestore.collection(COLLECTION_NAME).document(cart.getUserId()).set(cart).get();
            } catch (Exception e) {
                log.warn("Firestore save cart failed ({}): {}", e.getMessage(), cart.getUserId());
            }
        }
        return cart;
    }

    public Optional<Cart> findByUserId(String userId) {
        if (firestore != null) {
            try {
                DocumentSnapshot snapshot = firestore.collection(COLLECTION_NAME).document(userId).get().get();
                if (snapshot.exists()) {
                    Cart cart = snapshot.toObject(Cart.class);
                    if (cart != null) {
                        cart.setUserId(snapshot.getId());
                        if (cart.getItems() == null) {
                            cart.setItems(new ArrayList<>());
                        }
                        fallbackCache.put(userId, cart);
                        return Optional.of(cart);
                    }
                }
            } catch (Exception e) {
                log.warn("Firestore find cart failed ({}): {}", e.getMessage(), userId);
            }
        }
        return Optional.ofNullable(fallbackCache.get(userId));
    }

    public void deleteByUserId(String userId) {
        fallbackCache.remove(userId);
        if (firestore != null) {
            try {
                firestore.collection(COLLECTION_NAME).document(userId).delete().get();
            } catch (Exception e) {
                log.warn("Firestore delete cart failed ({}): {}", e.getMessage(), userId);
            }
        }
    }
}

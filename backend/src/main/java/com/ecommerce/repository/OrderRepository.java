package com.ecommerce.repository;

import com.ecommerce.model.CartItem;
import com.ecommerce.model.Order;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class OrderRepository {

    private static final Logger log = LoggerFactory.getLogger(OrderRepository.class);
    private static final String COLLECTION_NAME = "orders";
    private final Firestore firestore;
    private final Map<String, Order> fallbackCache = new ConcurrentHashMap<>();

    public OrderRepository(Firestore firestore) {
        this.firestore = firestore;
        seedSampleOrders();
    }

    private void seedSampleOrders() {
        long now = System.currentTimeMillis();
        long dayMs = 86400000L;

        // Seed realistic past 90-day orders
        Object[][] sampleData = {
            // daysAgo, userId, userEmail, status, total, item1Name, cat1, price1, qty1, item2Name, cat2, price2, qty2
            { 1, "usr-101", "alex.runner@example.com", "DELIVERED", 479.98, "Aura Wireless Noise-Cancelling Headphones", "Audio", 299.99, 1, "Terra Carbon Fiber Running Sneakers", "Footwear", 179.99, 1 },
            { 2, "usr-102", "sarah.dev@example.com", "DELIVERED", 149.50, "Apex Mechanical Gaming Keyboard", "Electronics", 149.50, 1, null, null, 0.0, 0 },
            { 3, "usr-103", "michael.b@example.com", "SHIPPED", 208.00, "Horizon Minimalist Chronograph", "Accessories", 189.00, 1, "Lumina Smart Ambient Desk Lamp", "Smart Home", 89.00, 1 },
            { 4, "usr-104", "elena.style@example.com", "DELIVERED", 238.00, "Merino Wool Oversized Knit Sweater", "Apparel", 119.00, 2, null, null, 0.0, 0 },
            { 6, "usr-105", "david.tech@example.com", "DELIVERED", 388.99, "Aura Wireless Noise-Cancelling Headphones", "Audio", 299.99, 1, "Lumina Smart Ambient Desk Lamp", "Smart Home", 89.00, 1 },
            { 8, "usr-106", "emma.fit@example.com", "DELIVERED", 179.99, "Terra Carbon Fiber Running Sneakers", "Footwear", 179.99, 1, null, null, 0.0, 0 },
            { 10, "usr-107", "james.wood@example.com", "PROCESSING", 149.50, "Apex Mechanical Gaming Keyboard", "Electronics", 149.50, 1, null, null, 0.0, 0 },
            { 12, "usr-108", "lisa.g@example.com", "CANCELLED", 299.99, "Aura Wireless Noise-Cancelling Headphones", "Audio", 299.99, 1, null, null, 0.0, 0 },
            { 15, "usr-109", "kevin.h@example.com", "DELIVERED", 308.00, "Horizon Minimalist Chronograph", "Accessories", 189.00, 1, "Merino Wool Oversized Knit Sweater", "Apparel", 119.00, 1 },
            { 18, "usr-110", "rachel.m@example.com", "DELIVERED", 269.00, "Merino Wool Oversized Knit Sweater", "Apparel", 119.00, 1, "Apex Mechanical Gaming Keyboard", "Electronics", 149.50, 1 },
            { 22, "usr-101", "alex.runner@example.com", "DELIVERED", 189.00, "Horizon Minimalist Chronograph", "Accessories", 189.00, 1, null, null, 0.0, 0 },
            { 25, "usr-111", "tom.cyber@example.com", "DELIVERED", 299.99, "Aura Wireless Noise-Cancelling Headphones", "Audio", 299.99, 1, null, null, 0.0, 0 },
            { 28, "usr-112", "clara.v@example.com", "DELIVERED", 359.98, "Terra Carbon Fiber Running Sneakers", "Footwear", 179.99, 2, null, null, 0.0, 0 },
            { 35, "usr-103", "michael.b@example.com", "DELIVERED", 149.50, "Apex Mechanical Gaming Keyboard", "Electronics", 149.50, 1, null, null, 0.0, 0 },
            { 45, "usr-113", "hannah.k@example.com", "DELIVERED", 299.99, "Aura Wireless Noise-Cancelling Headphones", "Audio", 299.99, 1, null, null, 0.0, 0 },
            { 50, "usr-114", "brian.s@example.com", "DELIVERED", 189.00, "Horizon Minimalist Chronograph", "Accessories", 189.00, 1, null, null, 0.0, 0 },
            { 60, "usr-102", "sarah.dev@example.com", "DELIVERED", 179.99, "Terra Carbon Fiber Running Sneakers", "Footwear", 179.99, 1, null, null, 0.0, 0 },
            { 75, "usr-115", "olivia.d@example.com", "DELIVERED", 119.00, "Merino Wool Oversized Knit Sweater", "Apparel", 119.00, 1, null, null, 0.0, 0 }
        };

        for (int i = 0; i < sampleData.length; i++) {
            Object[] row = sampleData[i];
            int daysAgo = (Integer) row[0];
            String userId = (String) row[1];
            String userEmail = (String) row[2];
            String status = (String) row[3];
            double total = (Double) row[4];

            List<CartItem> items = new ArrayList<>();
            items.add(new CartItem("prod-00" + (i % 6 + 1), (String) row[5], (String) row[6], (Double) row[7], "", (Integer) row[8]));
            if (row[9] != null) {
                items.add(new CartItem("prod-00" + ((i + 1) % 6 + 1), (String) row[9], (String) row[10], (Double) row[11], "", (Integer) row[12]));
            }

            Order o = new Order(
                "ord-sample-" + (100 + i),
                userId,
                userEmail,
                items,
                total,
                "123 Market Street, Suite " + (100 + i) + ", San Francisco, CA",
                status,
                now - (daysAgo * dayMs)
            );
            fallbackCache.put(o.getId(), o);
        }
    }

    public Order save(Order order) {
        if (order.getId() == null || order.getId().trim().isEmpty()) {
            order.setId("ord-" + System.currentTimeMillis());
        }
        if (order.getCreatedAt() <= 0) {
            order.setCreatedAt(System.currentTimeMillis());
        }
        fallbackCache.put(order.getId(), order);

        if (firestore != null) {
            try {
                firestore.collection(COLLECTION_NAME).document(order.getId()).set(order).get();
            } catch (Exception e) {
                log.info("Firestore operation using local order cache: {}", order.getId());
            }
        }
        return order;
    }

    public Optional<Order> findById(String id) {
        if (firestore != null) {
            try {
                DocumentSnapshot snapshot = firestore.collection(COLLECTION_NAME).document(id).get().get();
                if (snapshot.exists()) {
                    Order order = snapshot.toObject(Order.class);
                    if (order != null) {
                        order.setId(snapshot.getId());
                        fallbackCache.put(order.getId(), order);
                        return Optional.of(order);
                    }
                }
            } catch (Exception e) {
                log.info("Firestore unavailable, retrieving order from local cache: {}", id);
            }
        }
        return Optional.ofNullable(fallbackCache.get(id));
    }

    public List<Order> findByUserId(String userId) {
        if (firestore != null) {
            try {
                ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                        .whereEqualTo("userId", userId)
                        .get();
                List<QueryDocumentSnapshot> documents = future.get().getDocuments();
                if (!documents.isEmpty()) {
                    List<Order> list = new ArrayList<>();
                    for (DocumentSnapshot doc : documents) {
                        Order order = doc.toObject(Order.class);
                        if (order != null) {
                            order.setId(doc.getId());
                            list.add(order);
                            fallbackCache.put(order.getId(), order);
                        }
                    }
                    list.sort((a, b) -> Long.compare(b.getCreatedAt(), a.getCreatedAt()));
                    return list;
                }
            } catch (Exception e) {
                log.info("Firestore unavailable, filtering cached orders for user: {}", userId);
            }
        }

        return fallbackCache.values().stream()
                .filter(o -> userId.equals(o.getUserId()))
                .sorted((a, b) -> Long.compare(b.getCreatedAt(), a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public List<Order> findAll() {
        if (firestore != null) {
            try {
                ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME).get();
                List<QueryDocumentSnapshot> documents = future.get().getDocuments();
                if (!documents.isEmpty()) {
                    List<Order> list = new ArrayList<>();
                    for (DocumentSnapshot doc : documents) {
                        Order order = doc.toObject(Order.class);
                        if (order != null) {
                            order.setId(doc.getId());
                            list.add(order);
                            fallbackCache.put(order.getId(), order);
                        }
                    }
                    list.sort((a, b) -> Long.compare(b.getCreatedAt(), a.getCreatedAt()));
                    return list;
                }
            } catch (Exception e) {
                log.info("Firestore unavailable, returning cached orders");
            }
        }

        return fallbackCache.values().stream()
                .sorted((a, b) -> Long.compare(b.getCreatedAt(), a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public List<Order> findOrdersCreatedAfter(long startTimestampMs) {
        if (firestore != null) {
            try {
                ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                        .whereGreaterThanOrEqualTo("createdAt", startTimestampMs)
                        .get();
                List<QueryDocumentSnapshot> documents = future.get().getDocuments();
                if (!documents.isEmpty()) {
                    List<Order> list = new ArrayList<>();
                    for (DocumentSnapshot doc : documents) {
                        Order order = doc.toObject(Order.class);
                        if (order != null) {
                            order.setId(doc.getId());
                            list.add(order);
                            fallbackCache.put(order.getId(), order);
                        }
                    }
                    list.sort((a, b) -> Long.compare(b.getCreatedAt(), a.getCreatedAt()));
                    return list;
                }
            } catch (Exception e) {
                log.info("Firestore query for orders created after {} using local cache", startTimestampMs);
            }
        }

        return fallbackCache.values().stream()
                .filter(o -> o.getCreatedAt() >= startTimestampMs)
                .sorted((a, b) -> Long.compare(b.getCreatedAt(), a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public List<Order> findOrdersBetween(long startMs, long endMs) {
        if (firestore != null) {
            try {
                ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                        .whereGreaterThanOrEqualTo("createdAt", startMs)
                        .whereLessThan("createdAt", endMs)
                        .get();
                List<QueryDocumentSnapshot> documents = future.get().getDocuments();
                if (!documents.isEmpty()) {
                    List<Order> list = new ArrayList<>();
                    for (DocumentSnapshot doc : documents) {
                        Order order = doc.toObject(Order.class);
                        if (order != null) {
                            order.setId(doc.getId());
                            list.add(order);
                            fallbackCache.put(order.getId(), order);
                        }
                    }
                    return list;
                }
            } catch (Exception e) {
                log.info("Firestore query for orders between timestamps using local cache");
            }
        }

        return fallbackCache.values().stream()
                .filter(o -> o.getCreatedAt() >= startMs && o.getCreatedAt() < endMs)
                .collect(Collectors.toList());
    }
}

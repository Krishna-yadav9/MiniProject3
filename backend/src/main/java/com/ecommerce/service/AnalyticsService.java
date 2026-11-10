package com.ecommerce.service;

import com.ecommerce.dto.*;
import com.ecommerce.model.CartItem;
import com.ecommerce.model.Order;
import com.ecommerce.model.Product;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public AnalyticsService(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    public OverviewDTO getOverview() {
        List<Order> allOrders = orderRepository.findAll();

        // Exclude cancelled orders from overview calculations
        List<Order> validOrders = allOrders.stream()
                .filter(o -> o.getStatus() != null && !"CANCELLED".equalsIgnoreCase(o.getStatus().trim()))
                .collect(Collectors.toList());

        double totalRevenue = validOrders.stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();

        long totalOrders = validOrders.size();

        double averageOrderValue = totalOrders > 0
                ? Math.round((totalRevenue / totalOrders) * 100.0) / 100.0
                : 0.0;

        long totalUniqueCustomers = validOrders.stream()
                .map(Order::getUserId)
                .filter(Objects::nonNull)
                .filter(id -> !id.trim().isEmpty())
                .distinct()
                .count();

        long lowStockProductCount = productRepository.findAll().stream()
                .filter(p -> p.getStockQuantity() < 10)
                .count();

        return new OverviewDTO(
                Math.round(totalRevenue * 100.0) / 100.0,
                totalOrders,
                averageOrderValue,
                totalUniqueCustomers,
                lowStockProductCount
        );
    }

    public SalesAnalyticsDTO getSalesAnalytics(String range) {
        int days = parseRangeToDays(range);
        long dayMs = 86400000L;
        long now = System.currentTimeMillis();

        long currentPeriodStartMs = now - ((long) days * dayMs);
        long previousPeriodStartMs = now - ((long) days * 2 * dayMs);

        // Fetch orders from repository (filtered by createdAt)
        List<Order> rawCurrentPeriodOrders = orderRepository.findOrdersCreatedAfter(currentPeriodStartMs);
        List<Order> rawPreviousPeriodOrders = orderRepository.findOrdersBetween(previousPeriodStartMs, currentPeriodStartMs);

        // Filter valid (non-cancelled) orders for sales calculations
        List<Order> currentOrders = rawCurrentPeriodOrders.stream()
                .filter(o -> o.getStatus() != null && !"CANCELLED".equalsIgnoreCase(o.getStatus().trim()))
                .collect(Collectors.toList());

        List<Order> previousOrders = rawPreviousPeriodOrders.stream()
                .filter(o -> o.getStatus() != null && !"CANCELLED".equalsIgnoreCase(o.getStatus().trim()))
                .collect(Collectors.toList());

        double currentRevenue = currentOrders.stream().mapToDouble(Order::getTotalAmount).sum();
        double previousRevenue = previousOrders.stream().mapToDouble(Order::getTotalAmount).sum();

        double growthPercentage = 0.0;
        if (previousRevenue > 0) {
            growthPercentage = Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100.0 * 100.0) / 100.0;
        }

        // 1. Sales over time (fill days with no orders as 0)
        ZoneId zone = ZoneId.systemDefault();
        LocalDate endDate = LocalDate.now(zone);
        LocalDate startDate = endDate.minusDays(days - 1);

        Map<String, List<Order>> ordersByDate = currentOrders.stream()
                .collect(Collectors.groupingBy(o -> {
                    LocalDate ld = Instant.ofEpochMilli(o.getCreatedAt()).atZone(zone).toLocalDate();
                    return ld.format(DATE_FORMATTER);
                }));

        List<SalesPointDTO> salesOverTime = new ArrayList<>();
        LocalDate cursor = startDate;
        while (!cursor.isAfter(endDate)) {
            String dateStr = cursor.format(DATE_FORMATTER);
            List<Order> dayOrders = ordersByDate.getOrDefault(dateStr, Collections.emptyList());

            double dayRevenue = dayOrders.stream().mapToDouble(Order::getTotalAmount).sum();
            long dayOrderCount = dayOrders.size();

            salesOverTime.add(new SalesPointDTO(
                    dateStr,
                    Math.round(dayRevenue * 100.0) / 100.0,
                    dayOrderCount
            ));
            cursor = cursor.plusDays(1);
        }

        // 2. Top 5 products by quantity sold
        Map<String, ProductAccumulator> productMap = new HashMap<>();
        for (Order order : currentOrders) {
            if (order.getItems() != null) {
                for (CartItem item : order.getItems()) {
                    String pId = item.getProductId() != null ? item.getProductId() : item.getProductName();
                    ProductAccumulator acc = productMap.computeIfAbsent(pId, k ->
                            new ProductAccumulator(pId, item.getProductName() != null ? item.getProductName() : "Product " + pId));
                    acc.quantity += item.getQuantity();
                    acc.revenue += item.getPrice() * item.getQuantity();
                }
            }
        }

        List<TopProductDTO> topProducts = productMap.values().stream()
                .sorted((a, b) -> Long.compare(b.quantity, a.quantity))
                .limit(5)
                .map(acc -> new TopProductDTO(
                        acc.productId,
                        acc.name,
                        acc.quantity,
                        Math.round(acc.revenue * 100.0) / 100.0
                ))
                .collect(Collectors.toList());

        // 3. Revenue by Category
        Map<String, Double> categoryMap = new HashMap<>();
        for (Order order : currentOrders) {
            if (order.getItems() != null) {
                for (CartItem item : order.getItems()) {
                    String category = item.getCategory() != null && !item.getCategory().trim().isEmpty()
                            ? item.getCategory().trim()
                            : "General";
                    categoryMap.merge(category, item.getPrice() * item.getQuantity(), Double::sum);
                }
            }
        }

        List<CategorySalesDTO> categorySales = categoryMap.entrySet().stream()
                .map(entry -> new CategorySalesDTO(entry.getKey(), Math.round(entry.getValue() * 100.0) / 100.0))
                .sorted((a, b) -> Double.compare(b.getRevenue(), a.getRevenue()))
                .collect(Collectors.toList());

        // 4. Order status breakdown (includes ALL statuses including CANCELLED)
        Map<String, Long> statusBreakdown = new LinkedHashMap<>();
        statusBreakdown.put("PENDING", 0L);
        statusBreakdown.put("PROCESSING", 0L);
        statusBreakdown.put("SHIPPED", 0L);
        statusBreakdown.put("DELIVERED", 0L);
        statusBreakdown.put("CANCELLED", 0L);

        Map<String, Long> actualCounts = rawCurrentPeriodOrders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getStatus() != null ? o.getStatus().toUpperCase().trim() : "PROCESSING",
                        Collectors.counting()
                ));

        actualCounts.forEach(statusBreakdown::put);

        return new SalesAnalyticsDTO(
                range,
                Math.round(currentRevenue * 100.0) / 100.0,
                Math.round(previousRevenue * 100.0) / 100.0,
                growthPercentage,
                salesOverTime,
                topProducts,
                categorySales,
                statusBreakdown
        );
    }

    private int parseRangeToDays(String range) {
        if (range == null) return 30;
        String cleaned = range.trim().toLowerCase();
        if ("7d".equals(cleaned)) return 7;
        if ("90d".equals(cleaned)) return 90;
        return 30;
    }

    private static class ProductAccumulator {
        String productId;
        String name;
        long quantity = 0;
        double revenue = 0.0;

        ProductAccumulator(String productId, String name) {
            this.productId = productId;
            this.name = name;
        }
    }
}

package com.ecommerce.service;

import com.ecommerce.dto.OrderRequest;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.model.Cart;
import com.ecommerce.model.CartItem;
import com.ecommerce.model.Order;
import com.ecommerce.model.Product;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository,
                        CartService cartService,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.productRepository = productRepository;
    }

    public Order createOrder(String userId, String userEmail, OrderRequest request) {
        Cart cart = cartService.getCart(userId);

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot create an order from an empty cart");
        }

        // Validate stock and prepare order items
        List<CartItem> orderItems = new ArrayList<>();
        double totalAmount = 0.0;

        for (CartItem item : cart.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + item.getProductName()));

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new BadRequestException("Insufficient inventory for: " + product.getName() + " (available: " + product.getStockQuantity() + ")");
            }

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);

            orderItems.add(new CartItem(
                    product.getId(),
                    product.getName(),
                    product.getCategory(),
                    product.getPrice(),
                    product.getImageUrl(),
                    item.getQuantity()
            ));

            totalAmount += product.getPrice() * item.getQuantity();
        }

        Order order = new Order();
        order.setUserId(userId);
        order.setUserEmail(userEmail);
        order.setItems(orderItems);
        order.setTotalAmount(Math.round(totalAmount * 100.0) / 100.0);
        order.setShippingAddress(request.getShippingAddress().trim());
        order.setStatus("PROCESSING");
        order.setCreatedAt(System.currentTimeMillis());

        Order savedOrder = orderRepository.save(order);

        // Empty customer cart after successful order creation
        cartService.clearCart(userId);

        return savedOrder;
    }

    public List<Order> getUserOrders(String userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(String orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
    }

    public Order updateOrderStatus(String orderId, String newStatus) {
        Order order = getOrderById(orderId);
        order.setStatus(newStatus.toUpperCase().trim());
        return orderRepository.save(order);
    }
}

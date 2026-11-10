package com.ecommerce.controller;

import com.ecommerce.dto.ApiResponse;
import com.ecommerce.dto.OrderRequest;
import org.springframework.security.access.AccessDeniedException;
import com.ecommerce.model.Order;
import com.ecommerce.model.User;
import com.ecommerce.service.AuthService;
import com.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final AuthService authService;

    public OrderController(OrderService orderService, AuthService authService) {
        this.orderService = orderService;
        this.authService = authService;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        return authService.getCurrentUserByEmail(authentication.getName());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Order>> createOrder(@Valid @RequestBody OrderRequest request,
                                                          Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Order order = orderService.createOrder(user.getId(), user.getEmail(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Order placed successfully", order));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<Order>>> getUserOrders(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        List<Order> orders = orderService.getUserOrders(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("User orders retrieved", orders));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Order>>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(ApiResponse.ok("All system orders retrieved", orders));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Order>> getOrderById(@PathVariable String id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Order order = orderService.getOrderById(id);

        boolean isAdmin = "ROLE_ADMIN".equals(user.getRole());
        if (!isAdmin && !order.getUserId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You are not authorized to view this order");
        }

        return ResponseEntity.ok(ApiResponse.ok("Order retrieved", order));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Order>> updateOrderStatus(@PathVariable String id,
                                                                @RequestParam String status) {
        Order updated = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Order status updated", updated));
    }
}

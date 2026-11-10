package com.ecommerce.controller;

import com.ecommerce.dto.ApiResponse;
import com.ecommerce.dto.CartItemRequest;
import com.ecommerce.model.Cart;
import com.ecommerce.model.User;
import com.ecommerce.service.AuthService;
import com.ecommerce.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class CartController {

    private final CartService cartService;
    private final AuthService authService;

    public CartController(CartService cartService, AuthService authService) {
        this.cartService = cartService;
        this.authService = authService;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        return authService.getCurrentUserByEmail(authentication.getName());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Cart>> getCart(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Cart cart = cartService.getCart(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Cart retrieved successfully", cart));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Cart>> addItemToCart(@Valid @RequestBody CartItemRequest request,
                                                           Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Cart cart = cartService.addItemToCart(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Item added to cart", cart));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<ApiResponse<Cart>> updateItemQuantity(@PathVariable String productId,
                                                                @RequestParam int quantity,
                                                                Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Cart cart = cartService.updateItemQuantity(user.getId(), productId, quantity);
        return ResponseEntity.ok(ApiResponse.ok("Cart updated", cart));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Cart>> removeItemFromCart(@PathVariable String productId,
                                                                Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Cart cart = cartService.removeItemFromCart(user.getId(), productId);
        return ResponseEntity.ok(ApiResponse.ok("Item removed from cart", cart));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        cartService.clearCart(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Cart cleared successfully", null));
    }
}

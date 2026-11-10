package com.ecommerce.service;

import com.ecommerce.dto.ProductDto;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.model.Product;
import com.ecommerce.repository.ProductRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @PostConstruct
    public void seedInitialProducts() {
        try {
            List<Product> existing = productRepository.findAll();
            if (existing.isEmpty()) {
                log.info("Products collection is empty. Seeding initial e-commerce catalog...");
                seedSampleProduct("Aura Wireless Noise-Cancelling Headphones",
                        "Premium active noise cancellation with 40-hour battery life and spatial audio.",
                        299.99, "Audio",
                        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", 45);
                seedSampleProduct("Apex Mechanical Gaming Keyboard",
                        "Custom hot-swappable tactile switches with per-key RGB backlighting.",
                        149.50, "Electronics",
                        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80", 30);
                seedSampleProduct("Horizon Minimalist Chronograph",
                        "Sapphire crystal glass, Japanese quartz movement, and genuine Italian leather strap.",
                        189.00, "Accessories",
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80", 20);
                seedSampleProduct("Merino Wool Oversized Knit Sweater",
                        "Ultra-soft 100% ethically sourced Merino wool in heather charcoal.",
                        119.00, "Apparel",
                        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80", 55);
                seedSampleProduct("Terra Carbon Fiber Running Sneakers",
                        "Engineered mesh upper with responsive carbon propulsion plate.",
                        179.99, "Footwear",
                        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", 40);
                seedSampleProduct("Lumina Smart Ambient Desk Lamp",
                        "Circadian rhythm matching lighting with wireless fast-charging base.",
                        89.00, "Smart Home",
                        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80", 60);
                seedSampleProduct("Ultra HD Ergonomic Curved Monitor 34\"",
                        "144Hz refresh rate, 1ms response, 21:9 ultrawide IPS panel with USB-C 90W PD.",
                        499.00, "Electronics",
                        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80", 15);
                seedSampleProduct("Titanium EDC Everyday Pocket Knife",
                        "CPM-S35VN powder steel blade with stonewashed titanium handle.",
                        95.00, "Accessories",
                        "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=800&q=80", 35);
            }
        } catch (Exception e) {
            log.warn("Could not seed sample products on startup: {}", e.getMessage());
        }
    }

    private void seedSampleProduct(String name, String desc, double price, String category, String img, int stock) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(desc);
        p.setPrice(price);
        p.setCategory(category);
        p.setImageUrl(img);
        p.setStockQuantity(stock);
        p.setCreatedAt(System.currentTimeMillis());
        productRepository.save(p);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    public Product getProductById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    public Product createProduct(ProductDto dto) {
        Product product = new Product();
        product.setName(dto.getName().trim());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setCategory(dto.getCategory().trim());
        product.setImageUrl(dto.getImageUrl());
        product.setStockQuantity(dto.getStockQuantity());
        product.setCreatedAt(System.currentTimeMillis());

        return productRepository.save(product);
    }

    public Product updateProduct(String id, ProductDto dto) {
        Product product = getProductById(id);

        product.setName(dto.getName().trim());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setCategory(dto.getCategory().trim());
        product.setImageUrl(dto.getImageUrl());
        product.setStockQuantity(dto.getStockQuantity());

        return productRepository.save(product);
    }

    public void deleteProduct(String id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }
}

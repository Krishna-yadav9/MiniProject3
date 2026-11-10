package com.ecommerce.controller;

import com.ecommerce.dto.ApiResponse;
import com.ecommerce.dto.OverviewDTO;
import com.ecommerce.dto.SalesAnalyticsDTO;
import com.ecommerce.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OverviewDTO>> getOverview() {
        OverviewDTO overview = analyticsService.getOverview();
        return ResponseEntity.ok(ApiResponse.ok("Analytics overview retrieved successfully", overview));
    }

    @GetMapping("/sales")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SalesAnalyticsDTO>> getSales(
            @RequestParam(value = "range", defaultValue = "30d") String range) {
        SalesAnalyticsDTO sales = analyticsService.getSalesAnalytics(range);
        return ResponseEntity.ok(ApiResponse.ok("Sales analytics retrieved successfully for range: " + range, sales));
    }
}

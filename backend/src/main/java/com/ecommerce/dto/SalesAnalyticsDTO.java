package com.ecommerce.dto;

import java.util.List;
import java.util.Map;

public class SalesAnalyticsDTO {
    private String range;
    private double currentRevenue;
    private double previousRevenue;
    private double growthPercentage;
    private List<SalesPointDTO> salesOverTime;
    private List<TopProductDTO> topProducts;
    private List<CategorySalesDTO> categorySales;
    private Map<String, Long> statusBreakdown;

    public SalesAnalyticsDTO() {
    }

    public SalesAnalyticsDTO(String range, double currentRevenue, double previousRevenue, double growthPercentage,
                             List<SalesPointDTO> salesOverTime, List<TopProductDTO> topProducts,
                             List<CategorySalesDTO> categorySales, Map<String, Long> statusBreakdown) {
        this.range = range;
        this.currentRevenue = currentRevenue;
        this.previousRevenue = previousRevenue;
        this.growthPercentage = growthPercentage;
        this.salesOverTime = salesOverTime;
        this.topProducts = topProducts;
        this.categorySales = categorySales;
        this.statusBreakdown = statusBreakdown;
    }

    public String getRange() {
        return range;
    }

    public void setRange(String range) {
        this.range = range;
    }

    public double getCurrentRevenue() {
        return currentRevenue;
    }

    public void setCurrentRevenue(double currentRevenue) {
        this.currentRevenue = currentRevenue;
    }

    public double getPreviousRevenue() {
        return previousRevenue;
    }

    public void setPreviousRevenue(double previousRevenue) {
        this.previousRevenue = previousRevenue;
    }

    public double getGrowthPercentage() {
        return growthPercentage;
    }

    public void setGrowthPercentage(double growthPercentage) {
        this.growthPercentage = growthPercentage;
    }

    public List<SalesPointDTO> getSalesOverTime() {
        return salesOverTime;
    }

    public void setSalesOverTime(List<SalesPointDTO> salesOverTime) {
        this.salesOverTime = salesOverTime;
    }

    public List<TopProductDTO> getTopProducts() {
        return topProducts;
    }

    public void setTopProducts(List<TopProductDTO> topProducts) {
        this.topProducts = topProducts;
    }

    public List<CategorySalesDTO> getCategorySales() {
        return categorySales;
    }

    public void setCategorySales(List<CategorySalesDTO> categorySales) {
        this.categorySales = categorySales;
    }

    public Map<String, Long> getStatusBreakdown() {
        return statusBreakdown;
    }

    public void setStatusBreakdown(Map<String, Long> statusBreakdown) {
        this.statusBreakdown = statusBreakdown;
    }
}

package com.ecommerce.dto;

public class OverviewDTO {
    private double totalRevenue;
    private long totalOrders;
    private double averageOrderValue;
    private long totalUniqueCustomers;
    private long lowStockProductCount;

    public OverviewDTO() {
    }

    public OverviewDTO(double totalRevenue, long totalOrders, double averageOrderValue, long totalUniqueCustomers, long lowStockProductCount) {
        this.totalRevenue = totalRevenue;
        this.totalOrders = totalOrders;
        this.averageOrderValue = averageOrderValue;
        this.totalUniqueCustomers = totalUniqueCustomers;
        this.lowStockProductCount = lowStockProductCount;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public double getAverageOrderValue() {
        return averageOrderValue;
    }

    public void setAverageOrderValue(double averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }

    public long getTotalUniqueCustomers() {
        return totalUniqueCustomers;
    }

    public void setTotalUniqueCustomers(long totalUniqueCustomers) {
        this.totalUniqueCustomers = totalUniqueCustomers;
    }

    public long getLowStockProductCount() {
        return lowStockProductCount;
    }

    public void setLowStockProductCount(long lowStockProductCount) {
        this.lowStockProductCount = lowStockProductCount;
    }
}

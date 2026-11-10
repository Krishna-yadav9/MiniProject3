package com.ecommerce.dto;

public class SalesPointDTO {
    private String date;
    private double revenue;
    private long orders;

    public SalesPointDTO() {
    }

    public SalesPointDTO(String date, double revenue, long orders) {
        this.date = date;
        this.revenue = revenue;
        this.orders = orders;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public double getRevenue() {
        return revenue;
    }

    public void setRevenue(double revenue) {
        this.revenue = revenue;
    }

    public long getOrders() {
        return orders;
    }

    public void setOrders(long orders) {
        this.orders = orders;
    }
}

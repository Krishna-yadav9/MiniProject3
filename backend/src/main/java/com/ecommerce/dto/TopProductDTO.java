package com.ecommerce.dto;

public class TopProductDTO {
    private String productId;
    private String name;
    private long quantitySold;
    private double revenue;

    public TopProductDTO() {
    }

    public TopProductDTO(String productId, String name, long quantitySold, double revenue) {
        this.productId = productId;
        this.name = name;
        this.quantitySold = quantitySold;
        this.revenue = revenue;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public long getQuantitySold() {
        return quantitySold;
    }

    public void setQuantitySold(long quantitySold) {
        this.quantitySold = quantitySold;
    }

    public double getRevenue() {
        return revenue;
    }

    public void setRevenue(double revenue) {
        this.revenue = revenue;
    }
}

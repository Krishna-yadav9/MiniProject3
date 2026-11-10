package com.ecommerce.repository;

import com.ecommerce.model.Product;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class ProductRepository {

    private static final Logger log = LoggerFactory.getLogger(ProductRepository.class);
    private static final String COLLECTION_NAME = "products";
    private final Firestore firestore;
    private final Map<String, Product> fallbackCache = new ConcurrentHashMap<>();

    public ProductRepository(Firestore firestore) {
        this.firestore = firestore;
        seedFallbackProducts();
    }

    private void seedFallbackProducts() {
        long now = System.currentTimeMillis();

        Object[][] rawProducts = {
            // ID, Name, Description, Price, Category, ImageURL, Stock
            {"prod-001", "Aura Wireless Noise-Cancelling Headphones", "Premium active noise cancellation with 40-hour battery life and spatial audio.", 299.99, "Audio", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", 45},
            {"prod-002", "Apex Mechanical Gaming Keyboard", "Custom hot-swappable tactile switches with per-key RGB backlighting.", 149.50, "Electronics", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80", 30},
            {"prod-003", "Horizon Minimalist Chronograph Watch", "Sapphire crystal glass, Japanese quartz movement, and genuine Italian leather strap.", 189.00, "Accessories", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80", 6}, // Low stock
            {"prod-004", "Merino Wool Oversized Knit Sweater", "Ultra-soft 100% ethically sourced Merino wool in heather charcoal.", 119.00, "Apparel", "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80", 55},
            {"prod-005", "Terra Carbon Fiber Running Sneakers", "Engineered mesh upper with responsive carbon propulsion plate.", 179.99, "Footwear", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", 40},
            {"prod-006", "Lumina Smart Ambient Desk Lamp", "Circadian rhythm matching lighting with wireless fast-charging base.", 89.00, "Smart Home", "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80", 4}, // Low stock
            {"prod-007", "ProSound Studio Monitor Speakers", "Bi-amplified studio monitors for high-fidelity audio production.", 349.00, "Audio", "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80", 18},
            {"prod-008", "UltraView 34-Inch Curved Monitor", "144Hz WQHD curved IPS display with HDR400 and USB-C hub.", 599.99, "Electronics", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80", 12},
            {"prod-009", "Minimalist Leather Cardholder", "Full-grain vegetable-tanned leather RFID blocking wallet.", 45.00, "Accessories", "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80", 85},
            {"prod-010", "Waterproof Shell Hiking Jacket", "Breathable 3-layer GORE-TEX stormproof jacket for outdoor trails.", 229.00, "Apparel", "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80", 22},
            {"prod-011", "Velocity Cushioned Road Trainers", "Lightweight daily mileage running shoes with high energy return foam.", 129.95, "Footwear", "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80", 38},
            {"prod-012", "NestControl Smart Thermostat Pro", "AI-driven temperature scheduling with voice assistant integration.", 199.00, "Smart Home", "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80", 3}, // Low stock
            {"prod-013", "SonicBuds True Wireless Earbuds", "Active noise cancellation with wireless charging case and IPX7 rating.", 129.00, "Audio", "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80", 50},
            {"prod-014", "ErgoComfort Mesh Task Chair", "Adjustable lumbar support ergonomic swivel chair for modern workspaces.", 279.00, "Office", "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=800&q=80", 15},
            {"prod-015", "Vanguard Leather Messenger Bag", "Handcrafted briefcase with padded laptop sleeve and brass hardware.", 210.00, "Accessories", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80", 8}, // Low stock
            {"prod-016", "Classic Organic Cotton Hoodie", "Heavyweight 450gsm French terry cotton hoodie in neutral cream.", 85.00, "Apparel", "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80", 64},
            {"prod-017", "TrailBlazer Waterproof Hiking Boots", "Vibram rubber outsole ankle support boots for rugged terrain.", 165.00, "Footwear", "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80", 29},
            {"prod-018", "AuraGlow Smart LED Strip Lights", "16 million colors light strip synced to television audio and smart home.", 49.99, "Smart Home", "https://images.unsplash.com/photo-1550985616-10810253b84d?w=800&q=80", 72},
            {"prod-019", "HiFi DAC Headphone Amplifier", "High-resolution desktop USB DAC for audiophile studio headphones.", 189.95, "Audio", "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80", 14},
            {"prod-020", "Precision Wireless Laser Mouse", "Ergonomic multi-device Bluetooth mouse with hyper-fast scroll wheel.", 89.99, "Electronics", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80", 41},
            {"prod-021", "Polarized Aviator Sunglasses", "UV400 titanium frame polarized lenses for glare reduction.", 120.00, "Accessories", "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80", 33},
            {"prod-022", "Performance Training Gym Shorts", "4-way stretch moisture-wicking athletic shorts with zipped pockets.", 48.00, "Apparel", "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80", 90},
            {"prod-023", "Urban Leather Low-Top Sneakers", "Sleek calfskin leather sneakers with durable rubber cupsole.", 145.00, "Footwear", "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80", 25},
            {"prod-024", "Smart Security Camera Outdoor 2K", "Solar powered weather-resistant AI motion detection camera.", 139.99, "Smart Home", "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=800&q=80", 5}, // Low stock
            {"prod-025", "Vintage Turntable Vinyl Player", "Belt-driven 3-speed record player with built-in Bluetooth speaker.", 159.00, "Audio", "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=800&q=80", 9}, // Low stock
            {"prod-026", "Dual Monitor Aluminum Mount Arm", "Full motion gas spring dual screen desk mount clamp.", 79.99, "Office", "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80", 35},
            {"prod-027", "Titanium Everyday Carry Pen", "CNC machined solid titanium bolt-action pocket pen.", 65.00, "Accessories", "https://images.unsplash.com/photo-1585336261026-6757f5f28ed7?w=800&q=80", 48},
            {"prod-028", "Tech Fleece Zip Track Jacket", "Thermal zip jacket engineered for mobility and climate insulation.", 110.00, "Apparel", "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80", 27},
            {"prod-029", "Suede Chelsea Boots Tan", "Handcrafted Italian suede boots with elastic side goring.", 195.00, "Footwear", "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80", 19},
            {"prod-030", "Smart Keyless Door Lock Touch", "Biometric fingerprint & keypad entry smart deadbolt lock.", 179.00, "Smart Home", "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80", 11},
            {"prod-031", "Waterproof Bluetooth Travel Speaker", "360-degree sound shockproof portable speaker with 20h playtime.", 79.00, "Audio", "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80", 62},
            {"prod-032", "Ultra-Slim Mechanical Numpad", "Wireless numeric keypad with aluminum frame for accountants & coders.", 59.00, "Electronics", "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80", 31},
            {"prod-033", "Wool Blend Winter Scarf", "Superfine Lambswool fringed unisex scarf in camel tan.", 55.00, "Accessories", "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&q=80", 42},
            {"prod-034", "Tailored Linen Button-Down Shirt", "100% European flax breathable tailored fit summer shirt.", 78.00, "Apparel", "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80", 39},
            {"prod-035", "Cushioned Slip-On Recovery Sandals", "Post-workout arch support foam sandals for foot relief.", 42.00, "Footwear", "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80", 70},
            {"prod-036", "Smart WiFi Air Purifier HEPA", "True HEPA filtration air purifier for smoke, pollen, and pet dander.", 149.00, "Smart Home", "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80", 16},
            {"prod-037", "Noise-Isolating In-Ear Earphones", "Braided cable high resolution dynamic driver monitor earphones.", 89.00, "Audio", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", 23},
            {"prod-038", "4K Ultra HD Webcam Pro", "Dual stereo microphones with auto light correction and privacy shutter.", 99.00, "Electronics", "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&q=80", 47},
            {"prod-039", "Canvas Duffel Weekender Bag", "Heavy-duty waxed canvas travel bag with leather accents.", 135.00, "Accessories", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80", 2, }, // Low stock
            {"prod-040", "Raw Denim Selvedge Jeans", "14oz Japanese indigo selvedge straight leg jeans.", 158.00, "Apparel", "https://images.unsplash.com/photo-1542272604-780c36856d62?w=800&q=80", 30},
            {"prod-041", "Waterproof Trail Running Shoes", "GORE-TEX membrane lugged outsole all-terrain running shoes.", 155.00, "Footwear", "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80", 21},
            {"prod-042", "Smart Robot Vacuum & Mop Combo", "LiDAR navigation obstacle avoidance automated home vacuum.", 399.00, "Smart Home", "https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?w=800&q=80", 8}, // Low stock
            {"prod-043", "Wireless Gaming Headset 7.1", "Low latency 2.4GHz surround sound gaming headset with boom mic.", 169.00, "Gaming", "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80", 33},
            {"prod-044", "RGB Mechanical Gaming Mouse Pad", "Micro-textured cloth surface with 12 customizable lighting zones.", 34.99, "Gaming", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80", 80},
            {"prod-045", "Stainless Steel Thermal Water Bottle", "Vacuum insulated 32oz flask keeps liquids cold 24 hours.", 38.00, "Fitness", "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80", 95},
            {"prod-046", "High-Density Foam Yoga Mat", "Non-slip alignment lines eco-friendly TPE exercise mat.", 49.00, "Fitness", "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80", 50},
            {"prod-047", "Pour-Over Ceramic Coffee Maker", "Borosilicate glass carafe with stainless steel permanent filter.", 42.00, "Kitchen", "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80", 28},
            {"prod-048", "Precision Electric Gooseneck Kettle", "Variable temperature control 1.0L matte black electric kettle.", 89.00, "Kitchen", "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&q=80", 7}, // Low stock
            {"prod-049", "Cast Iron Dutch Oven 6-Quart", "Enamel coated heavy duty Dutch oven for slow roasting.", 119.00, "Kitchen", "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80", 14},
            {"prod-050", "Professional Chef Knife 8-Inch", "High carbon German steel razor sharp kitchen knife.", 75.00, "Kitchen", "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&q=80", 40},
            {"prod-051", "Ergonomic Under-Desk Footrest", "Memory foam dual-position foot rest cushion for office desks.", 39.99, "Office", "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=800&q=80", 66},
            {"prod-052", "Felt Desk Mat Large Mousepad", "Natural wool felt desk pad protector for keyboard and laptop.", 32.00, "Office", "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80", 52},
            {"prod-053", "Wireless Charging Pad Stand", "15W fast charger compatible with iOS and Android devices.", 29.99, "Electronics", "https://images.unsplash.com/photo-1622445268465-8378c6922e39?w=800&q=80", 88},
            {"prod-054", "Noise-Cancelling USB Podcast Mic", "Studio condenser microphone with cardioid pickup for streaming.", 129.00, "Audio", "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80", 17},
            {"prod-055", "Adjustable Dumbbell Set 50lbs", "Quick dial weight selection dumbbells for home workouts.", 299.00, "Fitness", "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80", 9}, // Low stock
            {"prod-056", "Smart Fitness Tracker Watch", "Heart rate, SpO2, sleep monitor with 14-day battery life.", 89.00, "Fitness", "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80", 45},
            {"prod-057", "Compact Espresso Machine 15-Bar", "Italian pump espresso maker with milk frothing steam wand.", 169.00, "Kitchen", "https://images.unsplash.com/photo-1517668808822-9e428824603b?w=800&q=80", 11},
            {"prod-058", "Acoustic Guitar Starter Pack", "Full-size dreadnought acoustic guitar with tuner and gig bag.", 159.00, "Audio", "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80", 6}, // Low stock
            {"prod-059", "Ultra-Lightweight Camping Hammock", "Parachute nylon double hammock with tree straps and carabiners.", 36.00, "Fitness", "https://images.unsplash.com/photo-1445307806294-bff7f67ff225?w=800&q=80", 75},
            {"prod-060", "Digital Air Fryer XL 5.8-Quart", "Touchscreen 8 preset cooking functions oil-less air fryer.", 99.99, "Kitchen", "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80", 22},
            {"prod-061", "Pro Gaming Controller Wireless", "Hall effect anti-drift joysticks with rear remappable paddles.", 89.99, "Gaming", "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&q=80", 38},
            {"prod-062", "Smart RGB Gaming Desk 55-Inch", "Carbon fiber texture motorized standing desk with cable management.", 329.00, "Gaming", "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80", 13}
        };

        for (Object[] item : rawProducts) {
            Product p = new Product(
                (String) item[0],
                (String) item[1],
                (String) item[2],
                (Double) item[3],
                (String) item[4],
                (String) item[5],
                (Integer) item[6],
                now
            );
            fallbackCache.put(p.getId(), p);
        }
    }

    public Product save(Product product) {
        if (product.getId() == null || product.getId().trim().isEmpty()) {
            product.setId("prod-" + System.currentTimeMillis());
        }
        if (product.getCreatedAt() <= 0) {
            product.setCreatedAt(System.currentTimeMillis());
        }
        fallbackCache.put(product.getId(), product);

        if (firestore != null) {
            try {
                firestore.collection(COLLECTION_NAME).document(product.getId()).set(product).get();
            } catch (Exception e) {
                log.info("Firestore operation using local product cache: {}", product.getId());
            }
        }
        return product;
    }

    public Optional<Product> findById(String id) {
        if (firestore != null) {
            try {
                DocumentSnapshot snapshot = firestore.collection(COLLECTION_NAME).document(id).get().get();
                if (snapshot.exists()) {
                    Product product = snapshot.toObject(Product.class);
                    if (product != null) {
                        product.setId(snapshot.getId());
                        fallbackCache.put(product.getId(), product);
                        return Optional.of(product);
                    }
                }
            } catch (Exception e) {
                log.info("Firestore unavailable, retrieving from local cache: {}", id);
            }
        }
        return Optional.ofNullable(fallbackCache.get(id));
    }

    public List<Product> findAll() {
        if (firestore != null) {
            try {
                ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME).get();
                List<QueryDocumentSnapshot> documents = future.get().getDocuments();
                for (DocumentSnapshot doc : documents) {
                    Product product = doc.toObject(Product.class);
                    if (product != null) {
                        product.setId(doc.getId());
                        fallbackCache.put(product.getId(), product);
                    }
                }
                // Automatically populate Firestore if it contains fewer items than our catalog
                if (documents.size() < fallbackCache.size()) {
                    log.info("Populating Firestore collection [{}] with all {} catalog products", COLLECTION_NAME, fallbackCache.size());
                    for (Product p : fallbackCache.values()) {
                        try {
                            firestore.collection(COLLECTION_NAME).document(p.getId()).set(p);
                        } catch (Exception ignored) {}
                    }
                }
            } catch (Exception e) {
                log.info("Firestore unavailable, returning cached product list ({})", fallbackCache.size());
            }
        }
        List<Product> list = new ArrayList<>(fallbackCache.values());
        list.sort((a, b) -> a.getId().compareTo(b.getId()));
        return list;
    }

    public List<Product> findByCategory(String category) {
        if (category == null || category.trim().isEmpty() || "All".equalsIgnoreCase(category.trim())) {
            return findAll();
        }
        String cat = category.trim();
        return findAll().stream()
                .filter(p -> p.getCategory() != null && cat.equalsIgnoreCase(p.getCategory().trim()))
                .collect(Collectors.toList());
    }

    public void deleteById(String id) {
        fallbackCache.remove(id);
        if (firestore != null) {
            try {
                firestore.collection(COLLECTION_NAME).document(id).delete().get();
            } catch (Exception e) {
                log.info("Firestore delete unavailable, removed from local cache: {}", id);
            }
        }
    }

    public boolean existsById(String id) {
        return findById(id).isPresent();
    }
}

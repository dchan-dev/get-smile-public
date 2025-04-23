import csv
import random
from datetime import datetime, timedelta

# Define possible values
vinyl_types = ["Dance", "DJ Remix", "Acoustic", "Instrumental", "Orchestral", 
               "Unplugged", "Live", "Studio", "Acapella", "Dubstep", "Techno", 
               "House", "EDM", "Jazz", "Blues", "Rock", "Pop", "Hip Hop", "R&B", 
               "Soul", "Classical", "Country", "Folk", "Reggae", "Funk", "Disco",
               "Ambient", "Lofi", "Synthwave", "Vaporwave", "Trap", "Drill", 
               "Indie", "Alternative", "Metal", "Punk", "Grunge", "Psychedelic",
               "Experimental", "Fusion", "Bossa Nova", "Salsa", "Flamenco", "Tango"]

adjectives = ["Deluxe", "Premium", "Limited", "Collector's", "Special", "Rare", 
              "Exclusive", "Signature", "Anniversary", "Platinum", "Gold", "Silver",
              "Diamond", "Crystal", "Vintage", "Classic", "Modern", "Ultra", "Super",
              "Mega", "Hyper", "Extended", "Enhanced", "Remastered", "Definitive"]

sizes = ["7 inch", "10 inch", "12 inch"]

# Generate a start date for model numbers
start_date = datetime(2023, 1, 1)

# Open CSV file for writing
with open('/mnt/c/Users/USER/workspace/get-smile/product.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['Name', 'Model Number', 'Serial Number', 'SKU'])
    
    for i in range(1, 1001):
        # Generate name
        adj = random.choice(adjectives)
        vinyl_type = random.choice(vinyl_types)
        name = f"Smile {adj} {vinyl_type} Extension"
        
        # Generate model number (date-based)
        model_date = start_date + timedelta(days=random.randint(0, 365))
        model_date_str = model_date.strftime("%Y%m%d")
        model_series = str(random.randint(1, 5)).zfill(3)
        model_num = str(i).zfill(3)
        model_number = f"{model_date_str}-{model_series}-{model_num}"
        
        # Generate serial number
        prefix = random.choice(["LX", "SX", "DX", "VX", "EX"])
        middle = ''.join(random.choices('0123456789ABCDEF', k=10))
        suffix = ''.join(random.choices('0123456789', k=2))
        serial_number = f"{prefix}{middle}{suffix}"
        
        # Select SKU (size)
        sku = random.choice(sizes)
        
        # Write row to CSV
        writer.writerow([name, model_number, serial_number, sku])

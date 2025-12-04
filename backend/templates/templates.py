from typing import Dict, List

TEMPLATES = {
    # --- TECHNICAL ---
    "technical_cover": {
        "id": "technical_cover",
        "name": "Tech Guide Cover",
        "category": "technical",
        "type": "cover",
        "html": """
<div style="width: 800px; height: 1000px; background: #1e1e1e; color: #ffffff; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; position: relative; overflow: hidden;">
    <div style="position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: #007acc; border-radius: 50%; opacity: 0.2;"></div>
    <div style="position: absolute; bottom: -50px; left: -50px; width: 300px; height: 300px; background: #007acc; border-radius: 50%; opacity: 0.1;"></div>
    
    <div style="margin-top: 150px; padding: 0 60px; z-index: 10;">
        <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #007acc; font-weight: 600;">Technical Guide</div>
        <h1 style="font-size: 64px; font-weight: 800; margin: 20px 0; line-height: 1.1;">{title}</h1>
        <h2 style="font-size: 24px; font-weight: 300; color: #d4d4d4; margin: 0;">{subtitle}</h2>
    </div>
    
    <div style="margin-top: auto; padding: 60px; z-index: 10; border-top: 1px solid #333;">
        <div style="font-size: 16px; color: #888;">Author</div>
        <div style="font-size: 20px; font-weight: 600;">{author}</div>
    </div>
</div>
""",
        "css": ""
    },
    "technical_internal": {
        "id": "technical_internal",
        "name": "Tech Guide Internal",
        "category": "technical",
        "type": "internal",
        "html": """
<div style="font-family: 'Open Sans', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px;">
    <h1 style="font-family: 'Inter', sans-serif; color: #0056b3; border-bottom: 2px solid #e6f0ff; padding-bottom: 10px;">Chapter 1: Introduction</h1>
    
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    
    <div style="background: #f8f9fa; border-left: 4px solid #0056b3; padding: 15px; margin: 20px 0; font-family: 'Fira Code', monospace; font-size: 14px;">
        <code>console.log('Hello World');</code>
    </div>
    
    <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
</div>
""",
        "css": ""
    },

    # --- MAGAZINES ---
    "magazine_cover": {
        "id": "magazine_cover",
        "name": "Editorial Magazine Cover",
        "category": "magazines",
        "type": "cover",
        "html": """
<div style="width: 800px; height: 1000px; background: #ffffff; position: relative; overflow: hidden;">
    <img src="https://source.unsplash.com/random/800x1000/?fashion,portrait" style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: 0;" />
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%); z-index: 1;"></div>
    
    <div style="position: absolute; top: 40px; left: 0; width: 100%; text-align: center; z-index: 10;">
        <h1 style="font-family: 'Didot', serif; font-size: 120px; color: #ffffff; margin: 0; letter-spacing: -2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">VOGUE</h1>
    </div>
    
    <div style="position: absolute; bottom: 60px; left: 40px; z-index: 10; max-width: 600px;">
        <h2 style="font-family: 'Bodoni Moda', serif; font-size: 56px; color: #ffffff; margin: 0; line-height: 1;">{title}</h2>
        <p style="font-family: 'Lato', sans-serif; font-size: 24px; color: #f0f0f0; margin: 10px 0; font-weight: 300;">{subtitle}</p>
    </div>
</div>
""",
        "css": ""
    },
    "magazine_internal": {
        "id": "magazine_internal",
        "name": "Editorial Spread",
        "category": "magazines",
        "type": "internal",
        "html": """
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; max-width: 1000px; margin: 0 auto; padding: 40px; font-family: 'Merriweather', serif;">
    <div>
        <h1 style="font-family: 'Playfair Display', serif; font-size: 48px; margin-top: 0; line-height: 1.1;">The Art of<br>Modern Living</h1>
        <p style="font-size: 18px; line-height: 1.8;"><span style="float: left; font-size: 60px; line-height: 0.8; padding-right: 10px; font-weight: bold;">L</span>orem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum.</p>
    </div>
    <div>
        <img src="https://source.unsplash.com/random/400x600/?interior" style="width: 100%; height: auto; display: block; margin-bottom: 20px;" />
        <p style="font-size: 14px; color: #666; font-style: italic; border-left: 2px solid #000; padding-left: 10px;">"Design is not just what it looks like and feels like. Design is how it works."</p>
    </div>
</div>
""",
        "css": ""
    },

    # --- CHILDRENS ---
    "childrens_cover": {
        "id": "childrens_cover",
        "name": "Kids Story Cover",
        "category": "childrens",
        "type": "cover",
        "html": """
<div style="width: 800px; height: 1000px; background: #b5ead7; position: relative; overflow: hidden; font-family: 'Comic Neue', cursive;">
    <div style="position: absolute; bottom: 0; width: 100%; height: 300px; background: #ffdac1; border-radius: 50% 50% 0 0 / 100% 100% 0 0;"></div>
    
    <div style="text-align: center; padding-top: 100px; position: relative; z-index: 10;">
        <h1 style="font-family: 'Fredoka One', cursive; font-size: 80px; color: #ff6b6b; margin: 0; text-shadow: 3px 3px 0px #ffffff;">{title}</h1>
        <h2 style="font-size: 32px; color: #555; margin-top: 20px;">{subtitle}</h2>
    </div>
    
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 400px; height: 400px; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 10px solid #ffb7b2;">
        <span style="font-size: 24px; color: #aaa;">[Illustration Here]</span>
    </div>
</div>
""",
        "css": ""
    },
    "childrens_internal": {
        "id": "childrens_internal",
        "name": "Kids Story Page",
        "category": "childrens",
        "type": "internal",
        "html": """
<div style="background: #fff9c4; padding: 40px; border-radius: 20px; max-width: 800px; margin: 20px auto; font-family: 'Quicksand', sans-serif;">
    <img src="https://source.unsplash.com/random/800x400/?cartoon,nature" style="width: 100%; border-radius: 15px; border: 5px solid #fff;" />
    <p style="font-size: 24px; line-height: 1.6; color: #333; margin-top: 30px; text-align: center;">Once upon a time, in a land far, far away...</p>
</div>
""",
        "css": ""
    },

    # --- FASHION ---
    "fashion_cover": {
        "id": "fashion_cover",
        "name": "Fashion Blog Cover",
        "category": "fashion",
        "type": "cover",
        "html": """
<div style="width: 800px; height: 1000px; background: #f9f9f9; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 20px solid #fff; outline: 1px solid #ddd;">
    <div style="text-transform: uppercase; letter-spacing: 4px; font-size: 14px; color: #888; margin-bottom: 20px;">The Collection</div>
    <h1 style="font-family: 'Cormorant Garamond', serif; font-size: 90px; color: #1a1a1a; margin: 0; font-style: italic;">{title}</h1>
    <div style="width: 50px; height: 1px; background: #000; margin: 30px 0;"></div>
    <img src="https://source.unsplash.com/random/400x500/?fashion,minimal" style="width: 400px; height: 500px; object-fit: cover; filter: grayscale(20%);" />
    <p style="font-family: 'Montserrat', sans-serif; font-size: 16px; margin-top: 40px; letter-spacing: 1px;">{subtitle}</p>
</div>
""",
        "css": ""
    },
    "fashion_internal": {
        "id": "fashion_internal",
        "name": "Fashion Blog Post",
        "category": "fashion",
        "type": "internal",
        "html": """
<div style="max-width: 700px; margin: 0 auto; padding: 60px 20px; font-family: 'Raleway', sans-serif; text-align: center;">
    <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 42px; margin-bottom: 20px;">Summer Essentials</h2>
    <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 40px;">By Editor • June 2024</p>
    
    <p style="font-size: 18px; line-height: 1.8; color: #444; margin-bottom: 40px; text-align: left;">
        <span style="font-size: 40px; float: left; line-height: 1; padding-right: 10px; font-family: 'Cormorant Garamond', serif;">E</span>legance is not about being noticed, it's about being remembered. This season, we focus on timeless pieces that transcend trends.
    </p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <img src="https://source.unsplash.com/random/300x400/?dress" style="width: 100%;" />
        <img src="https://source.unsplash.com/random/300x400/?shoes" style="width: 100%;" />
    </div>
</div>
""",
        "css": ""
    },

    # --- ENTREPRENEURSHIP ---
    "entrepreneurship_cover": {
        "id": "entrepreneurship_cover",
        "name": "Business Book Cover",
        "category": "entrepreneurship",
        "type": "cover",
        "html": """
<div style="width: 800px; height: 1000px; background: #000000; color: #ffffff; font-family: 'Oswald', sans-serif; position: relative;">
    <div style="position: absolute; top: 0; right: 0; width: 60%; height: 100%; background: #cc0000; clip-path: polygon(20% 0, 100% 0, 100% 100%, 0% 100%);"></div>
    
    <div style="position: absolute; top: 100px; left: 50px; z-index: 10; max-width: 600px;">
        <h1 style="font-size: 100px; line-height: 0.9; text-transform: uppercase; margin: 0;">{title}</h1>
        <h2 style="font-size: 36px; color: #ffffff; background: #000; display: inline-block; padding: 5px 15px; margin-top: 20px;">{subtitle}</h2>
    </div>
    
    <div style="position: absolute; bottom: 50px; right: 50px; text-align: right; z-index: 10;">
        <div style="font-size: 24px; font-weight: 300;">BESTSELLER AUTHOR</div>
        <div style="font-size: 40px; font-weight: 700;">{author}</div>
    </div>
</div>
""",
        "css": ""
    },
    "entrepreneurship_internal": {
        "id": "entrepreneurship_internal",
        "name": "Business Chapter",
        "category": "entrepreneurship",
        "type": "internal",
        "html": """
<div style="max-width: 800px; margin: 0 auto; padding: 40px; font-family: 'Roboto', sans-serif;">
    <h2 style="font-size: 32px; font-weight: 700; color: #cc0000; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 30px;">Key Strategies</h2>
    
    <ul style="list-style: none; padding: 0;">
        <li style="background: #f5f5f5; padding: 20px; margin-bottom: 15px; border-left: 5px solid #cc0000;">
            <strong style="display: block; font-size: 18px; margin-bottom: 5px;">1. Market Analysis</strong>
            Understand your audience before building your product.
        </li>
        <li style="background: #f5f5f5; padding: 20px; margin-bottom: 15px; border-left: 5px solid #000;">
            <strong style="display: block; font-size: 18px; margin-bottom: 5px;">2. Value Proposition</strong>
            Define what makes your offer unique.
        </li>
    </ul>
</div>
""",
        "css": ""
    }
}

def get_templates_by_category(category: str = None) -> List[Dict]:
    if category:
        return [t for t in TEMPLATES.values() if t["category"] == category]
    return list(TEMPLATES.values())

def get_template_by_id(template_id: str) -> Dict:
    return TEMPLATES.get(template_id)
